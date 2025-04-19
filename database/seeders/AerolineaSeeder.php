<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Aerolinea;
use App\Models\Pais;

class AerolineaSeeder extends Seeder
{
    public function run(): void
    {
        $aerolineas = [
            ['nombre' => 'American Airlines', 'codigo_iata' => 'AA', 'pais' => 'Estados Unidos'],
            ['nombre' => 'Delta Air Lines', 'codigo_iata' => 'DL', 'pais' => 'Estados Unidos'],
            ['nombre' => 'United Airlines', 'codigo_iata' => 'UA', 'pais' => 'Estados Unidos'],
            ['nombre' => 'Lufthansa', 'codigo_iata' => 'LH', 'pais' => 'Alemania'],
            ['nombre' => 'Air France', 'codigo_iata' => 'AF', 'pais' => 'Francia'],
            ['nombre' => 'British Airways', 'codigo_iata' => 'BA', 'pais' => 'Reino Unido'],
            ['nombre' => 'Emirates', 'codigo_iata' => 'EK', 'pais' => 'Emiratos Árabes Unidos'],
            ['nombre' => 'Qatar Airways', 'codigo_iata' => 'QR', 'pais' => 'Catar'],
            ['nombre' => 'Singapore Airlines', 'codigo_iata' => 'SQ', 'pais' => 'Singapur'],
            ['nombre' => 'Qantas', 'codigo_iata' => 'QF', 'pais' => 'Australia'],
            ['nombre' => 'Japan Airlines', 'codigo_iata' => 'JL', 'pais' => 'Japón'],
            ['nombre' => 'ANA', 'codigo_iata' => 'NH', 'pais' => 'Japón'],
            ['nombre' => 'KLM', 'codigo_iata' => 'KL', 'pais' => 'Países Bajos'],
            ['nombre' => 'Turkish Airlines', 'codigo_iata' => 'TK', 'pais' => 'Turquía'],
            ['nombre' => 'Aeroméxico', 'codigo_iata' => 'AM', 'pais' => 'México'],
            ['nombre' => 'LATAM Airlines', 'codigo_iata' => 'LA', 'pais' => 'Chile'],
            ['nombre' => 'Avianca', 'codigo_iata' => 'AV', 'pais' => 'Colombia'],
            ['nombre' => 'Air Canada', 'codigo_iata' => 'AC', 'pais' => 'Canadá'],
            ['nombre' => 'Iberia', 'codigo_iata' => 'IB', 'pais' => 'España'],
            ['nombre' => 'Etihad Airways', 'codigo_iata' => 'EY', 'pais' => 'Emiratos Árabes Unidos'],
        ];

        foreach ($aerolineas as $aerolinea) {
            $pais = Pais::where('nombre', $aerolinea['pais'])->first();

            if ($pais) {
                Aerolinea::create([
                    'nombre' => $aerolinea['nombre'],
                    'codigo_iata' => $aerolinea['codigo_iata'],
                    'pais_id' => $pais->id,
                ]);
            }
        }
    }
}
