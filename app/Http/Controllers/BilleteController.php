<?php

namespace App\Http\Controllers;

use App\Models\Asiento;
use App\Models\Vuelo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class BilleteController extends Controller
{
    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $vueloId       = $request->input('vuelo_id');
        $asientoIds    = $request->input('asientos', []);

        if (empty($asientoIds)) {
            return redirect()->route('seleccionar.asientos', $vueloId)
                             ->with('error', 'Debes seleccionar al menos un asiento.');
        }

        $vuelo                = Vuelo::findOrFail($vueloId);
        $asientosSeleccionados = Asiento::whereIn('id', $asientoIds)->get();

        //  ↙ Aquí calculamos el total base (solo precio_base) de todos los asientos
        $totalBase = $asientosSeleccionados->sum(fn($a) => $a->precio_base);

        return Inertia::render('Billete/DatosPasajero', [
            'vuelo'                 => $vuelo,
            'asientosSeleccionados' => $asientosSeleccionados,
            'totalBase'             => $totalBase,
        ]);
    }

    /**
     * Guarda los datos y crea la sesión de Stripe Checkout.
     */
   public function prepararPago(Request $request)
{
    $data = $request->validate([
        'pasajeros.*.nombre_pasajero'      => 'required|string',
        'pasajeros.*.documento_identidad'  => 'required|string',
        'pasajeros.*.maleta_adicional'     => 'boolean',
        'pasajeros.*.cancelacion_flexible' => 'boolean',
        'pasajeros.*.asiento_id'           => 'required|exists:asientos,id',
    ]);

    session(['datos_billete' => $data['pasajeros']]);

    $precioTotal = 0;

    foreach ($data['pasajeros'] as $p) {
        $asiento = Asiento::findOrFail($p['asiento_id']);
        $sub = $asiento->precio_base;
        $sub += !empty($p['maleta_adicional'])     ? 20 : 0;
        $sub += !empty($p['cancelacion_flexible']) ? 15 : 0;
        $precioTotal += $sub;
    }

    Stripe::setApiKey(env('STRIPE_SECRET'));
    $session = Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price_data' => [
                'currency'     => 'eur',
                'product_data' => ['name' => 'Billetes de avión'],
                'unit_amount'  => $precioTotal * 100,
            ],
            'quantity' => 1,
        ]],
        'mode'       => 'payment',
        'success_url'=> route('pago.exito') . '?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => route('principal'),
    ]);

    session(['stripe_session_id' => $session->id]);

    return Inertia::location($session->url);
}

}
