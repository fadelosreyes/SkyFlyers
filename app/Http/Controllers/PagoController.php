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

        if (!$sessionId || session('stripe_session_id') !== $sessionId) {
            return redirect()->route('principal')->with('error', 'Sesión de pago inválida o expirada.');
        }

        Stripe::setApiKey(env('STRIPE_SECRET'));
        $stripeSession = Session::retrieve($sessionId);

        if ($stripeSession->payment_status !== 'paid') {
            return redirect()->route('principal')->with('error', 'El pago no se completó correctamente.');
        }

        $pasajerosDatos = session('pasajerosDatos', []);
        $cancelacionFlexibleGlobal = session('cancelacion_flexible_global', false);

        $billetesCreados = [];

        foreach ($pasajerosDatos as $p) {
            // Crear billete para tramo ida si existe asiento_ida
            if (!empty($p['asiento_ida'])) {
                $asientoIda = Asiento::findOrFail($p['asiento_ida']);
                $subtotalIda = $asientoIda->precio_base;
                $subtotalIda += !empty($p['maleta_adicional_ida']) ? 20 : 0;
                $subtotalIda += $cancelacionFlexibleGlobal ? 15 : 0;

                $pnrIda = strtoupper(Str::random(10));
                $contenidoQRIda = 'PNR: ' . $pnrIda;
                $nombreArchivoQRIda = 'qrcodes/' . $pnrIda . '.svg';
                $rutaCompletaQRIda = storage_path('app/public/' . $nombreArchivoQRIda);
                File::put($rutaCompletaQRIda, QrCode::format('svg')->size(300)->generate($contenidoQRIda));

                $billeteIda = Billete::create([
                    'user_id' => Auth::id(),
                    'nombre_pasajero' => $p['nombre_pasajero'],
                    'tipo_documento' => $p['tipo_documento'],
                    'documento_identidad' => $p['documento_identidad'],
                    'asiento_id' => $asientoIda->id,
                    'codigo_QR' => $nombreArchivoQRIda,
                    'pnr' => $pnrIda,
                    'recargos' => 0,
                    'tarifa_base' => (float) $asientoIda->precio_base,
                    'total' => (float) $subtotalIda,
                    'fecha_reserva' => now(),
                    'fecha_emision' => now(),
                    'maleta_adicional' => !empty($p['maleta_adicional_ida']),
                    'cancelacion_flexible' => $cancelacionFlexibleGlobal,
                    'stripe_session_id' => $sessionId,
                ]);

                $asientoIda->estado_id = 2; // Reservado
                $asientoIda->save();

                $billetesCreados[] = $billeteIda;
            }

            // Crear billete para tramo vuelta si existe asiento_vuelta
            if (!empty($p['asiento_vuelta'])) {
                $asientoVuelta = Asiento::findOrFail($p['asiento_vuelta']);
                $subtotalVuelta = $asientoVuelta->precio_base;
                $subtotalVuelta += !empty($p['maleta_adicional_vuelta']) ? 20 : 0;
                $subtotalVuelta += $cancelacionFlexibleGlobal ? 15 : 0;

                $pnrVuelta = strtoupper(Str::random(10));
                $contenidoQRVuelta = 'PNR: ' . $pnrVuelta;
                $nombreArchivoQRVuelta = 'qrcodes/' . $pnrVuelta . '.svg';
                $rutaCompletaQRVuelta = storage_path('app/public/' . $nombreArchivoQRVuelta);
                File::put($rutaCompletaQRVuelta, QrCode::format('svg')->size(300)->generate($contenidoQRVuelta));

                $billeteVuelta = Billete::create([
                    'user_id' => Auth::id(),
                    'nombre_pasajero' => $p['nombre_pasajero'],
                    'tipo_documento' => $p['tipo_documento'],
                    'documento_identidad' => $p['documento_identidad'],
                    'asiento_id' => $asientoVuelta->id,
                    'codigo_QR' => $nombreArchivoQRVuelta,
                    'pnr' => $pnrVuelta,
                    'recargos' => 0,
                    'tarifa_base' => (float) $asientoVuelta->precio_base,
                    'total' => (float) $subtotalVuelta,
                    'fecha_reserva' => now(),
                    'fecha_emision' => now(),
                    'maleta_adicional' => !empty($p['maleta_adicional_vuelta']),
                    'cancelacion_flexible' => $cancelacionFlexibleGlobal,
                    'stripe_session_id' => $sessionId,
                ]);

                $asientoVuelta->estado_id = 2; // Reservado
                $asientoVuelta->save();

                $billetesCreados[] = $billeteVuelta;
            }
        }

        // Recargar billetes con relaciones para el frontend
        $billetes = Billete::whereIn('id', collect($billetesCreados)->pluck('id'))
            ->with('asiento.vuelo.aeropuertoOrigen', 'asiento.vuelo.aeropuertoDestino')
            ->get();

        $billetesPlanos = $billetes->map(function ($billete) {
            return [
                'id' => $billete->id,
                'nombre_pasajero' => $billete->nombre_pasajero,
                'tipo_documento' => $billete->tipo_documento,
                'documento_identidad' => $billete->documento_identidad,
                'asiento_numero' => $billete->asiento->numero,
                'codigo_QR' => $billete->codigo_QR,
                'pnr' => $billete->pnr,
                'tarifa_base' => $billete->tarifa_base,
                'total' => $billete->total,
                'maleta_adicional' => $billete->maleta_adicional,
                'cancelacion_flexible' => $billete->cancelacion_flexible,
                'fecha_reserva' => $billete->fecha_reserva,
                'vuelo_fecha_salida' => $billete->asiento->vuelo->fecha_salida ?? null,
                'vuelo_fecha_llegada' => $billete->asiento->vuelo->fecha_llegada ?? null,
                'aeropuerto_origen' => $billete->asiento->vuelo->aeropuertoOrigen->nombre ?? null,
                'aeropuerto_destino' => $billete->asiento->vuelo->aeropuertoDestino->nombre ?? null,
            ];
        });

        // Enviar email
        Mail::to(Auth::user()->email)->send(new BilletesEmail($billetesPlanos));

        // Limpiar sesión
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

    // Tomamos el stripe_session_id del primer billete para cancelar TODOS con ese mismo stripe_session_id
    $stripeSessionId = $billetes->first()->stripe_session_id;

    try {
        // Reembolsamos la sesión solo una vez
        $session = \Stripe\Checkout\Session::retrieve($stripeSessionId);
        $paymentIntentId = $session->payment_intent;

        \Stripe\Refund::create(['payment_intent' => $paymentIntentId]);
    } catch (\Exception $e) {
        Log::error("Error al reembolsar sesión Stripe {$stripeSessionId}: {$e->getMessage()}");
        return back()->with('error', 'No se pudo realizar el reembolso.');
    }

    // Ahora soft delete a todos los billetes con ese stripe_session_id
    $billetesParaCancelar = Billete::where('stripe_session_id', $stripeSessionId)->get();
    
    $errores = [];

    foreach ($billetesParaCancelar as $billete) {
        try {
            // Soft delete
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
