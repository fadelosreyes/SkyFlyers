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

        $datosPasajeros = session('datos_billete', []);
        $billetesCreados = [];

        foreach ($datosPasajeros as $p) {
            $asiento = Asiento::findOrFail($p['asiento_id']);

            $subtotal = $asiento->precio_base;
            $subtotal += !empty($p['maleta_adicional']) ? 20 : 0;
            $subtotal += !empty($p['cancelacion_flexible']) ? 15 : 0;

            $pnr = strtoupper(Str::random(10));
            $contenidoQR = 'PNR: ' . $pnr;

            $nombreArchivoQR = 'qrcodes/' . $pnr . '.svg';
            $rutaCompletaQR = storage_path('app/public/' . $nombreArchivoQR);

            File::put($rutaCompletaQR, QrCode::format('svg')->size(300)->generate($contenidoQR));

            $billete = Billete::create([
                'user_id' => Auth::id(),
                'nombre_pasajero' => $p['nombre_pasajero'],
                'documento_identidad' => $p['documento_identidad'],
                'asiento_id' => $p['asiento_id'],
                'codigo_QR' => $nombreArchivoQR,
                'pnr' => $pnr,
                'recargos' => 0,
                'tarifa_base' => (float) $asiento->precio_base,
                'total' => (float) $subtotal,
                'fecha_reserva' => now(),
                'fecha_emision' => now(),
                'maleta_adicional' => $p['maleta_adicional'] ?? false,
                'cancelacion_flexible' => $p['cancelacion_flexible'] ?? false,
                'stripe_session_id' => $sessionId,
            ]);

            $asiento->estado_id = 2; // Reservar asiento
            $asiento->save();

            $billetesCreados[] = $billete;
        }

        // Recargar con relaciones necesarias
        $billetes = Billete::whereIn('id', collect($billetesCreados)->pluck('id'))
            ->with('asiento.vuelo.aeropuertoOrigen', 'asiento.vuelo.aeropuertoDestino')
            ->get();

        // Mapear para frontend: crear array plano con datos de vuelo y aeropuertos
        $billetesPlanos = $billetes->map(function ($billete) {
            return [
                'id' => $billete->id,
                'nombre_pasajero' => $billete->nombre_pasajero,
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

        // **Enviar el email con los billetes**
        Mail::to(Auth::user()->email)->send(new BilletesEmail($billetesPlanos));

        session()->forget(['datos_billete', 'stripe_session_id']);

        return Inertia::render('Billete/ConfirmacionMultiple', [
            'billetes' => $billetesPlanos,
        ]);
    }

public function cancelarVuelo($vueloId)
{
    $billetes = Billete::whereHas('asiento', fn($q) => $q->where('vuelo_id', $vueloId))
                       ->get();

    if ($billetes->isEmpty()) {
        return back()->with('error', 'No hay billetes activos para este vuelo.');
    }

    Stripe::setApiKey(env('STRIPE_SECRET'));

    $refundedIntents = [];
    $errores = [];

    foreach ($billetes as $billete) {
        try {
            $intent = null;

            // Solo refund si aún no se ha reembolsado este payment_intent
            if (! in_array($billete->stripe_session_id, $refundedIntents)) {
                $session = \Stripe\Checkout\Session::retrieve($billete->stripe_session_id);
                $intent  = $session->payment_intent;

                \Stripe\Refund::create(['payment_intent' => $intent]);

                // Marcamos que ya lo reembolsamos
                $refundedIntents[] = $billete->stripe_session_id;
            }

            // Soft delete del billete
            $billete->delete();

            // Liberar el asiento
            if ($as = $billete->asiento) {
                $as->estado_id = 1;
                $as->save();
            }

        } catch (\Exception $e) {
            Log::error("Error en billete {$billete->id}: {$e->getMessage()}");
            $errores[] = "ID {$billete->id}";
            // No return: seguimos con los demás
        }
    }

    if (! empty($errores)) {
        return back()->with('error', 'No se pudieron cancelar algunos billetes: ' . implode(', ', $errores));
    }

    return back()->with('success', 'Todos los billetes han sido cancelados, reembolsados y los asientos liberados.');
}

}
