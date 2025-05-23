<?php

namespace App\Http\Controllers;

use App\Models\Vuelo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

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
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $passengers = (int) $request->input('pasajeros', 1);

        // Convertir fechas con Carbon para cubrir todo el rango del día
        $startDate = \Carbon\Carbon::parse($startDate)->startOfDay();
        $endDate = \Carbon\Carbon::parse($endDate)->endOfDay();

        $vuelos = Vuelo::with([
            'aeropuertoOrigen',
            'aeropuertoDestino',
            'avion.aerolinea',
            'asientos' => function ($query) {
                $query->where('estado_id', 1); // Solo asientos libres
            },
        ])
            ->where('aeropuerto_origen_id', $origen)
            ->where('aeropuerto_destino_id', $destino)
            ->whereBetween('fecha_salida', [$startDate, $endDate])
            ->whereHas(
                'asientos',
                function ($q) {
                    $q->where('estado_id', 1);
                },
                '>=',
                $passengers,
            )
            ->get()
            ->transform(function ($vuelo) {
                $vuelo->precio_minimo = $vuelo->asientos->min('precio_base');
                $vuelo->plazas_libres = $vuelo->asientos->count();
                return $vuelo;
            })
            ->values();

        return Inertia::render('resultados', [
            'vuelos' => $vuelos,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString(),
            'passengers' => $passengers,
        ]);
    }

   public function seleccionarAsientos(Request $request, $id)
{
    // Si no viene passengers o viene vacío, lo dejamos como null (sin límite)
    $numPasajeros = $request->input('passengers');
    if (empty($numPasajeros) || !is_numeric($numPasajeros) || $numPasajeros < 1) {
        $numPasajeros = 100;
    } else {
        $numPasajeros = (int) $numPasajeros;
    }

    $vuelo = Vuelo::with(['asientos.clase', 'asientos.estado'])->findOrFail($id);

    return Inertia::render('SeleccionarAsientos', [
        'vuelo' => $vuelo,
        'asientos' => $vuelo->asientos,
        'numPasajeros' => $numPasajeros,
    ]);
}


    public function getDestacados(): \Illuminate\Http\JsonResponse
    {
        $vuelos = Vuelo::where('destacado', true)
            ->inRandomOrder()
            ->limit(5)
            ->with(['avion', 'aeropuertoOrigen', 'aeropuertoDestino', 'asientos' => function ($query) {
                $query->where('estado_id', 1); // solo asientos libres
            }])
            ->get()
            ->map(function ($vuelo) {
                $salida  = Carbon::parse($vuelo->fecha_salida);
                $llegada = Carbon::parse($vuelo->fecha_llegada);

                $precio_minimo = $vuelo->asientos->min('precio_base');
                $plazas_libres = $vuelo->asientos->count();

                return [
                    'id'            => $vuelo->id,
                    'origen'        => $vuelo->aeropuertoOrigen->ciudad,
                    'destino'       => $vuelo->aeropuertoDestino->ciudad,
                    'fecha_salida'  => $salida->toDateTimeString(),
                    'fecha_llegada' => $llegada->toDateTimeString(),
                    'imagen'        => $vuelo->imagen,
                    'precio_minimo' => $precio_minimo,
                    'plazas_libres' => $plazas_libres,
                ];
            });

        return response()->json($vuelos);
    }
}
