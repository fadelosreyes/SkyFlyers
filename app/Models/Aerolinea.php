<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aerolinea extends Model
{
    /** @use HasFactory<\Database\Factories\AerolineaFactory> */
    use HasFactory;
    protected $fillable = ['nombre', 'codigo_iata', 'pais_id'];


    public function pais()
    {
        return $this->belongsTo(Pais::class);
    }

    public function aviones()
    {
        return $this->hasMany(Avion::class);
    }
}
