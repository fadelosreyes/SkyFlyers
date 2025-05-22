<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Http;

class ImagenCiudadHelper
{
    public static function obtenerImagenDeCiudad(string $ciudad): string
    {
        $accessKey = env('UNSPLASH_ACCESS_KEY');

        if (empty($accessKey)) {
            return 'https://source.unsplash.com/featured/?' . urlencode($ciudad . ',travel');
        }

        $response = Http::get('https://api.unsplash.com/photos/random', [
            'query'       => $ciudad . ' travel',
            'client_id'   => $accessKey,
            'orientation' => 'portrait',  // orientación vertical
        ]);

        if ($response->successful()) {
            return $response->json('urls.regular');
        }

        return 'https://source.unsplash.com/featured/?' . urlencode($ciudad . ',travel');
    }
}
