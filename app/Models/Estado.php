<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estado extends Model
{
    /** @use HasFactory<\Database\Factories\EstadoFactory> */
    use HasFactory;

    public function asientos()
    {
        return $this->hasMany(Asiento::class);
    }
}
