import React from 'react';
import { Link } from '@inertiajs/react';
import Header from "@/Components/Header";
import { useTranslation } from 'react-i18next';

export default function ConfirmacionMultiple({ billetes }) {
    const { t } = useTranslation();

    // Función para formatear fecha en parámetros para Booking
    function formatDateParams(dateStr) {
        if (!dateStr) return {};
        const date = new Date(dateStr);
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1, // Mes empieza en 0
            day: date.getDate(),
        };
    }

    // Construir URL de busqueda en Booking para búsqueda general (primer billete)
    function bookingGeneralUrl() {
        if (!billetes || billetes.length === 0) {
            return 'https://www.booking.com/';
        }

        const billetesOrdenados = [...billetes].sort((a, b) =>
            new Date(a.vuelo_fecha_salida) - new Date(b.vuelo_fecha_salida)
        );

        const primerBillete = billetesOrdenados[0];
        const ultimoBillete = billetesOrdenados[billetesOrdenados.length - 1];
        const destino = primerBillete.aeropuerto_destino || '';

        if (!destino) {
            return 'https://www.booking.com/';
        }

        const pasajerosUnicos = new Set(
            billetes.map(b => b.documento_identidad || b.nombre_pasajero)
        );
        const adultos = pasajerosUnicos.size;

        const extractParts = (isoStr) => {
            const fecha = isoStr.includes('T')
                ? isoStr.split('T')[0]
                : isoStr.split(' ')[0];
            const [year, month, day] = fecha.split('-');
            return { year, month, day };
        };

        const checkin = extractParts(primerBillete.vuelo_fecha_salida);
        const checkout = extractParts(ultimoBillete.vuelo_fecha_salida);

        const params = new URLSearchParams({
            ss: destino,
            group_adults: adultos.toString(),
            checkin_year: checkin.year,
            checkin_month: checkin.month,
            checkin_monthday: checkin.day,
            checkout_year: checkout.year,
            checkout_month: checkout.month,
            checkout_monthday: checkout.day,
            no_rooms: '1',
            group_children: '0'
        });

        return `https://www.booking.com/searchresults.html?${params.toString()}`;
    }


    return (
        <>
            <Header activePage="#" />
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">{t('billetes_multiples.compra_exitosa')}</h1>
                <p className="mb-6">{t('billetes_multiples.billetes_generados')}</p>

                <div className="space-y-6">
                    {billetes.map((billete) => (
                        <div key={billete.id} className="border rounded p-4 shadow-sm bg-white">
                            <p><strong>{t('billetes_multiples.pasajero')}:</strong> {billete.nombre_pasajero}</p>
                            <p><strong>{t('billetes_multiples.documento')}:</strong> {billete.documento_identidad}</p>
                            <p><strong>{t('billetes_multiples.pnr')}:</strong> {billete.pnr}</p>
                            <p><strong>{t('billetes_multiples.asiento_numero')}:</strong> {billete.asiento_numero}</p>
                            <p>
                                <strong>{t('billetes_multiples.tarifa_base')}:</strong>{' '}
                                {billete.tarifa_base
                                    ? new Intl.NumberFormat('es-ES', {
                                        style: 'currency',
                                        currency: 'EUR',
                                    }).format(billete.tarifa_base)
                                    : 'N/A'}
                            </p>
                            <p>
                                <strong>{t('billetes_multiples.total')}:</strong>{' '}
                                {billete.total
                                    ? new Intl.NumberFormat('es-ES', {
                                        style: 'currency',
                                        currency: 'EUR',
                                    }).format(billete.total)
                                    : 'N/A'}
                            </p>
                            <p><strong>{t('billetes_multiples.maleta_adicional')}:</strong> {billete.maleta_adicional ? t('billetes_multiples.si') : t('billetes_multiples.no')}</p>
                            <p><strong>{t('billetes_multiples.cancelacion_flexible')}:</strong> {billete.cancelacion_flexible ? t('billetes_multiples.si') : t('billetes_multiples.no')}</p>
                            <p><strong>{t('billetes_multiples.fecha_reserva')}:</strong> {billete.fecha_reserva ? new Date(billete.fecha_reserva).toLocaleString() : 'N/A'}</p>

                            <p><strong>{t('billetes_multiples.fecha_vuelo')}:</strong> {billete.vuelo_fecha_salida ? new Date(billete.vuelo_fecha_salida).toLocaleString() : 'N/A'}</p>
                            <p><strong>{t('billetes_multiples.fecha_llegada')}:</strong> {billete.vuelo_fecha_llegada ? new Date(billete.vuelo_fecha_llegada).toLocaleString() : 'N/A'}</p>
                            <p><strong>{t('billetes_multiples.origen')}:</strong> {billete.aeropuerto_origen ?? 'N/A'}</p>
                            <p><strong>{t('billetes_multiples.destino')}:</strong> {billete.aeropuerto_destino ?? 'N/A'}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex gap-4">
                    <Link
                        href="/"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        {t('billetes_multiples.volver_inicio')}
                    </Link>

                    <a
                        href={bookingGeneralUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        {t('billetes_multiples.buscar_hoteles')}
                    </a>
                </div>
            </div>
        </>
    );
}
