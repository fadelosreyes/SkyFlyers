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

        // 2) Datos base
        $aviones     = Avion::all();
        $aeropuertos = Aeropuerto::all();
        $clases      = Clase::all()->keyBy('nombre');

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

        // 3) Crear vuelo de ejemplo
        $avion        = $aviones->random();
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

        // 4) Limpia asientos previos de este vuelo (si los hubiera)
        Asiento::where('vuelo_id', $vuelo->id)->delete();

        // 5) Configuración de filas, columnas y precios por clase
        $mapaClases = [
            'Primera'  => ['filas' => $avion->filas_primera,  'cols' => $avion->asientos_por_fila_primera,  'precio' => 500],
            'Business' => ['filas' => $avion->filas_business, 'cols' => $avion->asientos_por_fila_business, 'precio' => 250],
            'Turista'  => ['filas' => $avion->filas_turista,  'cols' => $avion->asientos_por_fila_turista,  'precio' => 100],
        ];

        // 6) Generar asientos
        foreach ($mapaClases as $nombreClase => $cfg) {
            if (! isset($clases[$nombreClase])) {
                $this->command->warn("Clase «{$nombreClase}» no existe, se omite.");
                continue;
            }

            $idClase = $clases[$nombreClase]->id;
            $precio  = $cfg['precio'];

            for ($fila = 1; $fila <= $cfg['filas']; $fila++) {
                for ($col = 0; $col < $cfg['cols']; $col++) {
                    $numero = $fila . chr(ord('A') + $col);

                    // Previene duplicados por si acaso
                    $exists = Asiento::where('vuelo_id', $vuelo->id)
                                     ->where('numero', $numero)
                                     ->exists();

                    if ($exists) {
                        continue;
                    }

                    Asiento::create([
                        'vuelo_id'     => $vuelo->id,
                        'clase_id'     => $idClase,
                        'estado_id'    => $estadoLibre->id,
                        'numero'       => $numero,
                        'precio_base'  => $precio,
                    ]);
                }
            }
        }

        $this->command->info("Asientos para el vuelo #{$vuelo->id} creados correctamente.");
    }
}
