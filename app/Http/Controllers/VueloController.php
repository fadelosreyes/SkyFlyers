<?php

namespace App\Http\Controllers;

use App\Helpers\ImagenCiudadHelper;
use App\Models\Aeropuerto;
use App\Models\Asiento;
use App\Models\Avion;
use App\Models\Vuelo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Models\Billete;
use App\Models\Clase;
use App\Models\Estado;

class VueloController extends Controller
{
    public function index()
    {
        // Cargar vuelos con relaciones para mostrar nombres de avión y aeropuertos
        $vuelos = Vuelo::with(['avion', 'aeropuertoOrigen', 'aeropuertoDestino'])->get();

        $aviones = Avion::all();
        $aeropuertos = Aeropuerto::all();

        return Inertia::render('Admin/VuelosIndex', [
            'vuelos' => $vuelos,
            'aviones' => $aviones,
            'aeropuertos' => $aeropuertos,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'avion_id' => 'required|exists:aviones,id',
            'aeropuerto_origen_id' => 'required|exists:aeropuertos,id',
            'aeropuerto_destino_id' => 'required|exists:aeropuertos,id|different:aeropuerto_origen_id',
            'fecha_salida' => 'required|date|before:fecha_llegada',
            'fecha_llegada' => 'required|date|after:fecha_salida',
            'imagen' => 'nullable|string',
            'destacado' => 'boolean',
        ]);

        if (empty($validated['imagen'])) {
            $aeropuertoOrigen = Aeropuerto::find($validated['aeropuerto_origen_id']);
            $ciudadOrigen = $aeropuertoOrigen ? $aeropuertoOrigen->ciudad : null;

            if ($ciudadOrigen) {
                $validated['imagen'] = ImagenCiudadHelper::obtenerImagenDeCiudad($ciudadOrigen);
            } else {
                $validated['imagen'] = 'https://source.unsplash.com/featured/?airport';
            }
        }

        $vuelo = Vuelo::create($validated);

        // Crear asientos para el vuelo creado
        $this->crearAsientosParaVuelo($vuelo);

        return redirect()->back()->with('success', 'Vuelo creado correctamente');
    }

    /**
     * Crea asientos para un vuelo dado siguiendo la lógica del seeder.
     */
    protected function crearAsientosParaVuelo(Vuelo $vuelo)
    {
        $estadoLibre = Estado::firstOrCreate(['nombre' => 'Libre'], ['descripcion' => 'Asiento disponible']);
        $estadoOcupado = Estado::firstOrCreate(['nombre' => 'Ocupado'], ['descripcion' => 'Asiento ocupado']);
        $clases = Clase::all()->keyBy('nombre');

        // Eliminar asientos previos por si acaso (aunque debería ser vuelo nuevo)
        Asiento::where('vuelo_id', $vuelo->id)->delete();

        $avion = $vuelo->avion;

        $configClases = [
            'Primera' => ['filas' => $avion->filas_primera, 'cols' => 2, 'precio' => 500],
            'Business' => ['filas' => $avion->filas_business, 'cols' => 4, 'precio' => 250],
            'Turista' => ['filas' => $avion->filas_turista, 'cols' => 6, 'precio' => 100],
        ];

        $filaActual = 1;

        foreach ($configClases as $nombreClase => $cfg) {
            if (!isset($clases[$nombreClase])) {
                // Podrías loguear o ignorar la clase si no existe
                continue;
            }

            $idClase = $clases[$nombreClase]->id;
            $filas = $cfg['filas'];
            $columnas = $cfg['cols'];
            $precioBase = $cfg['precio'];

            for ($fila = $filaActual; $fila < $filaActual + $filas; $fila++) {
                for ($col = 0; $col < $columnas; $col++) {
                    $numeroAsiento = $fila . chr(ord('A') + $col);
                    $estadoId = rand(1, 100) <= 25 ? $estadoLibre->id : $estadoOcupado->id;

                    Asiento::create([
                        'vuelo_id' => $vuelo->id,
                        'clase_id' => $idClase,
                        'estado_id' => $estadoId,
                        'numero' => $numeroAsiento,
                        'precio_base' => $precioBase,
                    ]);
                }
            }

            $filaActual += $filas;
        }
    }


    public function update(Request $request, $id)
    {
        $vuelo = Vuelo::findOrFail($id);

        $validated = $request->validate([
            'avion_id' => 'required|exists:aviones,id',
            'aeropuerto_origen_id' => 'required|exists:aeropuertos,id',
            'aeropuerto_destino_id' => 'required|exists:aeropuertos,id|different:aeropuerto_origen_id',
            'fecha_salida' => 'required|date|before:fecha_llegada',
            'fecha_llegada' => 'required|date|after:fecha_salida',
            'imagen' => 'nullable|string',
            'destacado' => 'boolean',
        ]);

        if (empty($validated['imagen'])) {
            $aeropuertoOrigen = Aeropuerto::find($validated['aeropuerto_origen_id']);
            $ciudadOrigen = $aeropuertoOrigen ? $aeropuertoOrigen->ciudad : null;

            if ($ciudadOrigen) {
                $validated['imagen'] = ImagenCiudadHelper::obtenerImagenDeCiudad($ciudadOrigen);
            } else {
                $validated['imagen'] = 'https://source.unsplash.com/featured/?airport';
            }
        }

        // Verificar si cambia el avión para recrear los asientos
        $avionCambio = $vuelo->avion_id != $validated['avion_id'];

        $vuelo->update($validated);

        if ($avionCambio) {
            // Eliminar asientos anteriores
            Asiento::where('vuelo_id', $vuelo->id)->delete();

            // Crear nuevos asientos según el nuevo avión
            $this->crearAsientosParaVuelo($vuelo);
        }

        return redirect()->back()->with('success', 'Vuelo actualizado correctamente');
    }




    public function destroy($id)
    {
        $vuelo = Vuelo::findOrFail($id);

        // Eliminar asientos asociados antes
        $vuelo->asientos()->delete();

        // Ahora elimina el vuelo
        $vuelo->delete();

        return redirect()->back()->with('success', 'Vuelo eliminado correctamente');
    }


    public function resultados(Request $request)
    {
        $origen = $request->input('origen');
        $destino = $request->input('destino');
        $startDate = \Carbon\Carbon::parse($request->input('start_date'))->startOfDay();
        $endDate = $request->input('end_date') ? \Carbon\Carbon::parse($request->input('end_date'))->startOfDay() : null;
        $tipoVuelo = $request->input('tipo_vuelo', 'roundtrip');
        $isRoundTrip = $tipoVuelo === 'roundtrip';
        $passengers = (int) $request->input('pasajeros', 1);

        // Vuelos de ida: buscar entre las 00:00 y 23:59 del día de salida
        $vuelosIda = Vuelo::with([
            'aeropuertoOrigen',
            'aeropuertoDestino',
            'avion.aerolinea',
            'asientos' => function ($query) {
                $query->where('estado_id', 1);
            },
        ])
            ->where('aeropuerto_origen_id', $origen)
            ->where('aeropuerto_destino_id', $destino)
            ->whereBetween('fecha_salida', [$startDate->copy(), $startDate->copy()->endOfDay()])
            ->whereHas(
                'asientos',
                function ($q) use ($passengers) {
                    $q->where('estado_id', 1);
                },
                '>=',
                $passengers,
            )
            ->paginate(3)
            ->through(function ($vuelo) {
                $vuelo->precio_minimo = $vuelo->asientos->min('precio_base');
                $vuelo->plazas_libres = $vuelo->asientos->count();
                return $vuelo;
            });
        //dd($vuelosIda);
        // Vuelos de vuelta (solo si es ida y vuelta)
        $vuelosVuelta = null;
        if ($isRoundTrip && $endDate) {
            $vuelosVuelta = Vuelo::with([
                'aeropuertoOrigen',
                'aeropuertoDestino',
                'avion.aerolinea',
                'asientos' => function ($query) {
                    $query->where('estado_id', 1);
                },
            ])
                ->where('aeropuerto_origen_id', $destino)
                ->where('aeropuerto_destino_id', $origen)
                ->whereBetween('fecha_salida', [$endDate->copy(), $endDate->copy()->endOfDay()])
                ->whereHas(
                    'asientos',
                    function ($q) use ($passengers) {
                        $q->where('estado_id', 1);
                    },
                    '>=',
                    $passengers,
                )
                ->paginate(3)
                ->through(function ($vuelo) {
                    $vuelo->precio_minimo = $vuelo->asientos->min('precio_base');
                    $vuelo->plazas_libres = $vuelo->asientos->count();
                    return $vuelo;
                });
        }

        return Inertia::render('resultados', [
            'vuelosIda' => $vuelosIda,
            'vuelosVuelta' => $vuelosVuelta,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate ? $endDate->toDateString() : null,
            'passengers' => $passengers,
            'tipo_vuelo' => $tipoVuelo,
        ]);
    }

    public function seleccionarAsientos(Request $request, $id)
    {
        $numPasajeros = $request->query('passengers');
        if (empty($numPasajeros) || !is_numeric($numPasajeros) || $numPasajeros < 1) {
            $numPasajeros = null;
        } else {
            $numPasajeros = (int) $numPasajeros;
        }

        $idVuelta = $request->query('idVuelta'); // null si no se pasó

        // Cargamos también la relación avion para leer filas/asientos_por_fila_*:
        $vuelo = Vuelo::with(['avion', 'asientos.clase', 'asientos.estado'])->findOrFail($id);

        return Inertia::render('SeleccionarAsientos', [
            'vuelo'        => $vuelo,
            'asientos'     => $vuelo->asientos,
            'numPasajeros' => $numPasajeros,
            'idVuelta'     => $idVuelta,
        ]);
    }

    public function guardarSeleccionIda(Request $request)
    {

        $request->validate([
            'vueloIda' => 'required|integer',
            'seats' => 'required|array',
            'passengers' => 'required|integer|min:1',
        ]);

        $vueloIda = $request->input('vueloIda');
        $seats = $request->input('seats');
        $passengers = $request->input('passengers');


        session([
            'vuelo_ida' => (int) $vueloIda,
            'asientos_ida' => $seats,
            'numPasajeros' => (int) $passengers,
        ]);

        return response()->json(['ok' => true]);
    }


    // --- Nuevo: recupera de sesión los datos de la selección de "ida" ---
    public function obtenerSeleccionIda(Request $request)
    {
        //  Log::info('Sesión de ida recuperada:', [
        // 'vuelo_ida' => session('vuelo_ida'),
        // 'asientos_ida' => session('asientos_ida'),
        // ]);

        // Devolvemos, incluso si es null, para que el frontend distinga single‐flight
        return response()->json([
            'vuelo_ida' => session('vuelo_ida'),
            'asientos_ida' => session('asientos_ida'),
        ]);
    }

    public function getDestacados(): \Illuminate\Http\JsonResponse
    {
        $vuelos = Vuelo::where('destacado', true)
            ->inRandomOrder()
            ->limit(5)
            ->with([
                'avion',
                'aeropuertoOrigen',
                'aeropuertoDestino',
                'asientos' => function ($query) {
                    $query->where('estado_id', 1); // solo asientos libres
                },
            ])
            ->get()
            ->map(function ($vuelo) {
                $salida = Carbon::parse($vuelo->fecha_salida);
                $llegada = Carbon::parse($vuelo->fecha_llegada);

                $precio_minimo = $vuelo->asientos->min('precio_base');
                $plazas_libres = $vuelo->asientos->count();

                return [
                    'id' => $vuelo->id,
                    'origen' => $vuelo->aeropuertoOrigen->ciudad,
                    'destino' => $vuelo->aeropuertoDestino->ciudad,
                    'fecha_salida' => $salida->toDateTimeString(),
                    'fecha_llegada' => $llegada->toDateTimeString(),
                    'imagen' => $vuelo->imagen,
                    'precio_minimo' => $precio_minimo,
                    'plazas_libres' => $plazas_libres,
                ];
            });

        return response()->json($vuelos);
    }

    public function misViajes()
    {
        $userId = Auth::id();

        // Obtener todos los billetes del usuario con sus vuelos relacionados
        $billetes = Billete::with(['asiento.vuelo.avion.aerolinea', 'asiento.vuelo.aeropuertoOrigen', 'asiento.vuelo.aeropuertoDestino'])

            ->where('user_id', $userId)
            ->get();

        // Extraer los vuelos desde los billetes
        $vuelos = $billetes
            ->map(fn($billete) => $billete->asiento->vuelo ?? null)
            ->filter()
            ->unique('id')
            ->values();

        return Inertia::render('MisViajes', [
            'vuelos' => $vuelos,
        ]);
    }
}
