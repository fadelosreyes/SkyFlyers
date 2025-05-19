<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Avion;
use App\Models\Aeropuerto;
use App\Models\Vuelo;
use App\Models\Clase;
use App\Models\Estado;
use App\Models\Asiento;
use Carbon\Carbon;

class AsientoSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Asegúrate de que exista el estado "Libre"
        $estadoLibre = Estado::firstOrCreate(
            ['nombre' => 'Libre'],
            ['descripcion' => 'Asiento disponible']
        );

        // 2) Obtener datos base
        $aviones     = Avion::all();
        $aeropuertos = Aeropuerto::all();
        $clases      = Clase::all()->keyBy('nombre');

        // 3) Buscar aeropuertos de origen y destino
        $origen = $aeropuertos
            ->where('ciudad', 'Madrid')
            ->where('pais', 'España')
            ->first();

        $destino = $aeropuertos
            ->where('ciudad', 'Londres')
            ->where('pais', 'Reino Unido')
            ->first();

        if (! $origen || ! $destino) {
            $this->command->error("No se encontraron aeropuertos de Madrid o Londres. Seeder abortado.");
            return;
        }

        // 4) Crear vuelo de ejemplo
        if ($aviones->isEmpty()) {
            $this->command->error("No hay aviones disponibles para asignar al vuelo.");
            return;
        }
        $avion = $aviones->random();

        $fechaSalida  = Carbon::now()->addDay();
        $fechaLlegada = (clone $fechaSalida)->addHours(rand(2, 3));

        $vuelo = Vuelo::create([
            'avion_id'              => $avion->id,
            'aeropuerto_origen_id'  => $origen->id,
            'aeropuerto_destino_id' => $destino->id,
            'fecha_salida'          => $fechaSalida,
            'fecha_llegada'         => $fechaLlegada,
        ]);

        $this->command->info("Generando asientos para el vuelo #{$vuelo->id}...");

        // 5) Eliminar asientos previos para este vuelo
        Asiento::where('vuelo_id', $vuelo->id)->delete();

        // 6) Definir configuración de filas, columnas y precio según clase
        $mapaClases = [
            'Primera'  => ['filas' => $avion->filas_primera,  'cols' => 2, 'precio' => 500],
            'Business' => ['filas' => $avion->filas_business, 'cols' => 4, 'precio' => 250],
            'Turista'  => ['filas' => $avion->filas_turista,  'cols' => 6, 'precio' => 100],
        ];

        // 7) Crear asientos según configuración, con filas consecutivas
        $filaInicio = 1;
        foreach ($mapaClases as $nombreClase => $cfg) {
            if (! isset($clases[$nombreClase])) {
                $this->command->warn("Clase «{$nombreClase}» no existe, se omite.");
                continue;
            }

            $idClase = $clases[$nombreClase]->id;
            $precio  = $cfg['precio'];
            $filas   = $cfg['filas'];
            $columnas = $cfg['cols'];

            for ($fila = $filaInicio; $fila < $filaInicio + $filas; $fila++) {
                for ($col = 0; $col < $columnas; $col++) {
                    $numero = $fila . chr(ord('A') + $col);

                    Asiento::create([
                        'vuelo_id'     => $vuelo->id,
                        'clase_id'     => $idClase,
                        'estado_id'    => $estadoLibre->id,
                        'numero'       => $numero,
                        'precio_base'  => $precio,
                    ]);
                }
            }

            $filaInicio += $filas; // Avanzamos la fila de inicio para la siguiente clase
        }

        $this->command->info("Asientos para el vuelo #{$vuelo->id} creados correctamente.");
    }
}
