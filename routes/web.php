<?php

use App\Http\Controllers\AerolineaController;
use App\Http\Controllers\AeropuertoController;
use App\Http\Controllers\AsientoController;
use App\Http\Controllers\AvionController;
use App\Http\Controllers\BilleteController;
use App\Http\Controllers\EstadoController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\PaisController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RolController;
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

Route::resource('admin/roles', RolController::class)->names('roles');
Route::resource('admin/paises', PaisController::class)->names('paises');
Route::resource('admin/usuarios', UserController::class)->names('users');
Route::resource('admin/aerolineas', AerolineaController::class)->names('aerolineas');
Route::resource('admin/aviones', AvionController::class)->names('aviones');
Route::resource('admin/vuelos', VueloController::class);
Route::resource('admin/estados', EstadoController::class);
Route::resource('admin/aeropuertos', AeropuertoController::class);
Route::resource('admin/asientos', AsientoController::class);
Route::resource('admin/billetes', BilleteController::class);


Route::get('/aeropuertos', [AeropuertoController::class, 'buscar']);

Route::get('/vuelos/resultados', [VueloController::class, 'resultados'])->name('vuelos.resultados');

Route::get('/vuelos/reservar/{id}', [VueloController::class, 'seleccionarAsientos'])
    ->middleware('auth')
    ->name('seleccionar.asientos'
);


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

Route::get('/cancelaciones', [BilleteController::class, 'gestiones'])->name('cancelaciones.index');

// Rutas para pago Stripe:
//Route::post('/pago/stripe', [PagoController::class, 'crearSesionStripe'])->name('pago.stripe');
Route::get('/pago/exito', [PagoController::class, 'exito'])->name('pago.exito');

Route::post('/vuelos/{vuelo}/cancelar-billetes', [PagoController::class, 'cancelarVuelos'])->name('vuelos.cancelarBilletes');

Route::middleware(['auth'])->get('/mis-viajes', [VueloController::class, 'misViajes'])->name('mis.viajes');
Route::get('/billetes/create', [BilleteController::class, 'create'])->name('billetes.create');

Route::middleware(['auth'])->group(function () {
    Route::get('/billetes/{billete}/cambiar-asiento', [BilleteController::class, 'editarAsiento'])->name('billetes.editarAsiento');
    Route::post('/billetes/{billete}/actualizar-asiento', [BilleteController::class, 'actualizarAsiento'])->name('billetes.actualizarAsiento');
});

Route::post(
    '/vuelos/guardar-seleccion-ida',
    [VueloController::class, 'guardarSeleccionIda']
)->name('vuelos.guardarSeleccionIda');

Route::get(
    '/vuelos/obtener-seleccion-ida',
    [VueloController::class, 'obtenerSeleccionIda']
)->name('vuelos.obtenerSeleccionIda');

Route::post('/billetes/asientos', [BilleteController::class, 'asientos'])->name('billetes.asientos');


require __DIR__ . '/auth.php';
