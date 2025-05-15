<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('aviones', function (Blueprint $table) {
            $table->id();
            $table->string('modelo');
            $table->char('codigo_icao', 4);
            $table->integer('numero_filas');
            $table->integer('asientos_por_fila');
            $table->string('matricula')->unique();
            $table->foreignId('aerolinea_id')->constrained('aerolineas');
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aviones');
    }
};
