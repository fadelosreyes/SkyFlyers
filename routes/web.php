<?php

use App\Http\Controllers\AeropuertoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VueloController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('principal', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('principal');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/vuelos/resultados', [VueloController::class, 'resultados']);
Route::resource('aeropuertos', AeropuertoController::class);
Route::get('/sobre-nosotros', function () {
    return Inertia::render(
        'sobreNosotros',[
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('sobre-nosotros');
Route::get('/contacto', function () {
    return Inertia::render(
        'contacto',[
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('contacto');


require __DIR__ . '/auth.php';
