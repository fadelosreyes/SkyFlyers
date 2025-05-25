import React from 'react';
import { Link } from '@inertiajs/react';
import Header from "@/Components/Header";

export default function ConfirmacionMultiple({ billetes }) {
    return (
        <>
            <Header activePage="#" />
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">¡Compra completada con éxito!</h1>
                <p className="mb-6">Se han generado los siguientes billetes:</p>

                <div className="space-y-6">
                    {billetes.length === 0 && <p>No se encontraron billetes.</p>}

                    {billetes.map((billete) => (
                        <div key={billete.id} className="border rounded p-4 shadow-sm bg-white">
                            <p><strong>Pasajero:</strong> {billete.nombre_pasajero}</p>
                            <p><strong>Documento:</strong> {billete.documento_identidad}</p>
                            <p><strong>PNR:</strong> {billete.pnr}</p>
                            <p><strong>Código QR:</strong> {billete.codigo_QR}</p>
                            <p><strong>Asiento ID:</strong> {billete.asiento_id}</p>
                            <p><strong>Tarifa base:</strong> ${billete.tarifa_base ? Number(billete.tarifa_base).toFixed(2) : 'N/A'}</p>
                            <p><strong>Total:</strong> ${billete.total ? Number(billete.total).toFixed(2) : 'N/A'}</p>
                            <p><strong>Maleta adicional:</strong> {billete.maleta_adicional ? 'Sí' : 'No'}</p>
                            <p><strong>Cancelación flexible:</strong> {billete.cancelacion_flexible ? 'Sí' : 'No'}</p>
                            <p><strong>Fecha reserva:</strong> {billete.fecha_reserva ? new Date(billete.fecha_reserva).toLocaleString() : 'N/A'}</p>
                        </div>
                    ))}

                </div>

                <div className="mt-8">
                    <Link
                        href="/"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </>
    );
}
