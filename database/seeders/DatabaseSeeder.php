<?php

namespace Database\Seeders;

use App\Models\Asiento;
use App\Models\User;
use Database\Factories\EstadosPagoFactory;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        $this->call([
            PaisSeeder::class,
            AerolineaSeeder::class,
            AvionSeeder::class,
            AeropuertoSeeder::class,
            VueloSeeder::class,
            EstadoSeeder::class,
            ClaseSeeder::class,
            MetodosPagoSeeder::class,
            EstadosPagoSeeder::class,
            AsientoSeeder::class
        ]);
    }
}
