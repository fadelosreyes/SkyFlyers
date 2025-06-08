<?php

namespace App\Http\Controllers;

use App\Models\Aerolinea;
use App\Models\Pais;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AerolineaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Aerolinea::with('pais');

        if ($request->filled('search')) {
            $query->where('nombre', 'ilike', '%' . $request->search . '%');
        }

        $sortField = in_array($request->get('sortField'), ['id', 'nombre'])
            ? $request->get('sortField')
            : 'id';
        $sortDirection = $request->get('sortDirection') === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortField, $sortDirection);

        $aerolineas = $query->paginate(20)->withQueryString();
        $paises     = Pais::orderBy('nombre')->get();

        return Inertia::render('Admin/AerolineasIndex', [
            'aerolineas' => $aerolineas,
            'paises'     => $paises,
            'filters'    => $request->only(['search', 'sortField', 'sortDirection']),
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
     public function store(Request $request)
    {
        $request->validate([
            'nombre'      => 'required|string|unique:aerolineas,nombre',
            'codigo_iata' => 'required|string|size:2|unique:aerolineas,codigo_iata',
            'pais_id'     => 'required|exists:paises,id',
        ]);

        Aerolinea::create([
            'nombre'      => $request->nombre,
            'codigo_iata' => strtoupper($request->codigo_iata),
            'pais_id'     => $request->pais_id,
        ]);

        return redirect()->back()->with('success', 'Aerolínea creada correctamente.');
    }

    public function update(Request $request, Aerolinea $aerolinea)
    {
        $request->validate([
            'nombre'      => 'required|string|unique:aerolineas,nombre,' . $aerolinea->id,
            'codigo_iata' => 'required|string|size:2|unique:aerolineas,codigo_iata,' . $aerolinea->id,
            'pais_id'     => 'required|exists:paises,id',
        ]);

        $aerolinea->update([
            'nombre'      => $request->nombre,
            'codigo_iata' => strtoupper($request->codigo_iata),
            'pais_id'     => $request->pais_id,
        ]);

        return redirect()->back()->with('success', 'Aerolínea actualizada correctamente.');
    }

    public function destroy(Aerolinea $aerolinea)
    {
        $aerolinea->delete();
        return redirect()->back()->with('success', 'Aerolínea eliminada correctamente.');
    }
}
