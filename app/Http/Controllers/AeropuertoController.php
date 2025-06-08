<?php

namespace App\Http\Controllers;

use App\Models\Aeropuerto;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AeropuertoController extends Controller
{
    /**
     * Buscador para la página principal.
     */
    public function index(Request $request)
    {
        $query = Aeropuerto::query();

        // Buscar por nombre, ciudad, país o código IATA
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'ilike', "%{$search}%")
                    ->orWhere('ciudad', 'ilike', "%{$search}%")
                    ->orWhere('pais', 'ilike', "%{$search}%")
                    ->orWhere('codigo_iata', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->input('sortBy', 'id');
        $sortDir = $request->input('sortDir', 'asc');

        $aeropuertos = $query->orderBy($sortBy, $sortDir)
            ->paginate(20)
            ->withQueryString(); 

        return Inertia::render('Admin/AeropuertosIndex', [
            'aeropuertos' => $aeropuertos,
            'filters' => $request->only(['search', 'sortBy', 'sortDir']),
        ]);
    }


    public function buscar(Request $request)
    {
        $q = $request->get('q', '');

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
     * Crear un nuevo aeropuerto.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'ciudad' => 'required|string|max:255',
            'pais' => 'required|string|max:255',
            'codigo_iata' => 'required|string|size:3|unique:aeropuertos,codigo_iata',
        ]);

        Aeropuerto::create($request->only(['nombre', 'ciudad', 'pais', 'codigo_iata']));

        return redirect()->route('aeropuertos.index')->with('success', 'Aeropuerto creado correctamente.');
    }

    /**
     * Actualizar un aeropuerto.
     */
    public function update(Request $request, Aeropuerto $aeropuerto)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'ciudad' => 'required|string|max:255',
            'pais' => 'required|string|max:255',
            'codigo_iata' => 'required|string|size:3|unique:aeropuertos,codigo_iata,' . $aeropuerto->id,
        ]);

        $aeropuerto->update($request->only(['nombre', 'ciudad', 'pais', 'codigo_iata']));

        return redirect()->route('aeropuertos.index')->with('success', 'Aeropuerto actualizado correctamente.');
    }

    /**
     * Eliminar un aeropuerto.
     */
    public function destroy(Aeropuerto $aeropuerto)
    {
        $aeropuerto->delete();

        return redirect()->route('aeropuertos.index')->with('success', 'Aeropuerto eliminado correctamente.');
    }
}
