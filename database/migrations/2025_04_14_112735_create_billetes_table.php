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
        Schema::create('billetes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('nombre_pasajero', 255);
            $table->string('documento_identidad', 50);
            $table->foreignId('asiento_id')->constrained('asientos');
            $table->string('codigo_QR', 255);
            $table->string('pnr', 10);
            $table->decimal('recargos', 10, 2)->default(0);
            $table->decimal('tarifa_base', 10, 2);
            $table->decimal('total', 10, 2);
            $table->dateTime('fecha_reserva');
            $table->dateTime('fecha_emision');
            $table->boolean('maleta_adicional')->default(false);
            $table->boolean('cancelacion_flexible')->default(false);
            $table->string('stripe_session_id');
            $table->timestamps();

            $table->unique('asiento_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billetes');
    }
};
