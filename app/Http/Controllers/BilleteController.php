<?php

namespace App\Http\Controllers;

use App\Models\Asiento;
use App\Models\billete;
use App\Models\Estado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use QRcode;
use Inertia\Inertia;

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

        return Inertia::render('Billetes/Create', [
            'asientos' => $asientos,
            'estados' => $estados,
        ]);
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

        // 1) Creamos el billete SIN el QR
        $billete = Billete::create([
            'user_id' => $usuario->id,
            'nombre_pasajero' => $request->nombre_pasajero,
            'documento_identidad' => $request->documento_identidad,
            'asiento_id' => $request->asiento_id,
            'estado_id' => $request->estado_id,
            'pnr' => strtoupper(Str::random(6)),
            'recargos' => $request->recargos ?? 0,
            'tarifa_base' => $request->tarifa_base,
            'total' => $request->total,
            'fecha_reserva' => now(),
            'fecha_emision' => now(),
            'codigo_QR' => '', // placeholder
        ]);

        // 2) Generamos el QR YA con el ID real del billete
        $urlParaQR = route('billetes.show', $billete->id);
        $nombreQR = 'qr_' . Str::random(10) . '.png';
        $rutaQR = public_path('qr_codes/' . $nombreQR);

        if (!file_exists(public_path('qr_codes'))) {
            mkdir(public_path('qr_codes'), 0755, true);
        }
        QRcode::png($urlParaQR, $rutaQR, QR_ECLEVEL_L, 4);

        // 3) Actualizamos el billete con la ruta del QR generado
        $billete->update([
            'codigo_QR' => 'qr_codes/' . $nombreQR,
        ]);

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
