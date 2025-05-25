<?php

namespace App\Http\Controllers;

use App\Models\Asiento;
use App\Models\Billete;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class PagoController extends Controller
{
    public function exito(Request $request)
    {
        $sessionId = $request->input('session_id');

        if (!$sessionId || session('stripe_session_id') !== $sessionId) {
            return redirect()->route('principal')
                ->with('error', 'Sesión de pago inválida o expirada.');
        }

        Stripe::setApiKey(env('STRIPE_SECRET'));
        $stripeSession = Session::retrieve($sessionId);

        if ($stripeSession->payment_status !== 'paid') {
            return redirect()->route('principal')
                ->with('error', 'El pago no se completó correctamente.');
        }

        $datosPasajeros = session('datos_billete', []);
        $billetesCreados = [];
        //dd($datosPasajeros);
        foreach ($datosPasajeros as $p) {
            $asiento = Asiento::findOrFail($p['asiento_id']); // Obtenemos el asiento

            $subtotal = $asiento->precio_base;
            $subtotal += !empty($p['maleta_adicional'])     ? 20 : 0;
            $subtotal += !empty($p['cancelacion_flexible']) ? 15 : 0;

            $billete = Billete::create([
                'user_id'               => Auth::id(),
                'nombre_pasajero'       => $p['nombre_pasajero'],
                'documento_identidad'   => $p['documento_identidad'],
                'asiento_id'            => $p['asiento_id'],
                'codigo_QR'             => Str::uuid(),
                'pnr'                   => strtoupper(Str::random(10)),
                'recargos'              => 0,
                'tarifa_base'           => (float) $asiento->precio_base,
                'total'                 => (float) $subtotal,
                'fecha_reserva'         => now(),
                'fecha_emision'         => now(),
                'maleta_adicional'      => $p['maleta_adicional'] ?? false,
                'cancelacion_flexible'  => $p['cancelacion_flexible'] ?? false,
            ]);

            // Actualizamos el estado del asiento a 2 (ocupado)
            $asiento->estado_id = 2;
            $asiento->save();

            $billetesCreados[] = $billete;
        }

        //dd($billetesCreados);
        session()->forget(['datos_billete', 'stripe_session_id']);

        return Inertia::render('Billete/ConfirmacionMultiple', [
            'billetes' => $billetesCreados,
        ]);
    }
}
