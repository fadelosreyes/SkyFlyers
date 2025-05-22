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
        Schema::create('vuelos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('avion_id')->constrained('aviones');
            $table->foreignId('aeropuerto_origen_id')->constrained('aeropuertos');
            $table->foreignId('aeropuerto_destino_id')->constrained('aeropuertos');
            $table->dateTime('fecha_salida');
            $table->dateTime('fecha_llegada');
            $table->string('imagen')->nullable();
            $table->boolean('destacado')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vuelos');
    }
};

