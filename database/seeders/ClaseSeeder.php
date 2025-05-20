<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClaseSeeder extends Seeder
{
    public function run(): void
    {
        $clases = ['Turista', 'Primera', 'Business'];

        foreach ($clases as $clase) {
            DB::table('clases')->insert([
                'nombre' => $clase,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
