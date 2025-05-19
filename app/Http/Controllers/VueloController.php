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
        $origen     = $request->input('origen');
        $destino    = $request->input('destino');
        $startDate  = $request->input('start_date');
        $endDate    = $request->input('end_date');

        $vuelos = Vuelo::with([
            'aeropuertoOrigen',
            'aeropuertoDestino',
            'avion.aerolinea',
            'asientos' => function ($query) {
                $query->whereHas('estado', fn($q) => $q->where('nombre', 'Libre'));
            },
        ])
            ->where('aeropuerto_origen_id', $origen)
            ->where('aeropuerto_destino_id', $destino)
            ->whereBetween('fecha_salida', [$startDate, $endDate])
            ->get();

        // Añadir el precio mínimo disponible de los asientos libres al vuelo
        $vuelos->transform(function ($vuelo) {
            $vuelo->precio_minimo = $vuelo->asientos->min('precio_base');
            return $vuelo;
        });

        return Inertia::render('resultados', [
            'vuelos'     => $vuelos,
            'startDate'  => $startDate,
            'endDate'    => $endDate,
        ]);
    }

    public function seleccionarAsientos($id)
    {
        $vuelo = Vuelo::with(['asientos.clase', 'asientos.estado'])->findOrFail($id);

        return Inertia::render('SeleccionarAsientos', [
            'vuelo' => $vuelo,
            'asientos' => $vuelo->asientos,
        ]);
    }
}
