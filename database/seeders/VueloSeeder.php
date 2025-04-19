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

        $avion = $aviones->random();
        $fechaSalida = Carbon::now()->addDay();
        $fechaLlegada = (clone $fechaSalida)->addHours(rand(2, 3));

        Vuelo::create([
            'id_avion' => $avion->id,
            'id_aeropuerto_origen' => $origenMadrid->id,
            'id_aeropuerto_destino' => $destinoLondres->id,
            'fecha_salida' => $fechaSalida,
            'fecha_llegada' => $fechaLlegada,
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
                'id_avion' => $avion->id,
                'id_aeropuerto_origen' => $origen->id,
                'id_aeropuerto_destino' => $destino->id,
                'fecha_salida' => $fechaSalida,
                'fecha_llegada' => $fechaLlegada,
            ]);
        }
    }
}
