<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Aeropuerto;

class AeropuertoSeeder extends Seeder
{
    public function run(): void
    {
        $aeropuertos = [
            ['nombre' => 'Aeropuerto Internacional Ministro Pistarini', 'ciudad' => 'Buenos Aires', 'pais' => 'Argentina', 'codigo_iata' => 'EZE'],
            ['nombre' => 'Aeropuerto Internacional Kingsford Smith', 'ciudad' => 'Sídney', 'pais' => 'Australia', 'codigo_iata' => 'SYD'],
            ['nombre' => 'Aeropuerto de Frankfurt', 'ciudad' => 'Fráncfort', 'pais' => 'Alemania', 'codigo_iata' => 'FRA'],
            ['nombre' => 'Aeropuerto Internacional de São Paulo-Guarulhos', 'ciudad' => 'São Paulo', 'pais' => 'Brasil', 'codigo_iata' => 'GRU'],
            ['nombre' => 'Aeropuerto Internacional de Toronto Pearson', 'ciudad' => 'Toronto', 'pais' => 'Canadá', 'codigo_iata' => 'YYZ'],
            ['nombre' => 'Aeropuerto Internacional El Dorado', 'ciudad' => 'Bogotá', 'pais' => 'Colombia', 'codigo_iata' => 'BOG'],
            ['nombre' => 'Aeropuerto Internacional de Pekín-Capital', 'ciudad' => 'Pekín', 'pais' => 'China', 'codigo_iata' => 'PEK'],
            ['nombre' => 'Aeropuerto Internacional de Incheon', 'ciudad' => 'Seúl', 'pais' => 'Corea del Sur', 'codigo_iata' => 'ICN'],
            ['nombre' => 'Aeropuerto Internacional de El Cairo', 'ciudad' => 'El Cairo', 'pais' => 'Egipto', 'codigo_iata' => 'CAI'],
            ['nombre' => 'Aeropuerto Adolfo Suárez Madrid-Barajas', 'ciudad' => 'Madrid', 'pais' => 'España', 'codigo_iata' => 'MAD'],
            ['nombre' => 'Aeropuerto Internacional de Los Ángeles', 'ciudad' => 'Los Ángeles', 'pais' => 'Estados Unidos', 'codigo_iata' => 'LAX'],
            ['nombre' => 'Aeropuerto de Helsinki-Vantaa', 'ciudad' => 'Helsinki', 'pais' => 'Finlandia', 'codigo_iata' => 'HEL'],
            ['nombre' => 'Aeropuerto Charles de Gaulle', 'ciudad' => 'París', 'pais' => 'Francia', 'codigo_iata' => 'CDG'],
            ['nombre' => 'Aeropuerto Internacional Eleftherios Venizelos', 'ciudad' => 'Atenas', 'pais' => 'Grecia', 'codigo_iata' => 'ATH'],
            ['nombre' => 'Aeropuerto Internacional de Delhi', 'ciudad' => 'Nueva Delhi', 'pais' => 'India', 'codigo_iata' => 'DEL'],
            ['nombre' => 'Aeropuerto Internacional de Soekarno-Hatta', 'ciudad' => 'Yakarta', 'pais' => 'Indonesia', 'codigo_iata' => 'CGK'],
            ['nombre' => 'Aeropuerto de Dublín', 'ciudad' => 'Dublín', 'pais' => 'Irlanda', 'codigo_iata' => 'DUB'],
            ['nombre' => 'Aeropuerto Ben Gurion', 'ciudad' => 'Tel Aviv', 'pais' => 'Israel', 'codigo_iata' => 'TLV'],
            ['nombre' => 'Aeropuerto Leonardo da Vinci-Fiumicino', 'ciudad' => 'Roma', 'pais' => 'Italia', 'codigo_iata' => 'FCO'],
            ['nombre' => 'Aeropuerto Internacional de Narita', 'ciudad' => 'Tokio', 'pais' => 'Japón', 'codigo_iata' => 'NRT'],
            ['nombre' => 'Aeropuerto Internacional de Ciudad de México', 'ciudad' => 'Ciudad de México', 'pais' => 'México', 'codigo_iata' => 'MEX'],
            ['nombre' => 'Aeropuerto Internacional Mohammed V', 'ciudad' => 'Casablanca', 'pais' => 'Marruecos', 'codigo_iata' => 'CMN'],
            ['nombre' => 'Aeropuerto de Oslo-Gardermoen', 'ciudad' => 'Oslo', 'pais' => 'Noruega', 'codigo_iata' => 'OSL'],
            ['nombre' => 'Aeropuerto Internacional de Auckland', 'ciudad' => 'Auckland', 'pais' => 'Nueva Zelanda', 'codigo_iata' => 'AKL'],
            ['nombre' => 'Aeropuerto de Ámsterdam-Schiphol', 'ciudad' => 'Ámsterdam', 'pais' => 'Países Bajos', 'codigo_iata' => 'AMS'],
            ['nombre' => 'Aeropuerto Jorge Chávez', 'ciudad' => 'Lima', 'pais' => 'Perú', 'codigo_iata' => 'LIM'],
            ['nombre' => 'Aeropuerto Chopin de Varsovia', 'ciudad' => 'Varsovia', 'pais' => 'Polonia', 'codigo_iata' => 'WAW'],
            ['nombre' => 'Aeropuerto de Lisboa', 'ciudad' => 'Lisboa', 'pais' => 'Portugal', 'codigo_iata' => 'LIS'],
            ['nombre' => 'Aeropuerto de Londres-Heathrow', 'ciudad' => 'Londres', 'pais' => 'Reino Unido', 'codigo_iata' => 'LHR'],
            ['nombre' => 'Aeropuerto Vaclav Havel', 'ciudad' => 'Praga', 'pais' => 'República Checa', 'codigo_iata' => 'PRG'],
            ['nombre' => 'Aeropuerto Internacional Henri Coandă', 'ciudad' => 'Bucarest', 'pais' => 'Rumanía', 'codigo_iata' => 'OTP'],
            ['nombre' => 'Aeropuerto Internacional de Sheremétievo', 'ciudad' => 'Moscú', 'pais' => 'Rusia', 'codigo_iata' => 'SVO'],
            ['nombre' => 'Aeropuerto Changi', 'ciudad' => 'Singapur', 'pais' => 'Singapur', 'codigo_iata' => 'SIN'],
            ['nombre' => 'Aeropuerto Internacional OR Tambo', 'ciudad' => 'Johannesburgo', 'pais' => 'Sudáfrica', 'codigo_iata' => 'JNB'],
            ['nombre' => 'Aeropuerto de Estocolmo-Arlanda', 'ciudad' => 'Estocolmo', 'pais' => 'Suecia', 'codigo_iata' => 'ARN'],
            ['nombre' => 'Aeropuerto de Zúrich', 'ciudad' => 'Zúrich', 'pais' => 'Suiza', 'codigo_iata' => 'ZRH'],
            ['nombre' => 'Aeropuerto Internacional de Suvarnabhumi', 'ciudad' => 'Bangkok', 'pais' => 'Tailandia', 'codigo_iata' => 'BKK'],
            ['nombre' => 'Aeropuerto de Estambul', 'ciudad' => 'Estambul', 'pais' => 'Turquía', 'codigo_iata' => 'IST'],
            ['nombre' => 'Aeropuerto Internacional de Borýspil', 'ciudad' => 'Kiev', 'pais' => 'Ucrania', 'codigo_iata' => 'KBP'],
            ['nombre' => 'Aeropuerto Internacional Simón Bolívar', 'ciudad' => 'Caracas', 'pais' => 'Venezuela', 'codigo_iata' => 'CCS'],
            ['nombre' => 'Aeropuerto Internacional de Hanói', 'ciudad' => 'Hanói', 'pais' => 'Vietnam', 'codigo_iata' => 'HAN'],
            ['nombre' => 'Aeropuerto Internacional Jinnah', 'ciudad' => 'Karachi', 'pais' => 'Pakistán', 'codigo_iata' => 'KHI'],
            ['nombre' => 'Aeropuerto Internacional Ninoy Aquino', 'ciudad' => 'Manila', 'pais' => 'Filipinas', 'codigo_iata' => 'MNL'],
            ['nombre' => 'Aeropuerto Internacional de Dubái', 'ciudad' => 'Dubái', 'pais' => 'Emiratos Árabes Unidos', 'codigo_iata' => 'DXB'],
            ['nombre' => 'Aeropuerto Internacional John F. Kennedy', 'ciudad' => 'Nueva York', 'pais' => 'Estados Unidos', 'codigo_iata' => 'JFK'],
            ['nombre' => 'Aeropuerto Internacional de Miami', 'ciudad' => 'Miami', 'pais' => 'Estados Unidos', 'codigo_iata' => 'MIA'],
            ['nombre' => 'Aeropuerto Internacional O’Hare', 'ciudad' => 'Chicago', 'pais' => 'Estados Unidos', 'codigo_iata' => 'ORD'],
            ['nombre' => 'Aeropuerto Internacional Hartsfield-Jackson', 'ciudad' => 'Atlanta', 'pais' => 'Estados Unidos', 'codigo_iata' => 'ATL'],
            ['nombre' => 'Aeropuerto Internacional Hamad', 'ciudad' => 'Doha', 'pais' => 'Catar', 'codigo_iata' => 'DOH'],
            ['nombre' => 'Aeropuerto Internacional de Hong Kong', 'ciudad' => 'Hong Kong', 'pais' => 'China', 'codigo_iata' => 'HKG'],
            ['nombre' => 'Aeropuerto Internacional de Kuala Lumpur', 'ciudad' => 'Kuala Lumpur', 'pais' => 'Malasia', 'codigo_iata' => 'KUL'],
            ['nombre' => 'Aeropuerto Internacional de Bruselas', 'ciudad' => 'Bruselas', 'pais' => 'Bélgica', 'codigo_iata' => 'BRU'],
            ['nombre' => 'Aeropuerto de Barcelona-El Prat', 'ciudad' => 'Barcelona', 'pais' => 'España', 'codigo_iata' => 'BCN'],
        ];

        foreach ($aeropuertos as $aeropuerto) {
            Aeropuerto::create($aeropuerto);
        }
    }
}
