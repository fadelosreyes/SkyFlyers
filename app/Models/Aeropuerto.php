<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Aeropuerto extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'ciudad',
        'pais',
        'codigo_iata',
    ];

    public function vuelosOrigen()
    {
        return $this->hasMany(Vuelo::class, 'aeropuerto_origen_id');
    }

    public function vuelosDestino()
    {
        return $this->hasMany(Vuelo::class, 'aeropuerto_destino_id');
    }
}
