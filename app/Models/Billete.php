<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Billete extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nombre_pasajero',
        'documento_identidad',
        'asiento_id',
        'codigo_QR',
        'pnr',
        'recargos',
        'tarifa_base',
        'total',
        'fecha_reserva',
        'fecha_emision',
        'maleta_adicional',
        'stripe_session_id',
        'cancelacion_flexible'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class);
    }

    public function asiento()
    {
        return $this->belongsTo(Asiento::class);
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }
}
