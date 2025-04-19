<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MetodosPagoSeeder extends Seeder
{
    public function run(): void
    {
        $metodosPago = ['Tarjeta de crédito', 'PayPal', 'Transferencia bancaria', 'Bitcoin'];

        foreach ($metodosPago as $metodo) {
            DB::table('metodos_pago')->insert([
                'nombre' => $metodo,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
