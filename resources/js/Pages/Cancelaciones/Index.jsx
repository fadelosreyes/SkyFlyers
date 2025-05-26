import React from 'react';
import { Link, router } from '@inertiajs/react';
import Header from "@/Components/Header";

export default function Index({ vuelosConBilletes }) {

    const cancelarBilletesDelVuelo = (vueloId) => {
        if (confirm('¿Estás seguro de que deseas cancelar todos los billetes de este vuelo?')) {
            router.post(`/vuelos/${vueloId}/cancelar-billetes`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    alert('Todos los billetes del vuelo fueron cancelados correctamente.');
                },
                onError: () => {
                    alert('Error al cancelar los billetes del vuelo.');
                }
            });
        }
    };

    return (
        <>
            <Header activePage="#" />
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Billetes activos</h1>

                {vuelosConBilletes.length === 0 && <p>No se encontraron billetes activos.</p>}

                <div className="space-y-10">
                    {vuelosConBilletes.map(({ vuelo, billetes }) => (
                        <div key={vuelo.id} className="border rounded p-6 shadow bg-white">
                            <h2 className="text-xl font-semibold mb-4">
                                Vuelo: {vuelo.origen} → {vuelo.destino}
                            </h2>
                            <p><strong>Fecha de salida:</strong> {new Date(vuelo.fecha_salida).toLocaleString()}</p>
                            <p><strong>Fecha de llegada:</strong> {new Date(vuelo.fecha_llegada).toLocaleString()}</p>

                            <div className="mt-4 space-y-4">
                                {billetes.map((billete) => (
                                    <div key={billete.id} className="border p-4 rounded bg-gray-50">
                                        <p><strong>Nombre del pasajero:</strong> {billete.nombre_pasajero}</p>
                                        <p><strong>Documento identidad:</strong> {billete.documento_identidad}</p>
                                        <p><strong>PNR:</strong> {billete.pnr}</p>
                                        <p><strong>Asiento:</strong> {billete.asiento_numero}</p>
                                        <p><strong>Total:</strong> ${Number(billete.total).toFixed(2)}</p>
                                        <p><strong>Maleta adicional:</strong> {billete.maleta_adicional ? 'Sí' : 'No'}</p>
                                        <p><strong>Cancelación flexible:</strong> {billete.cancelacion_flexible ? 'Sí' : 'No'}</p>
                                        <p><strong>Fecha de reserva:</strong> {new Date(billete.fecha_reserva).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Botón de cancelar todos los billetes del vuelo */}
                            <div className="mt-6">
                                <button
                                    onClick={() => cancelarBilletesDelVuelo(vuelo.id)}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    Cancelar los billetes de este vuelo
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10">
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
