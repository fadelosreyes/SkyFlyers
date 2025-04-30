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
        $table->integer('capacidad');
        $table->string('matricula')->unique();
        $table->foreignId('aerolinea_id')->constrained('aerolineas');
        $table->timestamps();
    });
}
//cambiar a numero de filas y poner la clase con su numero de asientos
//ej... asientos y filas primera...

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aviones');
    }
};
