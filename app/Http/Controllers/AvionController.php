<?php

namespace App\Http\Controllers;

use App\Models\Avion;
use App\Models\Aerolinea;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AvionController extends Controller
{
    public function index(Request $request)
    {
        $query = Avion::with('aerolinea');

        // Búsqueda insensible a mayúsculas/minúsculas en 'modelo' y 'matricula'
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function($q) use ($term) {
                $q->where('modelo', 'ilike', '%' . $term . '%')
                  ->orWhere('matricula', 'ilike', '%' . $term . '%');
            });
        }

        // Ordenación dinámica (solo por 'id' o 'modelo')
        $sortField = in_array($request->get('sortField'), ['id', 'modelo'])
            ? $request->get('sortField')
            : 'id';
        $sortDirection = $request->get('sortDirection') === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortField, $sortDirection);

        // Paginación 20 por página, conservando filtros
        $aviones    = $query->paginate(20)->withQueryString();
        $aerolineas = Aerolinea::orderBy('nombre')->get();

        return Inertia::render('Admin/AvionesIndex', [
            'aviones'     => $aviones,
            'aerolineas'  => $aerolineas,
            'filters'     => $request->only(['search', 'sortField', 'sortDirection']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'modelo'                     => 'required|string|max:255',
            'codigo_icao'                => 'required|string|size:4|unique:aviones,codigo_icao',
            'matricula'                  => 'required|string|max:255|unique:aviones,matricula',
            'aerolinea_id'               => 'required|exists:aerolineas,id',
            'filas_primera'              => 'nullable|integer|min:0',
            'asientos_por_fila_primera'  => 'nullable|integer|min:0',
            'filas_business'             => 'nullable|integer|min:0',
            'asientos_por_fila_business' => 'nullable|integer|min:0',
            'filas_turista'              => 'nullable|integer|min:0',
            'asientos_por_fila_turista'  => 'nullable|integer|min:0',
        ]);

        Avion::create([
            'modelo'                     => $request->modelo,
            'codigo_icao'                => strtoupper($request->codigo_icao),
            'matricula'                  => $request->matricula,
            'aerolinea_id'               => $request->aerolinea_id,
            'filas_primera'              => $request->filas_primera,
            'asientos_por_fila_primera'  => $request->asientos_por_fila_primera,
            'filas_business'             => $request->filas_business,
            'asientos_por_fila_business' => $request->asientos_por_fila_business,
            'filas_turista'              => $request->filas_turista,
            'asientos_por_fila_turista'  => $request->asientos_por_fila_turista,
        ]);

        return redirect()->back()->with('success', 'Avión creado correctamente.');
    }

    public function update(Request $request, Avion $avione)
    {
        $request->validate([
            'modelo'                     => 'required|string|max:255',
            'codigo_icao'                => 'required|string|size:4|unique:aviones,codigo_icao,' . $avione->id,
            'matricula'                  => 'required|string|max:255|unique:aviones,matricula,' . $avione->id,
            'aerolinea_id'               => 'required|exists:aerolineas,id',
            'filas_primera'              => 'nullable|integer|min:0',
            'asientos_por_fila_primera'  => 'nullable|integer|min:0',
            'filas_business'             => 'nullable|integer|min:0',
            'asientos_por_fila_business' => 'nullable|integer|min:0',
            'filas_turista'              => 'nullable|integer|min:0',
            'asientos_por_fila_turista'  => 'nullable|integer|min:0',
        ]);

        $avione->update([
            'modelo'                     => $request->modelo,
            'codigo_icao'                => strtoupper($request->codigo_icao),
            'matricula'                  => $request->matricula,
            'aerolinea_id'               => $request->aerolinea_id,
            'filas_primera'              => $request->filas_primera,
            'asientos_por_fila_primera'  => $request->asientos_por_fila_primera,
            'filas_business'             => $request->filas_business,
            'asientos_por_fila_business' => $request->asientos_por_fila_business,
            'filas_turista'              => $request->filas_turista,
            'asientos_por_fila_turista'  => $request->asientos_por_fila_turista,
        ]);

        return redirect()->back()->with('success', 'Avión actualizado correctamente.');
    }

    public function destroy(Avion $avione)
    {
        $avione->delete();
        return redirect()->back()->with('success', 'Avión eliminado correctamente.');
    }
}
