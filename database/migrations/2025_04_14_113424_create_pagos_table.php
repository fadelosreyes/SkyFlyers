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
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billete_id')->constrained('billetes');
            $table->decimal('monto', 10, 2);
            $table->foreignId('metodo_pago_id')->constrained('metodos_pago');
            $table->foreignId('estado_pago_id')->constrained('estados_pago');
            $table->timestamp('fecha_pago')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
