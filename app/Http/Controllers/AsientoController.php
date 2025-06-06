<?php

namespace App\Http\Controllers;

use App\Models\Asiento;
use App\Models\Clase;
use App\Models\Estado;
use App\Models\Vuelo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AsientoController extends Controller
{
    public function index(Request $request)
    {
        $query = Asiento::with('clase', 'estado')->orderBy('id', 'asc');

        // Filtrar por vuelo si viene el parámetro 'vuelo_id'
        if ($request->filled('vuelo_id')) {
            $query->where('vuelo_id', $request->input('vuelo_id'));
        }

        return Inertia::render('Admin/AsientosIndex', [
            'asientos' => $query->paginate(20)->withQueryString(),
            'clases' => Clase::all(),
            'estados' => Estado::all(),
            'vuelos' => Vuelo::all(),
            'filtroVueloId' => $request->input('vuelo_id', ''),
        ]);
    }


    public function update(Request $request, Asiento $asiento)
    {
        $request->validate([
            'precio_base' => 'required|numeric',
            'estado_id' => 'required|exists:estados,id',
        ]);

        $asiento->update($request->all());
        return redirect()->route('asientos.index');
    }

    public function destroy(Asiento $asiento)
    {
        $asiento->delete();
        return redirect()->route('asientos.index');
    }
}
