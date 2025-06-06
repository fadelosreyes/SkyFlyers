<?php

namespace Database\Seeders;

use App\Models\Asiento;
use App\Models\User;
use App\Models\Rol;
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

        $this->call([PaisSeeder::class,
                    AerolineaSeeder::class,
                    AvionSeeder::class,
                    AeropuertoSeeder::class,
                    VueloSeeder::class,
                    EstadoSeeder::class,
                    ClaseSeeder::class,
                    AsientoSeeder::class,
                    RolSeeder::class]);

        User::factory()->create([
            'name' => 'admin',
            'email' => 'admin@admin.com',
            'password' => bcrypt('adminadmin'),
            'role_id' => Rol::where('nombre', 'admin')->first()->id,
        ]);

        User::factory()->create([
            'name' => 'fran',
            'email' => 'fran@user.com',
            'password' => bcrypt('franfran'),
            'role_id' => Rol::where('nombre', 'usuario')->first()->id,
        ]);

    }
}
