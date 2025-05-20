<?php

namespace App\Http\Controllers;

use App\Models\Vuelo;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $origen      = $request->input('origen');
        $destino     = $request->input('destino');
        $startDate   = $request->input('start_date');
        $endDate     = $request->input('end_date');
        $passengers  = (int) $request->input('passengers', 1);

        $vuelos = Vuelo::with([
            'aeropuertoOrigen',
            'aeropuertoDestino',
            'avion.aerolinea',
            'asientos' => function ($q) {
                $q->whereHas('estado', fn($q2) => $q2->where('nombre', 'Libre'));
            },
        ])
        ->where('aeropuerto_origen_id', $origen)
        ->where('aeropuerto_destino_id', $destino)
        ->whereBetween('fecha_salida', [$startDate, $endDate])
        ->get()
        ->transform(function ($vuelo) {
            // Precio mínimo de los asientos libres
            $vuelo->precio_minimo = $vuelo->asientos->min('precio_base');
            // Número de plazas libres
            $vuelo->plazas_libres = $vuelo->asientos->count();
            return $vuelo;
        });

        return Inertia::render('resultados', [
            'vuelos'     => $vuelos,
            'startDate'  => $startDate,
            'endDate'    => $endDate,
            'passengers' => $passengers,
        ]);
    }

    public function seleccionarAsientos(Request $request, $id)
    {
        $numPasajeros = (int) $request->input('passengers', 1);

        $vuelo = Vuelo::with(['asientos.clase', 'asientos.estado'])
                     ->findOrFail($id);

        return Inertia::render('SeleccionarAsientos', [
            'vuelo'        => $vuelo,
            'asientos'     => $vuelo->asientos,
            'numPasajeros' => $numPasajeros,
        ]);
    }
}
