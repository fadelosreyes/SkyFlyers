<?php

namespace App\Http\Controllers;

use App\Models\Asiento;
use App\Models\billete;
use App\Models\Estado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use QRcode;



class BilleteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $asientosSeleccionados = $request->input('asientos', []);
        $asientos = Asiento::whereIn('id', $asientosSeleccionados)->get();
        $estados = Estado::all();

        return view('billetes.create', compact('asientos', 'estados'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_pasajero' => 'required|string|max:255',
            'documento_identidad' => 'required|string|max:50',
            'asiento_id' => 'required|exists:asientos,id',
            'estado_id' => 'required|exists:estados,id',
            'tarifa_base' => 'required|numeric',
            'recargos' => 'nullable|numeric',
            'total' => 'required|numeric',
        ]);

        $usuario = Auth::user();

        $billete = new Billete();
        $billete->user_id = $usuario->id;
        $billete->nombre_pasajero = $request->nombre_pasajero;
        $billete->documento_identidad = $request->documento_identidad;
        $billete->asiento_id = $request->asiento_id;
        $billete->estado_id = $request->estado_id;
        $billete->pnr = strtoupper(Str::random(6));
        $billete->recargos = $request->recargos ?? 0;
        $billete->tarifa_base = $request->tarifa_base;
        $billete->total = $request->total;
        $billete->fecha_reserva = now();
        $billete->fecha_emision = now();

        // Generar el código QR con PHPQRCode
        $codigoQRtext = route('billetes.show', ['billete' => $billete->id]); // url o texto a codificar
        $nombreArchivoQR = 'qr_' . Str::random(10) . '.png';
        $rutaQR = public_path('qr_codes/' . $nombreArchivoQR);

        // Crear la carpeta si no existe
        if (!file_exists(public_path('qr_codes'))) {
            mkdir(public_path('qr_codes'), 0755, true);
        }

        QRcode::png($codigoQRtext, $rutaQR, QR_ECLEVEL_L, 4);

        // Guardar ruta relativa en el campo codigo_QR
        $billete->codigo_QR = 'qr_codes/' . $nombreArchivoQR;

        $billete->save();

        return redirect()->route('billetes.show', $billete)->with('success', 'Billete creado correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(billete $billete)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(billete $billete)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, billete $billete)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(billete $billete)
    {
        //
    }
}
