<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/RolesIndex', [
            'roles' => Rol::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['nombre' => 'required|string|max:255']);
        Rol::create(['nombre' => $request->nombre]);
        return redirect()->route('roles.index');
    }

    public function update(Request $request, Rol $role)
    {
        $request->validate(['nombre' => 'required|string|max:255']);
        $role->update(['nombre' => $request->nombre]);
        return redirect()->route('roles.index');
    }

    public function destroy(Rol $role)
    {
        $role->delete();
        return redirect()->route('roles.index');
    }
}

