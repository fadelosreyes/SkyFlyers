<?php

namespace App\Http\Controllers;

use App\Models\Asiento;
use App\Models\Vuelo;
use App\Models\Billete;
use App\Mail\BilletesEmail;
use App\Models\Estado;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class BilleteController extends Controller
{
    /**
     * Muestra el formulario para crear un nuevo billete.
     */

    public function index(Request $request)
    {
        $searchNombre = $request->input('nombre_pasajero', '');

        $query = Billete::query();

        if ($searchNombre) {
            $query->where('nombre_pasajero', 'like', "%{$searchNombre}%");
        }

        $billetes = $query->orderBy('id', 'desc')->paginate(10)->withQueryString();

        $users = User::all(['id', 'name']);
        $asientos = Asiento::all(['id', 'numero']);

        return Inertia::render('Admin/BilletesIndex', [
            'billetes' => $billetes,
            'users' => $users,
            'asientos' => $asientos,
            'filters' => [
                'nombre_pasajero' => $searchNombre,
            ],
        ]);
    }

    /**
     * Update the specified billete.
     */
    public function update(Request $request, Billete $billete)
    {
        $validated = $request->validate([
            'nombre_pasajero' => 'required|string|max:255',
            'documento_identidad' => 'nullable|string|max:50',
            'recargos' => 'nullable|numeric|min:0',
            'maleta_adicional' => 'boolean',
            'cancelacion_flexible' => 'boolean',
        ]);

        $billete->update($validated);

        return redirect()->route('billetes.index')->with('success', 'Billete actualizado correctamente.');
    }

    /**
     * Remove the specified billete.
     */
    public function destroy(Billete $billete)
    {
        $estadoLibreId = 1;

        $asiento = $billete->asiento;
        if ($asiento) {
            $asiento->estado_id = $estadoLibreId;
            $asiento->save();
        }

        $billete->delete();

        return redirect()->route('billetes.index')->with('success', 'Billete eliminado correctamente y asiento liberado.');
    }


    public function asientos(Request $request)
    {
        $vueloIdaId      = $request->input('vuelo_ida');
        $asientosIda     = $request->input('seats_ida', []);
        $vueloVueltaId  = $request->input('vuelo_vuelta');
        $asientosVuelta  = $request->input('seats_vuelta', []);
        //dd($request->all());

        if (is_numeric($vueloIdaId) && is_numeric($vueloVueltaId)) {
            if (empty($asientosIda) || empty($asientosVuelta)) {
                return redirect()
                    ->route('seleccionar.asientos', ['id' => $vueloIdaId])
                    ->with('error', 'Debes seleccionar al menos un asiento en cada tramo.');
            }

            $vueloIda                    = Vuelo::findOrFail($vueloIdaId);
            $vueloVuelta                 = Vuelo::findOrFail($vueloVueltaId);
            $asientosSeleccionadosIda    = Asiento::whereIn('id', $asientosIda)->get();
            $asientosSeleccionadosVuelta = Asiento::whereIn('id', $asientosVuelta)->get();
            return Inertia::render('Billete/DatosPasajero', [
                'vueloIda'                    => $vueloIda,
                'asientosSeleccionadosIda'    => $asientosSeleccionadosIda,
                'totalBaseIda'                => $asientosSeleccionadosIda->sum(fn($a) => $a->precio_base),
                'vueloVuelta'                 => $vueloVuelta,
                'asientosSeleccionadosVuelta' => $asientosSeleccionadosVuelta,
                'totalBaseVuelta'             => $asientosSeleccionadosVuelta->sum(fn($a) => $a->precio_base),
            ]);
        }
        //dd('Después del bloque ida y vuelta');


        //dd($request->all());
        // 2) SOLO UN VUELO
        $vueloActualId     = $request->input('vuelo_ida');
        $asientoIdsActual  = $request->input('seats_ida', []);

        // Si no seleccionó ningún asiento en ida, vuelvo a la pantalla de selección de asientos
        if (empty($asientoIdsActual)) {
            return redirect()
                ->route('seleccionar.asientos', ['id' => $vueloActualId])
                ->with('error', 'Debes seleccionar al menos un asiento.');
        }
        //dd($request->all());
        // $vueloIdaSesion    = session('vuelo_ida');
        // $asientosIdaSesion = session('asientos_ida');
        // dd([
        //     'vueloIdaSesion' => $vueloIdaSesion,
        //     'asientosIdaSesion' => $asientosIdaSesion,
        // ]);
        //$asientosVueltaIds = $request->input('seats_vuelta', []);
        $vueloIda                   = Vuelo::findOrFail($vueloIdaId);
        $asientosSeleccionadosIda   = Asiento::whereIn('id', $asientosIda)->get();
        //dd($request->all());
        // if ($vueloVueltaId !== null && $vueloIdaSesion && is_array($asientosIdaSesion)) {

        //     // El vuelo actual es la vuelta
        //     $vueloVuelta                = Vuelo::findOrFail($vueloVueltaId);
        //     $asientosSeleccionadosVuelta = Asiento::whereIn('id', $asientosVueltaIds)->get();

        //     return Inertia::render('Billete/DatosPasajero', [
        //         'vueloIda'                    => $vueloIda,
        //         'asientosSeleccionadosIda'    => $asientosSeleccionadosIda,
        //         'totalBaseIda'                => $asientosSeleccionadosIda->sum(fn($a) => $a->precio_base),

        //         'vueloVuelta'                 => $vueloVuelta,
        //         'asientosSeleccionadosVuelta' => $asientosSeleccionadosVuelta,
        //         'totalBaseVuelta'             => $asientosSeleccionadosVuelta->sum(fn($a) => $a->precio_base),
        //     ]);
        // }

        // En este caso no hay vuelta, así que pasamos null y array vacío
        return Inertia::render('Billete/DatosPasajero', [
            'vueloIda'                    => $vueloIda,
            'asientosSeleccionadosIda'    => $asientosSeleccionadosIda,
            'totalBaseIda'                => $asientosSeleccionadosIda->sum(fn($a) => $a->precio_base),

            'vueloVuelta'                 => null,
            'asientosSeleccionadosVuelta' => [],
            'totalBaseVuelta'             => 0,
        ]);
    }




    public function prepararPago(Request $request)
    {
        $data = $request->validate([
            'pasajeros'                         => 'required|array|min:1',
            'pasajeros.*.nombre_pasajero'       => 'required|string|min:3|max:255',
            'pasajeros.*.tipo_documento'        => 'required|in:dni,pasaporte',
            'pasajeros.*.documento_identidad'   => 'required|string|max:20',
            'pasajeros.*.asiento_ida'           => 'nullable|exists:asientos,id',
            'pasajeros.*.asiento_vuelta'        => 'nullable|exists:asientos,id',
            'pasajeros.*.maleta_adicional_ida'  => 'boolean',
            'pasajeros.*.maleta_adicional_vuelta' => 'boolean',
            'cancelacion_flexible_global'       => 'required|boolean',
            'total'                             => 'required|numeric|min:0',
            'language'                          => 'nullable|string|in:es,en',
        ]);

        //dd($data);

        // dd($request->all());

        // 2) Extraer variables (ya validadas)
        $idioma                    = $data['language'] ?? 'es';
        $pasajerosDatos            = $data['pasajeros'];   // array con X pasajeros
        $cancelacionFlexibleGlobal = $data['cancelacion_flexible_global'];
        $precioTotal               = $data['total'];

        // 3) Guardar en sesión TODO lo que necesitaremos en exito():
        session([
            'pasajerosDatos'              => $pasajerosDatos,
            'cancelacion_flexible_global' => $cancelacionFlexibleGlobal,
            'language'                    => $idioma,
        ]);

        // 4) Iniciar la sesión de Stripe Checkout
        try {
            Stripe::setApiKey(env('STRIPE_SECRET'));
            $sessionStripe = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price_data' => [
                            'currency'     => 'eur',
                            'product_data' => ['name' => 'Billetes de avión'],
                            // Stripe espera el monto en céntimos de euro:
                            'unit_amount'  => intval(round($precioTotal * 100)),
                        ],
                        'quantity' => 1,
                    ],
                ],
                'mode'        => 'payment',
                'success_url' => route('pago.exito') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url'  => route('principal'),
                'locale'      => $idioma,
            ]);
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors('Error creando sesión de pago: ' . $e->getMessage());
        }

        // 5) Guardar el ID de la sesión Stripe para verificarlo en exito()
        session(['stripe_session_id' => $sessionStripe->id]);

        // 6) Redirigir al usuario al Checkout de Stripe
        return Inertia::location($sessionStripe->url);
    }

    public function editarAsiento(Billete $billete)
    {
        $vuelo = $billete->asiento->vuelo;
        $claseAsignada = $billete->asiento->clase->nombre; // Ej: 'turista', 'business', 'primera'

        // Obtener asientos disponibles para la clase asignada
        $asientos = Asiento::with('estado', 'clase')->where('vuelo_id', $vuelo->id)->whereHas('clase', fn($q) => $q->where('nombre', $claseAsignada))->get();

        return Inertia::render('SeleccionarAsientos', [
            'vuelo' => $vuelo,
            'asientos' => $asientos,
            'numPasajeros' => 1, // Solo un asiento para cambiar
            'billete' => $billete,
            'claseSeleccionada' => $claseAsignada, // Lo enviamos para el select y control
        ]);
    }

    public function actualizarAsiento(Request $request, Billete $billete)
    {
        $request->validate([
            'asiento_id' => 'required|exists:asientos,id',
        ]);

        $nuevoAsiento = Asiento::findOrFail($request->asiento_id);

        if ($nuevoAsiento->clase->nombre !== $billete->asiento->clase->nombre) {
            return back()->withErrors(['asiento_id' => 'El asiento debe ser de la clase asignada al billete.']);
        }

        if ($nuevoAsiento->estado->nombre !== 'Libre') {
            return back()->withErrors(['asiento_id' => 'El asiento no está disponible.']);
        }

        $asientoActual = $billete->asiento;
        $asientoActual->estado_id = Estado::where('nombre', 'Libre')->first()->id;
        $asientoActual->save();

        $nuevoAsiento->estado_id = Estado::where('nombre', 'Ocupado')->first()->id;
        $nuevoAsiento->save();

        $billete->asiento_id = $nuevoAsiento->id;
        $billete->save();

        return redirect()->route('billetes.editarAsiento', $billete->id)->with('success', 'Asiento cambiado correctamente.');
    }

    /**
     * Valida los datos y crea la sesión de Stripe Checkout para el pago.
     */
    // public function prepararPago(Request $request)
    // {
    //     $data = $request->validate([
    //         'pasajeros.*.nombre_pasajero' => 'required|string',
    //         'pasajeros.*.documento_identidad' => 'required|string',
    //         'pasajeros.*.maleta_adicional' => 'boolean',
    //         'pasajeros.*.cancelacion_flexible' => 'boolean',
    //         'pasajeros.*.asiento_id' => 'required|exists:asientos,id',
    //         'language' => 'required|string|in:es,en'
    //     ]);

    //       $idioma = $data['language'];

    //     // Guardamos los datos en sesión para procesarlos después del pago
    //     session(['datos_billete' => $data['pasajeros'],
    //     'language' => $idioma,]);

    //     $precioTotal = 0;

    //     foreach ($data['pasajeros'] as $p) {
    //         $asiento = Asiento::findOrFail($p['asiento_id']);
    //         $sub = $asiento->precio_base;
    //         $sub += !empty($p['maleta_adicional']) ? 20 : 0;
    //         $sub += !empty($p['cancelacion_flexible']) ? 15 : 0;
    //         $precioTotal += $sub;
    //     }

    //     try {
    //         Stripe::setApiKey(env('STRIPE_SECRET'));
    //         $session = Session::create([
    //             'payment_method_types' => ['card'],
    //             'line_items' => [
    //                 [
    //                     'price_data' => [
    //                         'currency' => 'eur',
    //                         'product_data' => ['name' => 'Billetes de avión'],
    //                         'unit_amount' => $precioTotal * 100,
    //                     ],
    //                     'quantity' => 1,
    //                 ],
    //             ],
    //             'mode' => 'payment',
    //             'success_url' => route('pago.exito') . '?session_id={CHECKOUT_SESSION_ID}',
    //             'cancel_url' => route('principal'),
    //             'locale' => $idioma,
    //         ]);
    //     } catch (\Exception $e) {
    //         return redirect()
    //             ->back()
    //             ->withErrors('Error creando sesión de pago: ' . $e->getMessage());
    //     }

    //     session(['stripe_session_id' => $session->id]);

    //     return Inertia::location($session->url);
    // }

    /**
     * Listado de billetes del usuario agrupados por vuelo
     */
    public function gestiones()
    {
        $user = auth()->user();

        $billetes = Billete::with([
            'asiento.vuelo.aeropuertoOrigen',
            'asiento.vuelo.aeropuertoDestino'
        ])
            ->where('user_id', $user->id)
            ->get();

        // Agrupamos por stripe_session_id
        $porSesionStripe = $billetes->groupBy('stripe_session_id');

        $todosLosGrupos = [];

        foreach ($porSesionStripe as $stripeSessionId => $coleccionBilletesEnEstaSesion) {

            // Dentro de esta sesión Stripe, agrupamos por vuelo_id
            $vuelosEnEstaSesion = $coleccionBilletesEnEstaSesion
                ->groupBy(fn($b) => $b->asiento->vuelo->id)
                ->map(function ($grupoDeBilletes) {
                    $vuelo = $grupoDeBilletes->first()->asiento->vuelo;
                    return (object)[
                        'vuelo' => (object)[
                            'id'             => $vuelo->id,
                            'fecha_salida'   => $vuelo->fecha_salida,
                            'fecha_llegada'  => $vuelo->fecha_llegada,
                            'origen'         => $vuelo->aeropuertoOrigen->nombre,
                            'destino'        => $vuelo->aeropuertoDestino->nombre,
                        ],
                        'billetes' => $grupoDeBilletes->map(fn($billete) => (object)[
                            'id'                   => $billete->id,
                            'nombre_pasajero'      => $billete->nombre_pasajero,
                            'documento_identidad'  => $billete->documento_identidad,
                            'pnr'                  => $billete->pnr,
                            'codigo_QR'            => $billete->codigo_QR,
                            'asiento_numero'       => $billete->asiento->numero ?? 'N/A',
                            'tarifa_base'          => $billete->tarifa_base,
                            'total'                => $billete->total,
                            'maleta_adicional'     => $billete->maleta_adicional,
                            'cancelacion_flexible' => $billete->cancelacion_flexible,
                            'fecha_reserva'        => $billete->fecha_reserva,
                        ])->values(),
                    ];
                })
                ->values();

            $gruposDeEstaSesion = [];
            $usados = collect();

            foreach ($vuelosEnEstaSesion as $item) {
                $vueloId = $item->vuelo->id;
                if ($usados->contains($vueloId)) {
                    continue;
                }

                $posibleVuelta = collect($vuelosEnEstaSesion)
                    ->filter(fn($otro) => !$usados->contains($otro->vuelo->id))
                    ->first(function ($otro) use ($item) {
                        return
                            $otro->vuelo->origen === $item->vuelo->destino &&
                            $otro->vuelo->destino === $item->vuelo->origen &&
                            (new \DateTime($otro->vuelo->fecha_salida) > new \DateTime($item->vuelo->fecha_salida));
                    });

                if ($posibleVuelta) {
                    $gruposDeEstaSesion[] = (object)[
                        'stripe_session_id' => $stripeSessionId,
                        'ida'   => (object)[
                            'vuelo'    => $item->vuelo,
                            'billetes' => $item->billetes,
                        ],
                        'vuelta' => (object)[
                            'vuelo'    => $posibleVuelta->vuelo,
                            'billetes' => $posibleVuelta->billetes,
                        ],
                    ];
                    $usados->push($vueloId, $posibleVuelta->vuelo->id);
                } else {
                    $gruposDeEstaSesion[] = (object)[
                        'stripe_session_id' => $stripeSessionId,
                        'ida'    => (object)[
                            'vuelo'    => $item->vuelo,
                            'billetes' => $item->billetes,
                        ],
                        'vuelta' => null,
                    ];
                    $usados->push($vueloId);
                }
            }

            $todosLosGrupos = array_merge($todosLosGrupos, $gruposDeEstaSesion);
        }

        return Inertia::render('Cancelaciones/Index', [
            'grupos' => $todosLosGrupos,
        ]);
    }


    /**
     * Envía un correo al usuario con sus billetes próximos (a más de 3 días).
     */
    public function enviarBilletes($billeteId)
    {
        $user = auth()->user();

        $billete = Billete::with(['asiento.vuelo.aeropuertoOrigen', 'asiento.vuelo.aeropuertoDestino'])
            ->where('id', $billeteId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        try {
            Mail::to($user->email)->send(new BilletesEmail([$billete]));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error enviando correo: ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Correo enviado con el billete.']);
    }

    /**
     * Método privado para evitar duplicación en consultas de billetes.
     */
    // private function obtenerBilletesUsuarioConFiltro($userId, $fechaLimite)
    // {
    //     return Billete::with(['asiento.vuelo.aeropuertoOrigen', 'asiento.vuelo.aeropuertoDestino'])
    //         ->where('user_id', $userId)
    //         ->whereHas('asiento.vuelo', function ($query) use ($fechaLimite) {
    //             $query->where('fecha_salida', '>', $fechaLimite);
    //         })
    //         ->get()
    //         ->groupBy(fn($billete) => $billete->asiento->vuelo->id)
    //         ->map(function ($grupoBilletes) {
    //             $vuelo = $grupoBilletes->first()->asiento->vuelo;

    //             return [
    //                 'vuelo' => [
    //                     'id' => $vuelo->id,
    //                     'fecha_salida' => $vuelo->fecha_salida,
    //                     'fecha_llegada' => $vuelo->fecha_llegada,
    //                     'origen' => $vuelo->aeropuertoOrigen->nombre,
    //                     'destino' => $vuelo->aeropuertoDestino->nombre,
    //                 ],
    //                 'billetes' => $grupoBilletes
    //                     ->map(function ($billete) {
    //                         return [
    //                             'id' => $billete->id,
    //                             'nombre_pasajero' => $billete->nombre_pasajero,
    //                             'documento_identidad' => $billete->documento_identidad,
    //                             'pnr' => $billete->pnr,
    //                             'codigo_QR' => $billete->codigo_QR,
    //                             'asiento_numero' => $billete->asiento->numero ?? 'N/A',
    //                             'tarifa_base' => $billete->tarifa_base,
    //                             'total' => $billete->total,
    //                             'maleta_adicional' => $billete->maleta_adicional,
    //                             'cancelacion_flexible' => $billete->cancelacion_flexible,
    //                             'fecha_reserva' => $billete->fecha_reserva,
    //                         ];
    //                     })
    //                     ->values(),
    //             ];
    //         })
    //         ->values();
    // }
}
