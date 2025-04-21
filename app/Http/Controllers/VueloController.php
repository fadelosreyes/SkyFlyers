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
    $origen = $request->input('origen');
    $destino = $request->input('destino');
    $startDate = $request->input('start_date');
    $endDate = $request->input('end_date');

    $vuelos = Vuelo::with(['aeropuertoOrigen', 'aeropuertoDestino'])
        ->where('id_aeropuerto_origen', $origen)
        ->where('id_aeropuerto_destino', $destino)
        ->whereBetween('fecha_salida', [$startDate, $endDate])
        ->get();

    return Inertia::render('resultados', [
        'vuelos' => $vuelos,
        'startDate' => $startDate,
        'endDate' => $endDate,
    ]);
}



}
