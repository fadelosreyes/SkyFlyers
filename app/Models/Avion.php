<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Avion extends Model
{
    /** @use HasFactory<\Database\Factories\AvionFactory> */
    use HasFactory;
    protected $table = 'aviones';

    protected $fillable = [
        'modelo',
        'codigo_icao',
        'matricula',
        'aerolinea_id',
        'filas_primera',
        'asientos_por_fila_primera',
        'filas_business',
        'asientos_por_fila_business',
        'filas_turista',
        'asientos_por_fila_turista',
    ];

    public function aerolinea()
    {
        return $this->belongsTo(Aerolinea::class);
    }

    public function vuelos()
    {
        return $this->hasMany(Vuelo::class);
    }
}
