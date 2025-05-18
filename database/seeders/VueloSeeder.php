<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vuelo;
use App\Models\Avion;
use App\Models\Aeropuerto;
use Illuminate\Support\Carbon;

class VueloSeeder extends Seeder
{
    public function run(): void
    {
        $aviones = Avion::all();
        $aeropuertos = Aeropuerto::all();

        $origenMadrid = $aeropuertos->where('ciudad', 'Madrid')->where('pais', 'España')->first();
        $destinoLondres = $aeropuertos->where('ciudad', 'Londres')->where('pais', 'Reino Unido')->first();

        // Primer vuelo
        $avion1 = $aviones->random();
        $fechaSalida1 = Carbon::now()->addDay();
        $fechaLlegada1 = (clone $fechaSalida1)->addHours(rand(2, 3));

        Vuelo::create([
            'avion_id' => $avion1->id,
            'aeropuerto_origen_id' => $origenMadrid->id,
            'aeropuerto_destino_id' => $destinoLondres->id,
            'fecha_salida' => $fechaSalida1,
            'fecha_llegada' => $fechaLlegada1,
        ]);

        // Segundo vuelo (igual pero otro avión y fecha)
        $avion2 = $aviones->where('id', '!=', $avion1->id)->random(); // Asegura que no sea el mismo avión
        $fechaSalida2 = Carbon::now()->addDays(2);
        $fechaLlegada2 = (clone $fechaSalida2)->addHours(rand(2, 3));

        Vuelo::create([
            'avion_id' => $avion2->id,
            'aeropuerto_origen_id' => $origenMadrid->id,
            'aeropuerto_destino_id' => $destinoLondres->id,
            'fecha_salida' => $fechaSalida2,
            'fecha_llegada' => $fechaLlegada2,
        ]);

        foreach (range(1, 50) as $i) {
            $avion = $aviones->random();
            do {
                $origen = $aeropuertos->random();
                $destino = $aeropuertos->random();
            } while ($origen->id === $destino->id);

            $fechaSalida = Carbon::now()->addDay();
            $fechaLlegada = (clone $fechaSalida)->addHours(rand(1, 12));

            Vuelo::create([
                'avion_id' => $avion->id,
                'aeropuerto_origen_id' => $origen->id,
                'aeropuerto_destino_id' => $destino->id,
                'fecha_salida' => $fechaSalida,
                'fecha_llegada' => $fechaLlegada,
            ]);
        }
    }
}
