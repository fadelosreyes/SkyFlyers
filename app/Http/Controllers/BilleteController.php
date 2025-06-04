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
    public function create(Request $request)
    {
        // Comprobamos si es un viaje de ida y vuelta (ambos vuelos enviados)
        $vueloIdaId = $request->input('vuelo_ida');
        $asientosIda = $request->input('seats_ida', []);
        $vueloVueltaId = $request->input('vuelo_vuelta');
        $asientosVuelta = $request->input('seats_vuelta', []);
        // dd([
        //     'vuelo_ida' => $vueloIdaId,
        //     'asientos_ida' => $asientosIda,
        //     'vuelo_vuelta' => $vueloVueltaId,
        //     'asientos_vuelta' => $asientosVuelta,
        //     'request_all' => $request->all(),
        // ]);

        // Si vienen ambos vuelos: procesamos ida y vuelta directamente
        if ($vueloIdaId && $vueloVueltaId) {
            if (empty($asientosIda) || empty($asientosVuelta)) {
                // Redirigimos si faltan asientos
                return redirect()->route('seleccionar.asientos', $vueloIdaId)->with('error', 'Debes seleccionar al menos un asiento en cada tramo.');
            }

            // Cargamos ambos vuelos y asientos
            $vueloIda = Vuelo::findOrFail($vueloIdaId);
            $vueloVuelta = Vuelo::findOrFail($vueloVueltaId);
            $asientosSeleccionadosIda = Asiento::whereIn('id', $asientosIda)->get();
            $asientosSeleccionadosVuelta = Asiento::whereIn('id', $asientosVuelta)->get();

            return Inertia::render('Billete/DatosPasajero', [
                'vueloIda' => $vueloIda,
                'asientosSeleccionadosIda' => $asientosSeleccionadosIda,
                'totalBaseIda' => $asientosSeleccionadosIda->sum(fn($a) => $a->precio_base),
                'vueloVuelta' => $vueloVuelta,
                'asientosSeleccionadosVuelta' => $asientosSeleccionadosVuelta,
                'totalBaseVuelta' => $asientosSeleccionadosVuelta->sum(fn($a) => $a->precio_base),
                'numPasajeros' => count($asientosIda), // deben coincidir ida y vuelta
            ]);
        }

        // Si solo viene un vuelo (ida o vuelta, modo tradicional o desde sesión)
        $vueloActualId = $request->input('vuelo_id');
        $asientoIdsActual = $request->input('asientos', []);

        if (empty($asientoIdsActual)) {
            return redirect()->route('seleccionar.asientos', $vueloActualId)->with('error', 'Debes seleccionar al menos un asiento.');
        }

        $vueloActual = Vuelo::findOrFail($vueloActualId);
        $asientosActuales = Asiento::whereIn('id', $asientoIdsActual)->get();

        // Verificar si hay datos en la sesión (modo ida y vuelta por pasos)
        $vueloIdaSesion = session('vuelo_ida');
        $asientosIdaSesion = session('asientos_ida');

        if ($vueloIdaSesion && is_array($asientosIdaSesion)) {
            $vueloIda = Vuelo::findOrFail($vueloIdaSesion);
            $asientosSeleccionadosIda = Asiento::whereIn('id', $asientosIdaSesion)->get();

            return Inertia::render('Billete/DatosPasajero', [
                'vueloIda' => $vueloIda,
                'asientosSeleccionadosIda' => $asientosSeleccionadosIda,
                'totalBaseIda' => $asientosSeleccionadosIda->sum(fn($a) => $a->precio_base),
                'vueloVuelta' => $vueloActual,
                'asientosSeleccionadosVuelta' => $asientosActuales,
                'totalBaseVuelta' => $asientosActuales->sum(fn($a) => $a->precio_base),
                'numPasajeros' => count($asientosIdaSesion),
            ]);
        }

        // Vuelo único
        return Inertia::render('Billete/DatosPasajero', [
            'vuelo' => $vueloActual,
            'asientosSeleccionados' => $asientosActuales,
            'totalBase' => $asientosActuales->sum(fn($a) => $a->precio_base),
            'numPasajeros' => count($asientoIdsActual),
        ]);
    }

    public function prepararPago(Request $request)
    {
        // 1) Validar los datos obligatorios
        $data = $request->validate([
            'pasajeros' => 'required|array|min:1',
            'pasajeros.*.nombre_pasajero' => 'required|string|min:3|max:255',
            'pasajeros.*.tipo_documento' => 'required|in:dni,pasaporte',
            'pasajeros.*.documento_identidad' => 'required|string|max:20',
            'pasajeros.*.asiento_ida' => 'nullable|exists:asientos,id',
            'pasajeros.*.asiento_vuelta' => 'nullable|exists:asientos,id',
            'pasajeros.*.maleta_adicional_ida' => 'boolean',
            'pasajeros.*.maleta_adicional_vuelta' => 'boolean',
            'cancelacion_flexible_global' => 'required|boolean',
            'total' => 'required|numeric|min:0',
            'language' => 'nullable|string|in:es,en',
        ]);

        //dd($request->all());

        $idioma = $data['language'];
        $pasajerosDatos = $data['pasajeros']; // array de X pasajeros

        // 2) Verificar si hay datos “ida” en sesión (para roundtrip)
        //$vueloIdaSesion = session('vuelo_ida'); // int|null
        //$asientosIdaSesion = session('asientos_ida'); // array|null

        // 3) Calcular el precio total sumando precio_base + suplementos
        $precioTotal = $data['total'];

        // 4) Guardar EN SESIÓN toda la información necesaria para crear billetes tras pago:
        //    - 'pasajerosDatos'  => datos completos de cada pasajero (incluida la relación asiento_id).
        //    - 'language'
        //    - Si es roundtrip, en sesión ya tenemos 'vuelo_ida' y 'asientos_ida'.
        //    - El vuelo actual (vuelta o single) lo podemos deducir de los pasajeros (Asiento->vuelo_id)
        session([
            'pasajerosDatos' => $pasajerosDatos,
            'language' => $idioma,
            'numPasajeros' => count($pasajerosDatos),
        ]);

        // 5) Iniciar la sesión de Stripe Checkout
        try {
            Stripe::setApiKey(env('STRIPE_SECRET'));
            $sessionStripe = $sessionStripe = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => 'eur',
                            'product_data' => ['name' => 'Billetes de avión'],
                            'unit_amount' => $precioTotal * 100,
                        ],
                        'quantity' => 1,
                    ],
                ],
                'mode' => 'payment',
                'success_url' => route('pago.exito') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('principal'),
                'locale' => $idioma,
            ]);
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors('Error creando sesión de pago: ' . $e->getMessage());
        }

        // 6) Guardar el ID de la sesión de Stripe para verificarlo en la página de éxito, si se desea
        session(['stripe_session_id' => $sessionStripe->id]);

        // 7) Limpiar la sesión temporal de “roundtrip” (vuelo_ida y asientos_ida ya no se necesitan aquí)
        session()->forget(['vuelo_ida', 'asientos_ida', 'numPasajeros']);

        // 8) Redirigir al usuario al Checkout de Stripe
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

        // Obtenemos todos los billetes del usuario, ordenados por fecha de reserva
        $billetes = Billete::with(['asiento.vuelo.aeropuertoOrigen', 'asiento.vuelo.aeropuertoDestino'])
            ->where('user_id', $user->id)
            ->orderBy('fecha_reserva') // <-- Ordenar por fecha de reserva
            ->get()
            ->groupBy(fn($billete) => $billete->asiento->vuelo->id)
            ->map(function ($grupoBilletes) {
                $vuelo = $grupoBilletes->first()->asiento->vuelo;

                return [
                    'vuelo' => [
                        'id' => $vuelo->id,
                        'fecha_salida' => $vuelo->fecha_salida,
                        'fecha_llegada' => $vuelo->fecha_llegada,
                        'origen' => $vuelo->aeropuertoOrigen->nombre,
                        'destino' => $vuelo->aeropuertoDestino->nombre,
                    ],
                    'billetes' => $grupoBilletes
                        ->map(function ($billete) {
                            return [
                                'id' => $billete->id,
                                'nombre_pasajero' => $billete->nombre_pasajero,
                                'documento_identidad' => $billete->documento_identidad,
                                'pnr' => $billete->pnr,
                                'codigo_QR' => $billete->codigo_QR,
                                'asiento_numero' => $billete->asiento->numero ?? 'N/A',
                                'tarifa_base' => $billete->tarifa_base,
                                'total' => $billete->total,
                                'maleta_adicional' => $billete->maleta_adicional,
                                'cancelacion_flexible' => $billete->cancelacion_flexible,
                                'fecha_reserva' => $billete->fecha_reserva,
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();

        return Inertia::render('Cancelaciones/Index', [
            'vuelosConBilletes' => $billetes,
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
