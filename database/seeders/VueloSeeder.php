<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vuelo;
use App\Models\Avion;
use App\Models\Aeropuerto;
use App\Helpers\ImagenCiudadHelper;
use Illuminate\Support\Carbon;

class VueloSeeder extends Seeder
{
    public function run(): void
    {
        $aviones = Avion::all();
        $aeropuertos = Aeropuerto::all();

        $crearVueloDestacadoConImagen = function ($origen, $destino) use ($aviones) {
            if (!$origen || !$destino) {
                return;
            }

            $fechaSalida = Carbon::now()->addDays(rand(1, 30));
            $fechaLlegada = (clone $fechaSalida)->addHours(rand(2, 10));
            $imagenUrl = ImagenCiudadHelper::obtenerImagenDeCiudad($destino->ciudad);

            Vuelo::create([
                'avion_id' => $aviones->random()->id,
                'aeropuerto_origen_id' => $origen->id,
                'aeropuerto_destino_id' => $destino->id,
                'fecha_salida' => $fechaSalida,
                'fecha_llegada' => $fechaLlegada,
                'imagen' => $imagenUrl,
                'destacado' => true,
            ]);
        };

        // 1) Crear 5 vuelos destacados con imagen (los más importantes)
        $destacadosConImagen = [
            ['origen' => ['ciudad' => 'Madrid', 'pais' => 'España'], 'destino' => ['ciudad' => 'Nueva York', 'pais' => 'Estados Unidos']],
            ['origen' => ['ciudad' => 'Barcelona', 'pais' => 'España'], 'destino' => ['ciudad' => 'Tokio', 'pais' => 'Japón']],
            ['origen' => ['ciudad' => 'Madrid', 'pais' => 'España'], 'destino' => ['ciudad' => 'Dubái', 'pais' => 'Emiratos Árabes Unidos']],
            ['origen' => ['ciudad' => 'Madrid', 'pais' => 'España'], 'destino' => ['ciudad' => 'Londres', 'pais' => 'Reino Unido']],
            ['origen' => ['ciudad' => 'Madrid', 'pais' => 'España'], 'destino' => ['ciudad' => 'Barcelona', 'pais' => 'España']],
        ];

        foreach ($destacadosConImagen as $vuelo) {
            $origen = $aeropuertos->where('ciudad', $vuelo['origen']['ciudad'])->where('pais', $vuelo['origen']['pais'])->first();
            $destino = $aeropuertos->where('ciudad', $vuelo['destino']['ciudad'])->where('pais', $vuelo['destino']['pais'])->first();
            $crearVueloDestacadoConImagen($origen, $destino);
        }

        // Vuelos Madrid - Londres para mañana, sin imagen

        $origenMadrid = $aeropuertos->where('ciudad', 'Madrid')->where('pais', 'España')->first();
        $destinoLondres = $aeropuertos->where('ciudad', 'Londres')->where('pais', 'Reino Unido')->first();

        if ($origenMadrid && $destinoLondres && $aviones->count() > 0) {
            // Vuelo 1 - 09:00
            $fechaSalida1 = Carbon::tomorrow()->setTime(9, 0, 0);
            $fechaLlegada1 = (clone $fechaSalida1)->addHours(2);

            Vuelo::create([
                'avion_id' => $aviones->random()->id,
                'aeropuerto_origen_id' => $origenMadrid->id,
                'aeropuerto_destino_id' => $destinoLondres->id,
                'fecha_salida' => $fechaSalida1,
                'fecha_llegada' => $fechaLlegada1,
                'imagen' => null,
                'destacado' => false,
            ]);

            // Vuelo 2 - 12:00
            $fechaSalida2 = Carbon::tomorrow()->setTime(12, 0, 0);
            $fechaLlegada2 = (clone $fechaSalida2)->addHours(2);

            Vuelo::create([
                'avion_id' => $aviones->random()->id,
                'aeropuerto_origen_id' => $origenMadrid->id,
                'aeropuerto_destino_id' => $destinoLondres->id,
                'fecha_salida' => $fechaSalida2,
                'fecha_llegada' => $fechaLlegada2,
                'imagen' => null,
                'destacado' => false,
            ]);

            // Vuelo 3 - 17:30
            $fechaSalida3 = Carbon::tomorrow()->setTime(17, 30, 0);
            $fechaLlegada3 = (clone $fechaSalida3)->addHours(2);

            Vuelo::create([
                'avion_id' => $aviones->random()->id,
                'aeropuerto_origen_id' => $origenMadrid->id,
                'aeropuerto_destino_id' => $destinoLondres->id,
                'fecha_salida' => $fechaSalida3,
                'fecha_llegada' => $fechaLlegada3,
                'imagen' => null,
                'destacado' => false,
            ]);
        }


        // 3) 50 vuelos normales sin imagen
        foreach (range(1, 50) as $i) {
            do {
                $origen = $aeropuertos->random();
                $destino = $aeropuertos->random();
            } while ($origen->id === $destino->id);

            $fechaSalida = Carbon::now()->addDays(rand(1, 30));
            $fechaLlegada = (clone $fechaSalida)->addHours(rand(2, 10));

            Vuelo::create([
                'avion_id' => $aviones->random()->id,
                'aeropuerto_origen_id' => $origen->id,
                'aeropuerto_destino_id' => $destino->id,
                'fecha_salida' => $fechaSalida,
                'fecha_llegada' => $fechaLlegada,
                'imagen' => null,
                'destacado' => false,
            ]);
        }
    }
}
