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
            $table->id();
            $table->foreignId('vuelo_id')->constrained('vuelos');
            $table->foreignId('clase_id')->constrained('clases');
            $table->foreignId('estado_id')->constrained('estados');
            $table->string('numero');
            $table->decimal('precio_base', 8, 2);
            $table->timestamp('reserva_temporal')->nullable()->after('estado_id');
            $table->timestamps();
            $table->unique(['vuelo_id', 'numero']);
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
