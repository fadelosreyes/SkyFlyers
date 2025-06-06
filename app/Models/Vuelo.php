<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vuelo extends Model
{
    use HasFactory;

    protected $fillable = [
    'avion_id',
    'aeropuerto_origen_id',
    'aeropuerto_destino_id',
    'fecha_salida',
    'fecha_llegada',
    'imagen',
    'destacado',
];


    public function avion()
    {
        return $this->belongsTo(Avion::class);
    }

    public function aeropuertoOrigen()
    {
        return $this->belongsTo(Aeropuerto::class, 'aeropuerto_origen_id');
    }

    public function aeropuertoDestino()
    {
        return $this->belongsTo(Aeropuerto::class, 'aeropuerto_destino_id');
    }

    public function asientos()
    {
        return $this->hasMany(Asiento::class);
    }
}

