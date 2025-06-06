<?php

namespace App\Http\Controllers;

use App\Models\Estado;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EstadoController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/EstadosIndex', [
            'estados' => Estado::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:estados,nombre',
        ]);

        Estado::create($request->only('nombre'));

        return redirect()->back();
    }

    public function update(Request $request, Estado $estado)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:estados,nombre,' . $estado->id,
        ]);

        $estado->update($request->only('nombre'));

        return redirect()->back();
    }

    public function destroy(Estado $estado)
    {
        $estado->delete();

        return redirect()->back();
    }
}
