<?php

namespace App\Http\Controllers;

use App\Models\Aeropuerto;
use Illuminate\Http\Request;

class AeropuertoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $q = $request->get('q', '');

        // Buscamos por nombre, ciudad o código IATA
        $results = Aeropuerto::query()
            ->where('nombre', 'ILIKE', "%{$q}%")
            ->orWhere('ciudad', 'ILIKE', "%{$q}%")
            ->orWhere('codigo_iata', 'ILIKE', "%{$q}%")
            ->orderBy('nombre')
            ->limit(10)
            ->get(['id', 'nombre', 'ciudad', 'pais', 'codigo_iata']);

        return response()->json($results);
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
    public function show(Aeropuerto $aeropuerto)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Aeropuerto $aeropuerto)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Aeropuerto $aeropuerto)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Aeropuerto $aeropuerto)
    {
        //
    }
}
