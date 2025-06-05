<?php

namespace App\Http\Controllers;

use App\Models\Vuelo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Models\Billete;
use Illuminate\Support\Facades\Log;


class VueloController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Vuelo $vuelo)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vuelo $vuelo)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vuelo $vuelo)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vuelo $vuelo)
    {
        //
    }
    public function resultados(Request $request)
    {
        $origen = $request->input('origen');
        $destino = $request->input('destino');
        $startDate = \Carbon\Carbon::parse($request->input('start_date'))->startOfDay();
        $endDate = $request->input('end_date') ? \Carbon\Carbon::parse($request->input('end_date'))->startOfDay() : null;
        $tipoVuelo = $request->input('tipo_vuelo', 'roundtrip');
        $isRoundTrip = $tipoVuelo === 'roundtrip';
        $passengers = (int) $request->input('pasajeros', 1);

        // Vuelos de ida: buscar entre las 00:00 y 23:59 del día de salida
        $vuelosIda = Vuelo::with([
            'aeropuertoOrigen',
            'aeropuertoDestino',
            'avion.aerolinea',
            'asientos' => function ($query) {
                $query->where('estado_id', 1);
            },
        ])
            ->where('aeropuerto_origen_id', $origen)
            ->where('aeropuerto_destino_id', $destino)
            ->whereBetween('fecha_salida', [$startDate->copy(), $startDate->copy()->endOfDay()])
            ->whereHas(
                'asientos',
                function ($q) use ($passengers) {
                    $q->where('estado_id', 1);
                },
                '>=',
                $passengers,
            )
            ->paginate(3)
            ->through(function ($vuelo) {
                $vuelo->precio_minimo = $vuelo->asientos->min('precio_base');
                $vuelo->plazas_libres = $vuelo->asientos->count();
                return $vuelo;
            });
        //dd($vuelosIda);
        // Vuelos de vuelta (solo si es ida y vuelta)
        $vuelosVuelta = null;
        if ($isRoundTrip && $endDate) {
            $vuelosVuelta = Vuelo::with([
                'aeropuertoOrigen',
                'aeropuertoDestino',
                'avion.aerolinea',
                'asientos' => function ($query) {
                    $query->where('estado_id', 1);
                },
            ])
                ->where('aeropuerto_origen_id', $destino)
                ->where('aeropuerto_destino_id', $origen)
                ->whereBetween('fecha_salida', [$endDate->copy(), $endDate->copy()->endOfDay()])
                ->whereHas(
                    'asientos',
                    function ($q) use ($passengers) {
                        $q->where('estado_id', 1);
                    },
                    '>=',
                    $passengers,
                )
                ->paginate(3)
                ->through(function ($vuelo) {
                    $vuelo->precio_minimo = $vuelo->asientos->min('precio_base');
                    $vuelo->plazas_libres = $vuelo->asientos->count();
                    return $vuelo;
                });
        }

        return Inertia::render('resultados', [
            'vuelosIda' => $vuelosIda,
            'vuelosVuelta' => $vuelosVuelta,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate ? $endDate->toDateString() : null,
            'passengers' => $passengers,
            'tipo_vuelo' => $tipoVuelo,
        ]);
    }

    public function seleccionarAsientos(Request $request, $id)
    {
        Log::info('Seleccionar asientos', [
        'id' => $id,
        'idVuelta' => $request->query('idVuelta'),
        'fase' => $request->query('fase'),
        'passengers' => $request->query('passengers'),
    ]);
        $numPasajeros = $request->query('passengers');
        if (empty($numPasajeros) || !is_numeric($numPasajeros) || $numPasajeros < 1) {
            $numPasajeros = 100;
        } else {
            $numPasajeros = (int) $numPasajeros;
        }

        $idVuelta = $request->query('idVuelta'); // null si no se pasó

        $vuelo = Vuelo::with(['asientos.clase', 'asientos.estado'])->findOrFail($id);


        return Inertia::render('SeleccionarAsientos', [
            'vuelo' => $vuelo,
            'asientos' => $vuelo->asientos,
            'numPasajeros' => $numPasajeros,
            'idVuelta' => $idVuelta, // null o el ID del vuelo de vuelta
        ]);
    }

    // --- Nuevo: guarda en sesión la selección de asientos de "ida" ---
    public function guardarSeleccionIda(Request $request)
    {
        // Validamos mínimamente que venga algo
        $request->validate([
            'vueloIda' => 'required|integer',
            'seats' => 'required|array',
            'passengers' => 'required|integer|min:1',
        ]);

        // Guardamos en sesión
        session([
            'vuelo_ida' => (int) $request->input('vueloIda'),
            'asientos_ida' => $request->input('seats'),
            'numPasajeros' => (int) $request->input('passengers'),
        ]);
        //dd($request->all());

        // Devolvemos JSON para que axios en el frontend sepa que todo fue OK
        return response()->json(['ok' => true]);
    }

    // --- Nuevo: recupera de sesión los datos de la selección de "ida" ---
    public function obtenerSeleccionIda(Request $request)
    {
        //  Log::info('Sesión de ida recuperada:', [
        // 'vuelo_ida' => session('vuelo_ida'),
        // 'asientos_ida' => session('asientos_ida'),
    // ]);

        // Devolvemos, incluso si es null, para que el frontend distinga single‐flight
        return response()->json([
            'vuelo_ida' => session('vuelo_ida'),
            'asientos_ida' => session('asientos_ida'),
        ]);
    }

    public function getDestacados(): \Illuminate\Http\JsonResponse
    {
        $vuelos = Vuelo::where('destacado', true)
            ->inRandomOrder()
            ->limit(5)
            ->with([
                'avion',
                'aeropuertoOrigen',
                'aeropuertoDestino',
                'asientos' => function ($query) {
                    $query->where('estado_id', 1); // solo asientos libres
                },
            ])
            ->get()
            ->map(function ($vuelo) {
                $salida = Carbon::parse($vuelo->fecha_salida);
                $llegada = Carbon::parse($vuelo->fecha_llegada);

                $precio_minimo = $vuelo->asientos->min('precio_base');
                $plazas_libres = $vuelo->asientos->count();

                return [
                    'id' => $vuelo->id,
                    'origen' => $vuelo->aeropuertoOrigen->ciudad,
                    'destino' => $vuelo->aeropuertoDestino->ciudad,
                    'fecha_salida' => $salida->toDateTimeString(),
                    'fecha_llegada' => $llegada->toDateTimeString(),
                    'imagen' => $vuelo->imagen,
                    'precio_minimo' => $precio_minimo,
                    'plazas_libres' => $plazas_libres,
                ];
            });

        return response()->json($vuelos);
    }

    public function misViajes()
    {
        $userId = Auth::id();

        // Obtener todos los billetes del usuario con sus vuelos relacionados
        $billetes = Billete::with(['asiento.vuelo.avion.aerolinea', 'asiento.vuelo.aeropuertoOrigen', 'asiento.vuelo.aeropuertoDestino'])

            ->where('user_id', $userId)
            ->get();

        // Extraer los vuelos desde los billetes
        $vuelos = $billetes
            ->map(fn($billete) => $billete->asiento->vuelo ?? null)
            ->filter() // elimina null si hay
            ->unique('id')
            ->values();

        return Inertia::render('MisViajes', [
            'vuelos' => $vuelos,
        ]);
    }
}
