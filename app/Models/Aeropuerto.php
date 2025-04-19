<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Aeropuerto extends Model
{
    use HasFactory;

    public function vuelosOrigen()
    {
        return $this->hasMany(Vuelo::class, 'id_aeropuerto_origen');
    }

    public function vuelosDestino()
    {
        return $this->hasMany(Vuelo::class, 'id_aeropuerto_destino');
    }
}
