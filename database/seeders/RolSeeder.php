<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rol;

class RolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['nombre' => 'admin'],
            ['nombre' => 'usuario'],
        ];

        foreach ($roles as $role) {
            Rol::firstOrCreate(['nombre' => $role['nombre']]);
        }
    }
}
