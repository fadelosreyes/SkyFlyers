<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Billete extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_user',
        'nombre_pasajero',
        'documento_identidad',
        'id_asiento',
        'estado_id',
        'codigo_QR',
        'pnr',
        'recargos',
        'tarifa_base',
        'total',
        'fecha_reserva',
        'fecha_emision'
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
