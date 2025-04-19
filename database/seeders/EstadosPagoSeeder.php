<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadosPagoSeeder extends Seeder
{
    public function run(): void
    {
        $estados = ['Pendiente', 'Pagado', 'Fallido', 'Reembolsado'];

        foreach ($estados as $estado) {
            DB::table('estados_pago')->insert([
                'nombre' => $estado,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
