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
            ['modelo' => 'Boeing 737', 'codigo_icao' => 'B737', 'capacidad' => 160, 'matricula' => 'AR123AR', 'aerolinea' => 'Aerolineas Argentinas'],
            ['modelo' => 'Airbus A380', 'codigo_icao' => 'A380', 'capacidad' => 500, 'matricula' => 'AU123AU', 'aerolinea' => 'Qantas Airways'],
            ['modelo' => 'Boeing 777', 'codigo_icao' => 'B777', 'capacidad' => 350, 'matricula' => 'DE123DE', 'aerolinea' => 'Lufthansa'],
            ['modelo' => 'Airbus A320', 'codigo_icao' => 'A320', 'capacidad' => 180, 'matricula' => 'BR123BR', 'aerolinea' => 'LATAM Airlines'],
            ['modelo' => 'Boeing 787', 'codigo_icao' => 'B787', 'capacidad' => 250, 'matricula' => 'CA123CA', 'aerolinea' => 'Air Canada'],
            ['modelo' => 'Airbus A350', 'codigo_icao' => 'A350', 'capacidad' => 300, 'matricula' => 'CL123CL', 'aerolinea' => 'LATAM Airlines'],
            ['modelo' => 'Boeing 737', 'codigo_icao' => 'B737', 'capacidad' => 160, 'matricula' => 'CN123CN', 'aerolinea' => 'China Airlines'],
            ['modelo' => 'Airbus A321', 'codigo_icao' => 'A321', 'capacidad' => 220, 'matricula' => 'CO123CO', 'aerolinea' => 'Avianca'],
            ['modelo' => 'Boeing 777', 'codigo_icao' => 'B777', 'capacidad' => 350, 'matricula' => 'KR123KR', 'aerolinea' => 'Korean Air'],
            ['modelo' => 'Boeing 787', 'codigo_icao' => 'B787', 'capacidad' => 250, 'matricula' => 'EG123EG', 'aerolinea' => 'EgyptAir'],
            ['modelo' => 'Airbus A320', 'codigo_icao' => 'A320', 'capacidad' => 180, 'matricula' => 'ES123ES', 'aerolinea' => 'Iberia'],
            ['modelo' => 'Boeing 737', 'codigo_icao' => 'B737', 'capacidad' => 160, 'matricula' => 'US123US', 'aerolinea' => 'American Airlines'],
            ['modelo' => 'Airbus A330', 'codigo_icao' => 'A330', 'capacidad' => 300, 'matricula' => 'FI123FI', 'aerolinea' => 'Finnair'],
            ['modelo' => 'Boeing 777', 'codigo_icao' => 'B777', 'capacidad' => 350, 'matricula' => 'FR123FR', 'aerolinea' => 'Air France'],
            ['modelo' => 'Airbus A321', 'codigo_icao' => 'A321', 'capacidad' => 220, 'matricula' => 'GR123GR', 'aerolinea' => 'Aegean Airlines'],
            ['modelo' => 'Boeing 747', 'codigo_icao' => 'B747', 'capacidad' => 400, 'matricula' => 'HU123HU', 'aerolinea' => 'Hainan Airlines'],
            ['modelo' => 'Airbus A320', 'codigo_icao' => 'A320', 'capacidad' => 180, 'matricula' => 'IN123IN', 'aerolinea' => 'Air India'],
            ['modelo' => 'Boeing 777', 'codigo_icao' => 'B777', 'capacidad' => 350, 'matricula' => 'ID123ID', 'aerolinea' => 'Garuda Indonesia'],
            ['modelo' => 'Boeing 787', 'codigo_icao' => 'B787', 'capacidad' => 250, 'matricula' => 'IE123IE', 'aerolinea' => 'Aer Lingus'],
            ['modelo' => 'Airbus A321', 'codigo_icao' => 'A321', 'capacidad' => 220, 'matricula' => 'IL123IL', 'aerolinea' => 'El Al'],
            ['modelo' => 'Airbus A350', 'codigo_icao' => 'A350', 'capacidad' => 300, 'matricula' => 'IT123IT', 'aerolinea' => 'Alitalia'],
            ['modelo' => 'Boeing 737', 'codigo_icao' => 'B737', 'capacidad' => 160, 'matricula' => 'JP123JP', 'aerolinea' => 'Japan Airlines'],
            ['modelo' => 'Boeing 777', 'codigo_icao' => 'B777', 'capacidad' => 350, 'matricula' => 'MX123MX', 'aerolinea' => 'Aeroméxico'],
            ['modelo' => 'Airbus A320', 'codigo_icao' => 'A320', 'capacidad' => 180, 'matricula' => 'MA123MA', 'aerolinea' => 'Royal Air Maroc'],
            ['modelo' => 'Airbus A380', 'codigo_icao' => 'A380', 'capacidad' => 500, 'matricula' => 'NO123NO', 'aerolinea' => 'Norwegian Air Shuttle'],
            ['modelo' => 'Boeing 787', 'codigo_icao' => 'B787', 'capacidad' => 250, 'matricula' => 'NZ123NZ', 'aerolinea' => 'Air New Zealand'],
            ['modelo' => 'Boeing 777', 'codigo_icao' => 'B777', 'capacidad' => 350, 'matricula' => 'NL123NL', 'aerolinea' => 'KLM Royal Dutch Airlines'],
            ['modelo' => 'Boeing 747', 'codigo_icao' => 'B747', 'capacidad' => 400, 'matricula' => 'PE123PE', 'aerolinea' => 'Peruvian Airlines'],
            ['modelo' => 'Airbus A320', 'codigo_icao' => 'A320', 'capacidad' => 180, 'matricula' => 'PL123PL', 'aerolinea' => 'LOT Polish Airlines'],
            ['modelo' => 'Boeing 787', 'codigo_icao' => 'B787', 'capacidad' => 250, 'matricula' => 'PT123PT', 'aerolinea' => 'TAP Air Portugal'],
            ['modelo' => 'Airbus A350', 'codigo_icao' => 'A350', 'capacidad' => 300, 'matricula' => 'GB123GB', 'aerolinea' => 'British Airways'],
            ['modelo' => 'Boeing 777', 'codigo_icao' => 'B777', 'capacidad' => 350, 'matricula' => 'CZ123CZ', 'aerolinea' => 'Czech Airlines'],
            ['modelo' => 'Boeing 747', 'codigo_icao' => 'B747', 'capacidad' => 400, 'matricula' => 'RO123RO', 'aerolinea' => 'Tarom'],
            ['modelo' => 'Airbus A320', 'codigo_icao' => 'A320', 'capacidad' => 180, 'matricula' => 'RU123RU', 'aerolinea' => 'Aeroflot'],
            ['modelo' => 'Boeing 787', 'codigo_icao' => 'B787', 'capacidad' => 250, 'matricula' => 'SG123SG', 'aerolinea' => 'Singapore Airlines'],
            ['modelo' => 'Airbus A350', 'codigo_icao' => 'A350', 'capacidad' => 300, 'matricula' => 'ZA123ZA', 'aerolinea' => 'South African Airways'],
            ['modelo' => 'Boeing 737', 'codigo_icao' => 'B737', 'capacidad' => 160, 'matricula' => 'SE123SE', 'aerolinea' => 'SAS Scandinavian Airlines'],
            ['modelo' => 'Airbus A380', 'codigo_icao' => 'A380', 'capacidad' => 500, 'matricula' => 'CH123CH', 'aerolinea' => 'Swiss International Air Lines'],
            ['modelo' => 'Boeing 787', 'codigo_icao' => 'B787', 'capacidad' => 250, 'matricula' => 'TH123TH', 'aerolinea' => 'Thai Airways'],
            ['modelo' => 'Boeing 747', 'codigo_icao' => 'B747', 'capacidad' => 400, 'matricula' => 'TR123TR', 'aerolinea' => 'Turkish Airlines'],
            ['modelo' => 'Boeing 777', 'codigo_icao' => 'B777', 'capacidad' => 350, 'matricula' => 'UA123UA', 'aerolinea' => 'Ukraine International Airlines'],
            ['modelo' => 'Airbus A350', 'codigo_icao' => 'A350', 'capacidad' => 300, 'matricula' => 'UY123UY', 'aerolinea' => 'AeroMéxico'],
            ['modelo' => 'Boeing 787', 'codigo_icao' => 'B787', 'capacidad' => 250, 'matricula' => 'VE123VE', 'aerolinea' => 'Conviasa'],
            ['modelo' => 'Boeing 737', 'codigo_icao' => 'B737', 'capacidad' => 160, 'matricula' => 'VN123VN', 'aerolinea' => 'Vietnam Airlines'],
            ['modelo' => 'Airbus A320', 'codigo_icao' => 'A320', 'capacidad' => 180, 'matricula' => 'PK123PK', 'aerolinea' => 'Pakistan International Airlines'],
            ['modelo' => 'Boeing 737', 'codigo_icao' => 'B737', 'capacidad' => 160, 'matricula' => 'PH123PH', 'aerolinea' => 'Philippine Airlines'],
            ['modelo' => 'Airbus A350', 'codigo_icao' => 'A350', 'capacidad' => 300, 'matricula' => 'AE123AE', 'aerolinea' => 'Emirates'],
        ];

        foreach ($aviones as $avion) {
            $aerolinea = Aerolinea::where('nombre', $avion['aerolinea'])->first();
            if ($aerolinea) {
                Avion::create([
                    'modelo' => $avion['modelo'],
                    'codigo_icao' => $avion['codigo_icao'],
                    'capacidad' => $avion['capacidad'],
                    'matricula' => $avion['matricula'],
                    'aerolinea_id' => $aerolinea->id
                ]);
            }
        }
    }
}
