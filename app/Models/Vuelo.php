<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vuelo extends Model
{
    use HasFactory;

    public function avion()
    {
        return $this->belongsTo(Avion::class);
    }

    public function aeropuertoOrigen()
    {
        return $this->belongsTo(Aeropuerto::class, 'id_aeropuerto_origen');
    }

    public function aeropuertoDestino()
    {
        return $this->belongsTo(Aeropuerto::class, 'id_aeropuerto_destino');
    }

    public function asientos()
    {
        return $this->hasMany(Asiento::class);
    }
}

