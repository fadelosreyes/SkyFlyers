<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asiento extends Model
{
    /** @use HasFactory<\Database\Factories\AsientoFactory> */
    use HasFactory;

    public function vuelo()
    {
        return $this->belongsTo(Vuelo::class);
    }

    public function clase()
    {
        return $this->belongsTo(Clase::class);
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }

    public function Billete()
    {
        return $this->belongsTo(Billete::class);
    }
}
