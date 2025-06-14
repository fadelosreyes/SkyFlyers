<?php

namespace App\Http\Controllers;

use App\Models\Asiento;
use App\Models\Billete;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Stripe\Refund;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use App\Mail\BilletesEmail;
use Illuminate\Support\Facades\Mail;

class PagoController extends Controller
{
    public function exito(Request $request)
    {
        $sessionId = $request->input('session_id');

        // 1) Validamos que la sesión de Stripe sea la misma que guardamos en prepararPago()
        if (!$sessionId || session('stripe_session_id') !== $sessionId) {
            return redirect()
                ->route('principal')
                ->with('error', 'Sesión de pago inválida o expirada.');
        }

        // 2) Verificamos en Stripe que el pago realmente se haya completado
        Stripe::setApiKey(env('STRIPE_SECRET'));
        $stripeSession = Session::retrieve($sessionId);

        if ($stripeSession->payment_status !== 'paid') {
            return redirect()
                ->route('principal')
                ->with('error', 'El pago no se completó correctamente.');
        }

        // 3) Leemos del session() lo que guardamos en prepararPago():
        $pasajerosDatos             = session('pasajerosDatos', []);
        $cancelacionFlexibleGlobal  = session('cancelacion_flexible_global', false);

        $billetesCreados = [];

        foreach ($pasajerosDatos as $p) {
            $asientoIda    = $p['asiento_ida'] ?? null;
            $asientoVuelta = $p['asiento_vuelta'] ?? null;


            // A) BILLETE DE IDA

            if (!empty($asientoIda)) {
                $asientoObjIda = Asiento::findOrFail($asientoIda);

                $subtotalIda = $asientoObjIda->precio_base;
                $subtotalIda += (!empty($p['maleta_adicional_ida'])) ? 20 : 0;
                $subtotalIda += $cancelacionFlexibleGlobal ? 15 : 0;

                $pnrIda        = strtoupper(Str::random(10));
                $contenidoQRIda = 'PNR: ' . $pnrIda;
                $nombreArchivoQRIda = 'qrcodes/' . $pnrIda . '.svg';
                $rutaCompletaQRIda  = storage_path('app/public/' . $nombreArchivoQRIda);
                File::put(
                    $rutaCompletaQRIda,
                    QrCode::format('svg')->size(300)->generate($contenidoQRIda)
                );

                $asientoObjIda->reserva_temporal = null;
                $asientoObjIda->save();

                $billeteIda = Billete::create([
                    'user_id'               => Auth::id(),
                    'nombre_pasajero'       => $p['nombre_pasajero'],
                    'tipo_documento'        => $p['tipo_documento'],
                    'documento_identidad'   => $p['documento_identidad'],
                    'asiento_id'            => $asientoIda,
                    'codigo_QR'             => $nombreArchivoQRIda,
                    'pnr'                   => $pnrIda,
                    'recargos'              => (!empty($p['maleta_adicional_ida'])) ? 20 : 0,
                    'tarifa_base'           => (float)$asientoObjIda->precio_base,
                    'total'                 => (float)$subtotalIda,
                    'fecha_reserva'         => now(),
                    'fecha_emision'         => now(),
                    'maleta_adicional'      => !empty($p['maleta_adicional_ida']) ? 1 : 0,
                    'cancelacion_flexible'  => $cancelacionFlexibleGlobal ? 1 : 0,
                    'stripe_session_id'     => $sessionId,
                ]);

                $billetesCreados[] = $billeteIda;
            }


            // B) BILLETE DE VUELTA (si existe asiento_vuelta y es diferente al de ida)

            if (!empty($asientoVuelta)) {


                $asientoObjVuelta = Asiento::findOrFail($asientoVuelta);

                $subtotalVuelta = $asientoObjVuelta->precio_base;
                $subtotalVuelta += (!empty($p['maleta_adicional_vuelta'])) ? 20 : 0;
                $subtotalVuelta += $cancelacionFlexibleGlobal ? 15 : 0;

                $pnrVuelta        = strtoupper(Str::random(10));
                $contenidoQRVuelta = 'PNR: ' . $pnrVuelta;
                $nombreArchivoQRVuelta = 'qrcodes/' . $pnrVuelta . '.svg';
                $rutaCompletaQRVuelta  = storage_path('app/public/' . $nombreArchivoQRVuelta);
                File::put(
                    $rutaCompletaQRVuelta,
                    QrCode::format('svg')->size(300)->generate($contenidoQRVuelta)
                );

                $asientoObjVuelta->reserva_temporal = null;
                $asientoObjVuelta->save();

                $billeteVuelta = Billete::create([
                    'user_id'               => Auth::id(),
                    'nombre_pasajero'       => $p['nombre_pasajero'],
                    'tipo_documento'        => $p['tipo_documento'],
                    'documento_identidad'   => $p['documento_identidad'],
                    'asiento_id'            => $asientoVuelta,
                    'codigo_QR'             => $nombreArchivoQRVuelta,
                    'pnr'                   => $pnrVuelta,
                    'recargos'              => (!empty($p['maleta_adicional_vuelta'])) ? 20 : 0,
                    'tarifa_base'           => (float)$asientoObjVuelta->precio_base,
                    'total'                 => (float)$subtotalVuelta,
                    'fecha_reserva'         => now(),
                    'fecha_emision'         => now(),
                    'maleta_adicional'      => !empty($p['maleta_adicional_vuelta']) ? 1 : 0,
                    'cancelacion_flexible'  => $cancelacionFlexibleGlobal ? 1 : 0,
                    'stripe_session_id'     => $sessionId,
                ]);

                $billetesCreados[] = $billeteVuelta;
            }
        }


        // C) Recuperamos los billetes ya creados para enviarlos por correo y mostrarlos en pantalla

        $billetes = Billete::whereIn('id', collect($billetesCreados)->pluck('id'))
            ->with('asiento.vuelo.aeropuertoOrigen', 'asiento.vuelo.aeropuertoDestino')
            ->get();

        $billetesPlanos = $billetes->map(function ($billete) {
            return [
                'id'                    => $billete->id,
                'nombre_pasajero'       => $billete->nombre_pasajero,
                'tipo_documento'        => $billete->tipo_documento,
                'documento_identidad'   => $billete->documento_identidad,
                'asiento_numero'        => $billete->asiento->numero,
                'codigo_QR'             => $billete->codigo_QR,
                'pnr'                   => $billete->pnr,
                'tarifa_base'           => $billete->tarifa_base,
                'total'                 => $billete->total,
                'maleta_adicional'      => $billete->maleta_adicional,
                'cancelacion_flexible'  => $billete->cancelacion_flexible,
                'fecha_reserva'         => $billete->fecha_reserva,
                'vuelo_fecha_salida'    => $billete->asiento->vuelo->fecha_salida ?? null,
                'vuelo_fecha_llegada'   => $billete->asiento->vuelo->fecha_llegada ?? null,
                'aeropuerto_origen'     => $billete->asiento->vuelo->aeropuertoOrigen->nombre ?? null,
                'aeropuerto_destino'    => $billete->asiento->vuelo->aeropuertoDestino->nombre ?? null,
            ];
        });

        Mail::to(Auth::user()->email)->send(new \App\Mail\BilletesEmail($billetesPlanos));

        session()->forget(['pasajerosDatos', 'stripe_session_id', 'cancelacion_flexible_global']);

        return Inertia::render('Billete/ConfirmacionMultiple', [
            'billetes' => $billetesPlanos,
        ]);
    }

    public function cancelarVuelos($vueloId)
    {
        $billetes = Billete::whereHas('asiento', fn($q) => $q->where('vuelo_id', $vueloId))->get();

        if ($billetes->isEmpty()) {
            return back()->with('error', 'No hay billetes activos para este vuelo.');
        }

        Stripe::setApiKey(env('STRIPE_SECRET'));

        $stripeSessionId = $billetes->first()->stripe_session_id;

        try {
            $session = \Stripe\Checkout\Session::retrieve($stripeSessionId);
            $paymentIntentId = $session->payment_intent;

            \Stripe\Refund::create(['payment_intent' => $paymentIntentId]);
        } catch (\Exception $e) {
            Log::error("Error al reembolsar sesión Stripe {$stripeSessionId}: {$e->getMessage()}");
            return back()->with('error', 'No se pudo realizar el reembolso.');
        }

        $billetesParaCancelar = Billete::where('stripe_session_id', $stripeSessionId)->get();

        $errores = [];

        foreach ($billetesParaCancelar as $billete) {
            try {

                $billete->delete();

                // Liberar asiento
                if ($asiento = $billete->asiento) {
                    $asiento->estado_id = 1;
                    $asiento->save();
                }
            } catch (\Exception $e) {
                Log::error("Error en billete {$billete->id} durante cancelación: {$e->getMessage()}");
                $errores[] = "ID {$billete->id}";
            }
        }

        if (!empty($errores)) {
            return back()->with('error', 'No se pudieron cancelar algunos billetes: ' . implode(', ', $errores));
        }

        return back()->with('success', 'Todos los billetes con ese pago han sido cancelados, reembolsados y los asientos liberados.');
    }
}
