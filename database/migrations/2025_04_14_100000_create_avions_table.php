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
            $table->string('matricula')->unique();
            $table->foreignId('aerolinea_id')->constrained('aerolineas');

            $table->integer('filas_primera')->nullable();
            $table->integer('asientos_por_fila_primera')->nullable();

            $table->integer('filas_business')->nullable();
            $table->integer('asientos_por_fila_business')->nullable();

            $table->integer('filas_turista')->nullable();
            $table->integer('asientos_por_fila_turista')->nullable();

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
