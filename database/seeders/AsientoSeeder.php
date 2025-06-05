<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vuelo;
use App\Models\Estado;
use App\Models\Clase;
use App\Models\Asiento;
use Illuminate\Support\Carbon;

class AsientoSeeder extends Seeder
{
    public function run(): void
    {
        // Estados posibles
        $estadoLibre = Estado::firstOrCreate(['nombre' => 'Libre'], ['descripcion' => 'Asiento disponible']);
        $estadoOcupado = Estado::firstOrCreate(['nombre' => 'Ocupado'], ['descripcion' => 'Asiento ocupado']);

        // Clases de asiento
        $clases = Clase::all()->keyBy('nombre');

        // Obtener todos los vuelos con avión asignado (sin filtrar por destacados)
        $vuelos = Vuelo::with('avion')
            ->whereHas('avion')
            ->get();

        foreach ($vuelos as $vuelo) {
            // Eliminar asientos previos para este vuelo
            Asiento::where('vuelo_id', $vuelo->id)->delete();

            $avion = $vuelo->avion;

            // Configuración de filas, columnas y precio por clase
            $configClases = [
                'Primera' => ['filas' => $avion->filas_primera, 'cols' => 2, 'precio' => 500],
                'Business' => ['filas' => $avion->filas_business, 'cols' => 4, 'precio' => 250],
                'Turista' => ['filas' => $avion->filas_turista, 'cols' => 6, 'precio' => 100],
            ];

            $filaActual = 1;

            foreach ($configClases as $nombreClase => $cfg) {
                if (!isset($clases[$nombreClase])) {
                    $this->command->warn("   Clase \"{$nombreClase}\" no encontrada. Se omite.");
                    continue;
                }

                $idClase = $clases[$nombreClase]->id;
                $filas = $cfg['filas'];
                $columnas = $cfg['cols'];
                $precioBase = $cfg['precio'];

                for ($fila = $filaActual; $fila < $filaActual + $filas; $fila++) {
                    for ($col = 0; $col < $columnas; $col++) {
                        $numeroAsiento = $fila . chr(ord('A') + $col);

                        // 25% probabilidades que el asiento esté libre, 75% ocupado
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
    }
}
