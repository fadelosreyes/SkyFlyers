<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Rol; // Importamos el modelo Rol
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Mostrar la lista de usuarios con sus roles.
     */
public function index(Request $request): Response
{
    $search = $request->input('search', null);
    $roleId = $request->input('role_id', null);

    $query = User::with('rol')->orderBy('id');

    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    if ($roleId) {
        $query->where('role_id', $roleId);
    }

    $users = $query->get();

    $roles = Rol::orderBy('nombre')->get();

    return Inertia::render('Admin/UsuariosIndex', [
        'users' => $users,
        'roles' => $roles,
        'filters' => [
            'search' => $search,
            'role_id' => $roleId,
        ],
    ]);
}


    /**
     * Crear nuevo usuario con rol.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'role_id' => ['required', 'exists:roles,id'],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
        ]);

        return redirect()->route('users.index')->with('success', 'Usuario creado correctamente.');
    }

    /**
     * Actualizar usuario con rol.
     */
    public function update(Request $request, User $usuario): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $usuario->id],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
            'role_id' => ['required', 'exists:roles,id'],
        ]);

        $usuario->name = $request->name;
        $usuario->email = $request->email;
        $usuario->role_id = $request->role_id;

        if ($request->filled('password')) {
            $usuario->password = Hash::make($request->password);
        }

        $usuario->save();

        return redirect()->route('users.index')->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Eliminar usuario.
     */
    public function destroy(User $usuario): \Illuminate\Http\RedirectResponse
    {
        $usuario->delete();

        return redirect()->route('users.index')->with('success', 'Usuario eliminado correctamente.');
    }
}
