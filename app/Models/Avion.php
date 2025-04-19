<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Avion extends Model
{
    /** @use HasFactory<\Database\Factories\AvionFactory> */
    use HasFactory;
    protected $table = 'aviones';

    public function aerolinea()
    {
        return $this->belongsTo(Aerolinea::class);
    }

    public function vuelos()
    {
        return $this->hasMany(Vuelo::class);
    }
}
