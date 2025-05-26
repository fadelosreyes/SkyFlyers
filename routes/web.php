<?php

use App\Http\Controllers\AeropuertoController;
use App\Http\Controllers\BilleteController;
use App\Http\Controllers\PagoController;
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

Route::get('/vuelos/resultados', [VueloController::class, 'resultados'])->name('vuelos.resultados');

Route::get('/vuelos/reservar/{id}', [VueloController::class, 'seleccionarAsientos'])
    ->middleware('auth')
    ->name('seleccionar.asientos');

Route::resource('aeropuertos', AeropuertoController::class);

Route::get('/sobre-nosotros', function () {
    return Inertia::render('sobreNosotros');
})->name('sobre-nosotros');

Route::get('/contacto', function () {
    return Inertia::render('contacto');
})->name('contacto');

// Rutas para billetes:
Route::post('/billetes/preparar-pago', [BilleteController::class, 'prepararPago'])->name('billetes.preparar_pago');
//Route::get('/billetes/pago', [BilleteController::class, 'mostrarPago'])->name('billetes.mostrar_pago');
Route::resource('billetes', BilleteController::class)->where(['billete' => '[0-9]+']);

Route::get('/vuelos/destacados', [VueloController::class, 'getDestacados']);

Route::get('/cancelaciones', [BilleteController::class, 'index'])->name('cancelaciones.index');

// Rutas para pago Stripe:
//Route::post('/pago/stripe', [PagoController::class, 'crearSesionStripe'])->name('pago.stripe');
Route::get('/pago/exito', [PagoController::class, 'exito'])->name('pago.exito');

Route::post('/vuelos/{vuelo}/cancelar-billetes', [PagoController::class, 'cancelarVuelo'])->name('vuelos.cancelarBilletes');


require __DIR__ . '/auth.php';
