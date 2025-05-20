<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_billete',
        'monto',
        'id_metodo_pago',
        'estado_id_pago',
        'fecha_pago'
    ];

    public function billete()
    {
        return $this->belongsTo(Billete::class, 'id_billete');
    }

    public function metodoPago()
    {
        return $this->belongsTo(MetodoPago::class, 'id_metodo_pago');
    }

    public function estadoPago()
    {
        return $this->belongsTo(EstadoPago::class, 'estado_id_pago');
    }
}
