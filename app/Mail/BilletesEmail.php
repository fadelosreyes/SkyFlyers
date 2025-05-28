<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class BilletesEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $billetes;

    public function __construct($billetes)
    {
        $this->billetes = $billetes;  // colección o array de billetes planos
    }

    public function build()
    {
        // 1) Definimos el asunto y la vista principal del email (blade con estilo)
        $email = $this
            ->subject('Tus billetes de Skyflyers')
            ->view('emails.billetes')      // tu plantilla bonita en tonos azules
            ->with(['billetes' => $this->billetes]);

        // 2) Ahora generamos y adjuntamos un PDF por cada billete
        foreach ($this->billetes as $billete) {
            // Reconstruimos datos de vuelo
            $vuelo = [
                'origen'        => $billete['aeropuerto_origen']   ?? null,
                'destino'       => $billete['aeropuerto_destino']  ?? null,
                'fecha_salida'  => $billete['vuelo_fecha_salida']  ?? null,
                'fecha_llegada' => $billete['vuelo_fecha_llegada'] ?? null,
            ];

            // Cargamos y codificamos el QR
            $qrPath = storage_path('app/public/' . $billete['codigo_QR']);
            $base64Svg = file_exists($qrPath)
                ? 'data:image/svg+xml;base64,' . base64_encode(file_get_contents($qrPath))
                : null;

            // Generamos el PDF con la vista pdf.billete
            $pdf = Pdf::loadView('pdf.billete', [
                'vuelo'     => $vuelo,
                'billete'   => $billete,
                'base64Svg' => $base64Svg,
            ]);

            // Adjuntamos el PDF
            $email->attachData(
                $pdf->output(),
               "billete_{$billete['id']}.pdf",
                ['mime' => 'application/pdf']
            );
        }

        return $email;
    }
}
