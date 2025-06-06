<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pais extends Model
{
    /** @use HasFactory<\Database\Factories\PaisFactory> */
    use HasFactory;

    protected $table = 'paises';

    protected $fillable = [
        'nombre',
        'codigo_iso',
    ];

    public function aerolineas()
    {
        return $this->hasMany(Aerolinea::class);
    }
}
