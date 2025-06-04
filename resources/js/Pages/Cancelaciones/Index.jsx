import React from 'react';
import { Link, router } from '@inertiajs/react';
import Header from "@/Components/Header";
import { useTranslation } from 'react-i18next';

export default function Index({ vuelosConBilletes }) {
    const { t } = useTranslation();

    const cancelarBilletes = (vueloIds) => {
        if (confirm(t('billetes_index.confirmar_cancelacion'))) {
            vueloIds.forEach((id) => {
                router.post(`/vuelos/${id}/cancelar-billetes`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {},
                    onError: () => {
                        alert(t('billetes_index.cancelacion_error'));
                    },
                });
            });
            alert(t('billetes_index.cancelacion_exitosa'));
        }
    };

    const grupos = [];
    const usados = new Set();

    vuelosConBilletes.forEach(({ vuelo, billetes }) => {
        if (usados.has(vuelo.id)) return;

        const posibleVuelta = vuelosConBilletes.find(
            ({ vuelo: otroVuelo }) =>
                !usados.has(otroVuelo.id) &&
                otroVuelo.origen === vuelo.destino &&
                otroVuelo.destino === vuelo.origen &&
                new Date(otroVuelo.fecha_salida) > new Date(vuelo.fecha_salida)
        );

        if (posibleVuelta) {
            grupos.push({
                ida: { vuelo, billetes },
                vuelta: { vuelo: posibleVuelta.vuelo, billetes: posibleVuelta.billetes },
            });
            usados.add(vuelo.id);
            usados.add(posibleVuelta.vuelo.id);
        } else {
            grupos.push({
                ida: { vuelo, billetes },
                vuelta: null,
            });
            usados.add(vuelo.id);
        }
    });

    return (
        <>
            <Header activePage="#" />
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">{t('billetes_index.titulo')}</h1>

                {vuelosConBilletes.length === 0 && <p>{t('billetes_index.no_encontrado')}</p>}

                <div className="space-y-10">
                    {grupos.map((grupo, idx) => {
                        const { ida, vuelta } = grupo;

                        const vueloIds = [ida.vuelo.id];
                        if (vuelta) vueloIds.push(vuelta.vuelo.id);

                        const cancelarBilletesDelVuelo = (vueloId) => {
                            if (confirm(t('billetes_index.confirmar_cancelacion'))) {
                                router.post(`/vuelos/${vueloId}/cancelar-billetes`, {}, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        alert(t('billetes_index.cancelacion_exitosa'));
                                    },
                                    onError: () => {
                                        alert(t('billetes_index.cancelacion_error'));
                                    }
                                });
                            }
                        };

                        return (
                            <div key={idx} className="border rounded p-6 shadow bg-white">
                                <h2 className="text-xl font-semibold mb-4">
                                    {t('billetes_index.viaje')}:{' '}
                                    {ida.vuelo.origen} → {ida.vuelo.destino}
                                    {vuelta && (
                                        <>
                                            {' '}
                                            &amp; {vuelta.vuelo.origen} → {vuelta.vuelo.destino}
                                        </>
                                    )}
                                </h2>

                                <div className="mb-6">
                                    <h3 className="text-lg font-medium mb-2">
                                        {t('billetes_index.ida')}
                                    </h3>
                                    <p>
                                        <strong>{t('billetes_index.fecha_salida')}:</strong>{' '}
                                        {new Date(ida.vuelo.fecha_salida).toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>{t('billetes_index.fecha_llegada')}:</strong>{' '}
                                        {new Date(ida.vuelo.fecha_llegada).toLocaleString()}
                                    </p>

                                    <div className="mt-4 space-y-4">
                                        {ida.billetes.map((billete) => (
                                            <div
                                                key={billete.id}
                                                className="border p-4 rounded bg-gray-50"
                                            >
                                                <p>
                                                    <strong>
                                                        {t('billetes_index.nombre_pasajero')}:
                                                    </strong>{' '}
                                                    {billete.nombre_pasajero}
                                                </p>
                                                <p>
                                                    <strong>{t('billetes_index.documento')}:</strong>{' '}
                                                    {billete.documento_identidad}
                                                </p>
                                                <p>
                                                    <strong>{t('billetes_index.pnr')}:</strong>{' '}
                                                    {billete.pnr}
                                                </p>
                                                <p>
                                                    <strong>{t('billetes_index.asiento')}:</strong>{' '}
                                                    {billete.asiento_numero}
                                                </p>
                                                <p>
                                                    <strong>{t('billetes_index.total')}:</strong>{' '}
                                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(billete.total)}
                                                </p>
                                                <p>
                                                    <strong>
                                                        {t('billetes_index.fecha_reserva')}:
                                                    </strong>{' '}
                                                    {new Date(billete.fecha_reserva).toLocaleString()}
                                                </p>

                                                <button
                                                    onClick={() =>
                                                        router.get(`/billetes/${billete.id}/cambiar-asiento`)
                                                    }
                                                    className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                                >
                                                    {t('billetes_index.cambiar_asiento')}
                                                </button>

                                                {billete.cancelacion_flexible && (
                                                    <button
                                                        onClick={() => cancelarBilletesDelVuelo(ida.vuelo.id)}
                                                        className="mt-2 ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                    >
                                                        {t('billetes_index.cancelar')}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {vuelta && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium mb-2">
                                            {t('billetes_index.vuelta')}
                                        </h3>
                                        <p>
                                            <strong>{t('billetes_index.fecha_salida')}:</strong>{' '}
                                            {new Date(vuelta.vuelo.fecha_salida).toLocaleString()}
                                        </p>
                                        <p>
                                            <strong>{t('billetes_index.fecha_llegada')}:</strong>{' '}
                                            {new Date(vuelta.vuelo.fecha_llegada).toLocaleString()}
                                        </p>

                                        <div className="mt-4 space-y-4">
                                            {vuelta.billetes.map((billete) => (
                                                <div
                                                    key={billete.id}
                                                    className="border p-4 rounded bg-gray-50"
                                                >
                                                    <p>
                                                        <strong>
                                                            {t('billetes_index.nombre_pasajero')}:
                                                        </strong>{' '}
                                                        {billete.nombre_pasajero}
                                                    </p>
                                                    <p>
                                                        <strong>{t('billetes_index.documento')}:</strong>{' '}
                                                        {billete.documento_identidad}
                                                    </p>
                                                    <p>
                                                        <strong>{t('billetes_index.pnr')}:</strong>{' '}
                                                        {billete.pnr}
                                                    </p>
                                                    <p>
                                                        <strong>{t('billetes_index.asiento')}:</strong>{' '}
                                                        {billete.asiento_numero}
                                                    </p>
                                                    <p>
                                                        <strong>{t('billetes_index.total')}:</strong>{' '}
                                                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(billete.total)}
                                                    </p>
                                                    <p>
                                                        <strong>
                                                            {t('billetes_index.fecha_reserva')}:
                                                        </strong>{' '}
                                                        {new Date(billete.fecha_reserva).toLocaleString()}
                                                    </p>

                                                    <button
                                                        onClick={() =>
                                                            router.get(`/billetes/${billete.id}/cambiar-asiento`)
                                                        }
                                                        className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                                    >
                                                        {t('billetes_index.cambiar_asiento')}
                                                    </button>

                                                    {billete.cancelacion_flexible && (
                                                        <button
                                                            onClick={() => cancelarBilletesDelVuelo(vuelta.vuelo.id)}
                                                            className="mt-2 ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                        >
                                                            {t('billetes_index.cancelar')}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <button
                                        onClick={() => cancelarBilletes(vueloIds)}
                                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                    >
                                        {t('billetes_index.cancelar_viaje')}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10">
                    <Link
                        href="/"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        {t('billetes_index.volver_inicio')}
                    </Link>
                </div>
            </div>
        </>
    );
}
