<?php

namespace App\Http\Controllers;

use App\Models\Pais;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaisController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function index(Request $request)
{
    $query = Pais::query();

    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->where('nombre', 'like', "%{$search}%")
              ->orWhere('codigo_iso', 'like', "%{$search}%");
        });
    }

    $allowedSortFields = ['nombre', 'codigo_iso'];
    $sortField = $request->get('sortField', 'nombre');
    $sortOrder = strtolower($request->get('sortOrder', 'asc'));

    if (!in_array($sortField, $allowedSortFields)) {
        $sortField = 'nombre';
    }

    if (!in_array($sortOrder, ['asc', 'desc'])) {
        $sortOrder = 'asc';
    }

    $query->orderBy($sortField, $sortOrder);

    $paises = $query->paginate(20)->withQueryString();

    return Inertia::render('Admin/PaisesIndex', [
        'filters' => [
            'search' => $request->search,
            'sortField' => $sortField,
            'sortOrder' => $sortOrder,
        ],
        'paises' => $paises,

    ]);
}



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|unique:paises,nombre',
            'codigo_iso' => 'required|string|size:2|unique:paises,codigo_iso',
        ]);

        Pais::create([
            'nombre' => $request->nombre,
            'codigo_iso' => strtoupper($request->codigo_iso),
        ]);

        return redirect()->route('paises.index')->with('success', 'País creado correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pais $paise)
    {
        dd($paise);
        $request->validate([
            'nombre' => 'required|string|unique:paises,nombre,' . $paise->id,
            'codigo_iso' => 'required|string|size:2|unique:paises,codigo_iso,' . $paise->id,
        ]);

        $paise->update([
            'nombre' => $request->nombre,
            'codigo_iso' => strtoupper($request->codigo_iso),
        ]);

        return redirect()->route('paises.index')->with('success', 'País actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pais $paise)
    {
        $paise->delete();

        return redirect()->route('paises.index')->with('success', 'País eliminado correctamente.');
    }
}
