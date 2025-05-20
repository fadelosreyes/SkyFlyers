<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Avion;
use App\Models\Aerolinea;

class AvionSeeder extends Seeder
{
    public function run(): void
    {
        // Valores por defecto para las clases Primera y Business
        $filasPrimeraDefault            = 4;
        $asientosPorFilaPrimeraDefault  = 4;
        $filasBusinessDefault           = 6;
        $asientosPorFilaBusinessDefault = 4;

        // Lista de aviones: modelo, código ICAO, matrícula, aerolínea, filas_turista, asientos_por_fila_turista
        $aviones = [
            ['Boeing 737',  'B737', 'AR123AR', 'Aerolineas Argentinas',    15,  6],
            ['Airbus A380', 'A380', 'AU123AU', 'Qantas Airways',           15,  6],
            ['Boeing 777',  'B777', 'DE123DE', 'Lufthansa',               15,  6],
            ['Airbus A320', 'A320', 'BR123BR', 'LATAM Airlines',          15,  6],
            ['Boeing 787',  'B787', 'CA123CA', 'Air Canada',              15,  6],
            ['Airbus A350', 'A350', 'CL123CL', 'LATAM Airlines',          15,  6],
            ['Boeing 737',  'B737', 'CN123CN', 'China Airlines',          15,  6],
            ['Airbus A321', 'A321', 'CO123CO', 'Avianca',                 15,  6],
            ['Boeing 777',  'B777', 'KR123KR', 'Korean Air',              15,  6],
            ['Boeing 787',  'B787', 'EG123EG', 'EgyptAir',                15,  6],
            ['Airbus A330', 'A330', 'ES123ES', 'Iberia',                  15,  6],
            ['Boeing 737',  'B737', 'US123US', 'American Airlines',       15,  6],
            ['Airbus A330', 'A330', 'FI123FI', 'Finnair',                 15,  6],
            ['Boeing 777',  'B777', 'FR123FR', 'Air France',              15,  6],
            ['Airbus A321', 'A321', 'GR123GR', 'Aegean Airlines',         15,  6],
            ['Boeing 747',  'B747', 'HU123HU', 'Hainan Airlines',         15,  6],
            ['Airbus A320', 'A320', 'IN123IN', 'Air India',               15,  6],
            ['Airbus A350', 'A350', 'IT123IT', 'ITA Airways',             15,  6],
            ['Boeing 737',  'B737', 'JP123JP', 'Japan Airlines',          15,  6],
            ['Airbus A320', 'A320', 'MX123MX', 'Aeromexico',              15,  6],
            ['Boeing 777',  'B777', 'NL123NL', 'KLM Royal Dutch Airlines', 15,  6],
            ['Airbus A330', 'A330', 'NZ123NZ', 'Air New Zealand',         15,  6],
            ['Boeing 787',  'B787', 'PT123PT', 'TAP Air Portugal',        15,  6],
        ];


        foreach ($aviones as $data) {
            // Buscamos la aerolínea existente
            $aerolinea = Aerolinea::where('nombre', $data[3])->first();

            if (! $aerolinea) {
                // Si no existe la aerolínea, saltamos este registro
                continue;
            }

            Avion::create([
                'modelo'                       => $data[0],
                'codigo_icao'                  => $data[1],
                'matricula'                    => $data[2],
                'aerolinea_id'                 => $aerolinea->id,

                // Distribución Clase Primera
                'filas_primera'                => $filasPrimeraDefault,
                'asientos_por_fila_primera'    => $asientosPorFilaPrimeraDefault,

                // Distribución Clase Business
                'filas_business'               => $filasBusinessDefault,
                'asientos_por_fila_business'   => $asientosPorFilaBusinessDefault,

                // Distribución Clase Turista (datos originales)
                'filas_turista'                => $data[4],
                'asientos_por_fila_turista'    => $data[5],
            ]);
        }
    }
}
