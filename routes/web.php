<?php

use App\Http\Controllers\AeropuertoController;
use App\Http\Controllers\BilleteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VueloController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('principal', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
})->name('principal');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/vuelos/resultados', [VueloController::class, 'resultados'])
->name('vuelos.resultados');

Route::get('/vuelos/reservar/{id}', [VueloController::class, 'seleccionarAsientos'])
->name('seleccionar.asientos');

Route::resource('aeropuertos', AeropuertoController::class);

Route::get('/sobre-nosotros', function () {
    return Inertia::render('sobreNosotros');
})->name('sobre-nosotros');

Route::get('/contacto', function () {
    return Inertia::render('contacto');
})->name('contacto');

Route::resource('billetes', BilleteController::class);

Route::get('/vuelos/destacados', [VueloController::class, 'getDestacados']);


require __DIR__ . '/auth.php';
