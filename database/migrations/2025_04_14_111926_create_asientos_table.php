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
        Schema::create('asientos', function (Blueprint $table) {
            $table->id(); // PK simple
            $table->foreignId('id_vuelo')->constrained('vuelos');
            $table->foreignId('id_clase')->constrained('clases');
            $table->foreignId('id_estado')->constrained('estados');
            $table->string('numero');
            $table->timestamps();
            $table->unique(['id_vuelo', 'numero']);
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asientos');
    }
};
