<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class clase extends Model
{
    /** @use HasFactory<\Database\Factories\ClaseFactory> */
    use HasFactory;

    public function asientos()
    {
        return $this->hasMany(Asiento::class);
    }
}
