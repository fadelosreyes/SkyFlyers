<?php

namespace App\Http\Controllers;

use App\Models\Asiento;
use App\Models\Vuelo;
use App\Models\Billete;
use App\Mail\BilletesEmail;
use App\Models\Estado;
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
    public function asientos(Request $request)
    {
        // 1) VIAJE IDA Y VUELTA DIRECTO (ambos vuelos llegan en el mismo POST)
        $vueloIdaId      = $request->input('vuelo_ida');
        $asientosIda     = $request->input('seats_ida', []);
        $vueloVueltaId  = $request->input('vuelo_vuelta');
        $asientosVuelta  = $request->input('seats_vuelta', []);
        dd($request->all());

        if ($vueloIdaId && $vueloVueltaId) {
            // Si falta seleccionar asiento en alguno de los dos tramos, redirijo a la selección de ida
            if (empty($asientosIda) || empty($asientosVuelta)) {
                return redirect()
                    ->route('seleccionar.asientos', ['id' => $vueloIdaId])
                    ->with('error', 'Debes seleccionar al menos un asiento en cada tramo.');
            }

            // Cargo datos de ambos tramos
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

        //dd($request->all());
        // 2) SOLO UN VUELO (ida tradicional) — la vista React envía “vuelo_ida” y “seats_ida”
        $vueloActualId     = $request->input('vuelo_ida');
        $asientoIdsActual  = $request->input('seats_ida', []);

        // Si no seleccionó ningún asiento en ida, vuelvo a la pantalla de selección de asientos
        if (empty($asientoIdsActual)) {
            return redirect()
                ->route('seleccionar.asientos', ['id' => $vueloActualId])
                ->with('error', 'Debes seleccionar al menos un asiento.');
        }

        // 2.1) ¿Hay datos de ida guardados en sesión? (segunda fase de ida&vuelta en pasos)
        $vueloIdaSesion    = session('vuelo_ida');
        $asientosIdaSesion = session('asientos_ida');
        $vueloVueltaId     = $request->input('vuelo_vuelta');
        //$asientosVueltaIds = $request->input('seats_vuelta', []);
        $vueloIda                   = Vuelo::findOrFail($vueloIdaSesion);
        $asientosSeleccionadosIda   = Asiento::whereIn('id', $asientosIdaSesion)->get();

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

        // 2.2) Caso “vuelo único” (solo ida, sin vuelta en sesión)
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
        // 1) Validar los datos obligatorios
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

        // Opcional: si quieres ver el payload completo, puedes descomentar la siguiente línea:
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

        // Verificar que el nuevo asiento sea de la misma clase
        if ($nuevoAsiento->clase->nombre !== $billete->asiento->clase->nombre) {
            return back()->withErrors(['asiento_id' => 'El asiento debe ser de la clase asignada al billete.']);
        }

        if ($nuevoAsiento->estado->nombre !== 'Libre') {
            return back()->withErrors(['asiento_id' => 'El asiento no está disponible.']);
        }

        // Liberar asiento actual
        $asientoActual = $billete->asiento;
        $asientoActual->estado_id = Estado::where('nombre', 'Libre')->first()->id;
        $asientoActual->save();

        // Asignar nuevo asiento
        $nuevoAsiento->estado_id = Estado::where('nombre', 'Ocupado')->first()->id;
        $nuevoAsiento->save();

        // Actualizar billete
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
     * Listado de billetes del usuario agrupados por vuelo, solo vuelos a más de 3 días.
     */
    public function index()
    {
        $user = auth()->user();

        // 1) Obtenemos todos los billetes del usuario (con relaciones necesarias).
        $billetes = Billete::with([
            'asiento.vuelo.aeropuertoOrigen',
            'asiento.vuelo.aeropuertoDestino'
        ])
            ->where('user_id', $user->id)
            ->get();

        // 2) Primero agrupamos por stripe_session_id (cada sesión de pago).
        //    Así, todos los billetes que comparten stripe_session_id
        //    se consideran “parte de la misma compra”.
        $porSesionStripe = $billetes
            ->groupBy('stripe_session_id');

        $todosLosGrupos = [];

        // 3) Recorremos cada grupo de billetes (por sesión Stripe)
        foreach ($porSesionStripe as $stripeSessionId => $coleccionBilletesEnEstaSesion) {

            // 3.1) Dentro de esta sesión Stripe, agrupamos de nuevo por vuelo_id.
            //      Esto nos da, para esta compra, un sub‐conjunto de vuelos distintos.
            $vuelosEnEstaSesion = $coleccionBilletesEnEstaSesion
                ->groupBy(fn($b) => $b->asiento->vuelo->id)
                ->map(function ($grupoDeBilletes) {
                    // Mapeamos cada grupo a un objeto simple con datos de vuelo + lista de billetes.
                    $vuelo = $grupoDeBilletes->first()->asiento->vuelo;
                    return (object) [
                        'vuelo'    => (object)[
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
                ->values(); // pasamos a colección indexada

            // 3.2) Ahora, dentro de esta sesión, queremos emparejar vuelos de ida/vuelta.
            //      Usamos la misma lógica que antes pero solo entre los vuelos de esta sesión.
            $gruposDeEstaSesion = [];
            $usados = collect(); // vuelos ya procesados dentro de esta sesión

            foreach ($vuelosEnEstaSesion as $item) {
                $vueloId = $item->vuelo->id;
                if ($usados->contains($vueloId)) {
                    continue;
                }

                // Buscamos un posible “vuelo de vuelta” que:
                //   - No esté ya usado
                //   - Tenga origen == destino de este
                //   - Tenga destino == origen de este
                //   - Y cuya fecha_salida sea posterior a la fecha_salida de este
                $posibleVuelta = collect($vuelosEnEstaSesion)
                    ->filter(fn($otro) => !$usados->contains($otro->vuelo->id))
                    ->first(function ($otro) use ($item) {
                        return
                            $otro->vuelo->origen === $item->vuelo->destino &&
                            $otro->vuelo->destino === $item->vuelo->origen &&
                            (new \DateTime($otro->vuelo->fecha_salida) > new \DateTime($item->vuelo->fecha_salida));
                    });

                if ($posibleVuelta) {
                    // Emparejamos ida + vuelta
                    $gruposDeEstaSesion[] = (object)[
                        'stripe_session_id' => $stripeSessionId, // opcional, si quisieras mostrarlo
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
                    // Solo ida, sin vuelta emparejada
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

            // 3.3) Añadimos todos los grupos de esta sesión Stripe
            $todosLosGrupos = array_merge($todosLosGrupos, $gruposDeEstaSesion);
        }

        // 4) Devolvemos a la vista Inertia un array “grupos” donde cada elemento
        //    ya representa un vuelo de ida (y su posible vuelta), aislado por compra.
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

        // Buscamos el billete específico y sus relaciones para enviar
        $billete = Billete::with(['asiento.vuelo.aeropuertoOrigen', 'asiento.vuelo.aeropuertoDestino'])
            ->where('id', $billeteId)
            ->where('user_id', $user->id) // Para asegurarnos que el billete pertenece al usuario
            ->firstOrFail();

        try {
            Mail::to($user->email)->send(new BilletesEmail([$billete])); // Lo envío como array porque tu mailable espera un array
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
