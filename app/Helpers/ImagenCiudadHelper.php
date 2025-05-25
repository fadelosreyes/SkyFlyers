<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Http;

class ImagenCiudadHelper
{
    /**
     * Obtiene una imagen representativa de una ciudad usando la API de Unsplash.
     *
     * Si no hay clave de acceso configurada, devuelve una URL genérica con una imagen relacionada.
     * Realiza una búsqueda aleatoria en Unsplash por el nombre de la ciudad.
     *
     * @param string $ciudad Nombre de la ciudad para buscar la imagen.
     * @return string URL de la imagen obtenida.
     */
    public static function obtenerImagenDeCiudad(string $ciudad): string
    {
        $accessKey = env('UNSPLASH_ACCESS_KEY');

        if (empty($accessKey)) {
            return 'https://source.unsplash.com/featured/?' . urlencode($ciudad);
        }

        $response = Http::get('https://api.unsplash.com/photos/random', [
            'query'     => $ciudad,
            'client_id' => $accessKey,
            'orientation' => 'portrait',
        ]);

        if ($response->successful()) {
            return $response->json('urls.regular');
        }

        return 'https://source.unsplash.com/featured/?' . urlencode($ciudad);
    }
}

