<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Avion;
use App\Models\Aerolinea;

class AvionSeeder extends Seeder
{
    public function run(): void
    {
        $aviones = [
            // modelo, código ICAO, matrícula, aerolínea, filas, asientos/fila
            ['Boeing 737',  'B737', 'AR123AR', 'Aerolineas Argentinas',    20,  8],
            ['Airbus A380', 'A380', 'AU123AU', 'Qantas Airways',           50, 10],
            ['Boeing 777',  'B777', 'DE123DE', 'Lufthansa',               44,  8],
            ['Airbus A320', 'A320', 'BR123BR', 'LATAM Airlines',          30,  6],
            ['Boeing 787',  'B787', 'CA123CA', 'Air Canada',              32,  8],
            ['Airbus A350', 'A350', 'CL123CL', 'LATAM Airlines',          37,  8],
            ['Boeing 737',  'B737', 'CN123CN', 'China Airlines',          20,  8],
            ['Airbus A321', 'A321', 'CO123CO', 'Avianca',                 36,  6],
            ['Boeing 777',  'B777', 'KR123KR', 'Korean Air',              44,  8],
            ['Boeing 787',  'B787', 'EG123EG', 'EgyptAir',                32,  8],
            ['Airbus A330', 'A330', 'ES123ES', 'Iberia',                  34,  8],
            ['Boeing 737',  'B737', 'US123US', 'American Airlines',       20,  8],
            ['Airbus A330', 'A330', 'FI123FI', 'Finnair',                 34,  8],
            ['Boeing 777',  'B777', 'FR123FR', 'Air France',              44,  8],
            ['Airbus A321', 'A321', 'GR123GR', 'Aegean Airlines',         36,  6],
            ['Boeing 747',  'B747', 'HU123HU', 'Hainan Airlines',         50,  8],
            ['Airbus A320', 'A320', 'IN123IN', 'Air India',               30,  6],
            ['Airbus A350', 'A350', 'IT123IT', 'ITA Airways',             37,  8],
            ['Boeing 737',  'B737', 'JP123JP', 'Japan Airlines',          20,  8],
            ['Airbus A320', 'A320', 'MX123MX', 'Aeromexico',              30,  6],
            ['Boeing 777',  'B777', 'NL123NL', 'KLM Royal Dutch Airlines',44,  8],
            ['Airbus A330', 'A330', 'NZ123NZ', 'Air New Zealand',         34,  8],
            ['Boeing 787',  'B787', 'PT123PT', 'TAP Air Portugal',        32,  8],
        ];

        foreach ($aviones as $data) {
            // Buscamos la aerolínea existente
            $aerolinea = Aerolinea::where('nombre', $data[3])->first();

            if (! $aerolinea) {
                // Si no existe, saltamos este registro
                continue;
            }

            Avion::create([
                'modelo'            => $data[0],
                'codigo_icao'       => $data[1],
                'numero_filas'      => $data[4],
                'asientos_por_fila' => $data[5],
                'matricula'         => $data[2],
                'aerolinea_id'      => $aerolinea->id,
            ]);
        }
    }
}
