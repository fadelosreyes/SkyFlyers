<?php

namespace App\Http\Controllers;

use App\Models\Asiento;
use App\Models\Vuelo;
use App\Models\Billete;
use App\Mail\BilletesEmail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class BilleteController extends Controller
{
    /**
     * Muestra el formulario para crear un nuevo billete.
     */
    public function create(Request $request)
    {
        $vueloId = $request->input('vuelo_id');
        $asientoIds = $request->input('asientos', []);

        if (empty($asientoIds)) {
            return redirect()->route('seleccionar.asientos', $vueloId)->with('error', 'Debes seleccionar al menos un asiento.');
        }

        $vuelo = Vuelo::findOrFail($vueloId);
        $asientosSeleccionados = Asiento::whereIn('id', $asientoIds)->get();

        // Calculamos el total base sumando el precio_base de los asientos seleccionados
        $totalBase = $asientosSeleccionados->sum(fn($a) => $a->precio_base);

        return Inertia::render('Billete/DatosPasajero', [
            'vuelo' => $vuelo,
            'asientosSeleccionados' => $asientosSeleccionados,
            'totalBase' => $totalBase,
        ]);
    }

    /**
     * Valida los datos y crea la sesión de Stripe Checkout para el pago.
     */
    public function prepararPago(Request $request)
    {
        $data = $request->validate([
            'pasajeros.*.nombre_pasajero' => 'required|string',
            'pasajeros.*.documento_identidad' => 'required|string',
            'pasajeros.*.maleta_adicional' => 'boolean',
            'pasajeros.*.cancelacion_flexible' => 'boolean',
            'pasajeros.*.asiento_id' => 'required|exists:asientos,id',
        ]);

        // Guardamos los datos en sesión para procesarlos después del pago
        session(['datos_billete' => $data['pasajeros']]);

        $precioTotal = 0;

        foreach ($data['pasajeros'] as $p) {
            $asiento = Asiento::findOrFail($p['asiento_id']);
            $sub = $asiento->precio_base;
            $sub += !empty($p['maleta_adicional']) ? 20 : 0;
            $sub += !empty($p['cancelacion_flexible']) ? 15 : 0;
            $precioTotal += $sub;
        }

        try {
            Stripe::setApiKey(env('STRIPE_SECRET'));
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => 'eur',
                            'product_data' => ['name' => 'Billetes de avión'],
                            'unit_amount' => $precioTotal * 100,
                        ],
                        'quantity' => 1,
                    ],
                ],
                'mode' => 'payment',
                'success_url' => route('pago.exito') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('principal'),
            ]);
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors('Error creando sesión de pago: ' . $e->getMessage());
        }

        session(['stripe_session_id' => $session->id]);

        return Inertia::location($session->url);
    }

    /**
     * Listado de billetes del usuario agrupados por vuelo, solo vuelos a más de 3 días.
     */
    public function index()
    {
        $user = auth()->user();
        $fechaLimite = Carbon::now()->addDays(3);
        $billetes = $this->obtenerBilletesUsuarioConFiltro($user->id, $fechaLimite);

        return Inertia::render('Cancelaciones/Index', [
            'vuelosConBilletes' => $billetes,
        ]);
    }

    /**
     * Envía un correo al usuario con sus billetes próximos (a más de 3 días).
     */
    public function enviarBilletes($billeteId)
    {
        $user = auth()->user();

        // Buscamos el billete específico y sus relaciones para enviar
        $billete = Billete::with(['asiento.vuelo.aeropuertoOrigen', 'asiento.vuelo.aeropuertoDestino'])
            ->where('id', $billeteId)
            ->where('user_id', $user->id) // Para asegurarnos que el billete pertenece al usuario
            ->firstOrFail();

        try {
            Mail::to($user->email)->send(new BilletesEmail([$billete])); // Lo envío como array porque tu mailable espera un array
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error enviando correo: ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Correo enviado con el billete.']);
    }

    /**
     * Método privado para evitar duplicación en consultas de billetes.
     */
    private function obtenerBilletesUsuarioConFiltro($userId, $fechaLimite)
    {
        return Billete::with(['asiento.vuelo.aeropuertoOrigen', 'asiento.vuelo.aeropuertoDestino'])
            ->where('user_id', $userId)
            ->whereHas('asiento.vuelo', function ($query) use ($fechaLimite) {
                $query->where('fecha_salida', '>', $fechaLimite);
            })
            ->get()
            ->groupBy(fn($billete) => $billete->asiento->vuelo->id)
            ->map(function ($grupoBilletes) {
                $vuelo = $grupoBilletes->first()->asiento->vuelo;

                return [
                    'vuelo' => [
                        'id' => $vuelo->id,
                        'fecha_salida' => $vuelo->fecha_salida,
                        'fecha_llegada' => $vuelo->fecha_llegada,
                        'origen' => $vuelo->aeropuertoOrigen->nombre,
                        'destino' => $vuelo->aeropuertoDestino->nombre,
                    ],
                    'billetes' => $grupoBilletes
                        ->map(function ($billete) {
                            return [
                                'id' => $billete->id,
                                'nombre_pasajero' => $billete->nombre_pasajero,
                                'documento_identidad' => $billete->documento_identidad,
                                'pnr' => $billete->pnr,
                                'codigo_QR' => $billete->codigo_QR,
                                'asiento_numero' => $billete->asiento->numero ?? 'N/A',
                                'tarifa_base' => $billete->tarifa_base,
                                'total' => $billete->total,
                                'maleta_adicional' => $billete->maleta_adicional,
                                'cancelacion_flexible' => $billete->cancelacion_flexible,
                                'fecha_reserva' => $billete->fecha_reserva,
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();
    }
}
