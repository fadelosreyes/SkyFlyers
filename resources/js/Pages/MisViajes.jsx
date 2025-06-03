import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import '../../css/principal.css';
import '../../css/resultados.css';

import Header from '../Components/Header';
import PrimaryButton from '../Components/PrimaryButton';

export default function MisViajes({ vuelos }) {
    const { t } = useTranslation();

    if (!Array.isArray(vuelos)) {
        throw new Error(t('errors.invalidFlightsProp'));
    }

    const vuelosFiltrados = vuelos.filter(v => v != null);

    return (
        <>
            <Head title={t('myTrips.title')} />
            <Header activePage="viajes" />

            <div className="resultados-vuelos">

                {vuelosFiltrados.length > 0 ? (
                    <div className="lista-vuelos">
                        {vuelosFiltrados.map(v => {
                            const salida = new Date(v.fecha_salida);
                            const llegada = new Date(v.fecha_llegada);
                            const durMs = llegada - salida;
                            const totalMinutes = Math.floor(durMs / 60000);
                            const hours = Math.floor(totalMinutes / 60);
                            const minutes = totalMinutes % 60;
                            const durationISO = `PT${hours}H${minutes}M`;

                            return (
                                <div
                                    className="Billete-vuelos"
                                    key={v.id}
                                    itemScope
                                    itemType="http://schema.org/Flight"
                                >
                                    <meta itemProp="flightNumber" content={v.numero_vuelo || ''} />

                                    <div className="Billete-vuelos-header">
                                        <div
                                            className="airline"
                                            itemProp="provider"
                                            itemScope
                                            itemType="http://schema.org/Airline"
                                        >
                                            <span itemProp="name">
                                                {v.avion?.aerolinea?.nombre || 'Skyflyers'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="Billete-vuelos-body">
                                        <div
                                            className="segment"
                                            itemProp="departureAirport"
                                            itemScope
                                            itemType="http://schema.org/Airport"
                                        >
                                            <div className="city" itemProp="name">
                                                {v.aeropuerto_origen?.ciudad || t('unknown')}
                                            </div>
                                            <div className="code">
                                                (<span itemProp="iataCode">{v.aeropuerto_origen?.codigo_iata || '---'}</span>)
                                            </div>
                                            <time
                                                className="time"
                                                itemProp="departureTime"
                                                dateTime={salida.toISOString()}
                                            >
                                                {salida.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </time>
                                            <div className="date">
                                                {salida.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>

                                        <div className="divider">✈︎</div>

                                        <div
                                            className="segment"
                                            itemProp="arrivalAirport"
                                            itemScope
                                            itemType="http://schema.org/Airport"
                                        >
                                            <div className="city" itemProp="name">
                                                {v.aeropuerto_destino?.ciudad || t('unknown')}
                                            </div>
                                            <div className="code">
                                                (<span itemProp="iataCode">{v.aeropuerto_destino?.codigo_iata || '---'}</span>)
                                            </div>
                                            <time
                                                className="time"
                                                itemProp="arrivalTime"
                                                dateTime={llegada.toISOString()}
                                            >
                                                {llegada.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </time>
                                            <div className="date">
                                                {llegada.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="Billete-vuelos-footer">
                                        <div className="details">
                                            {t('myTrips.duration')}: {' '}
                                            <time itemProp="duration" dateTime={durationISO}>
                                                {hours}h {minutes}m
                                            </time>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="no-vuelos">
                        {t('myTrips.noTripsYet')}
                    </p>
                )}

                <div className="volver-btn">
                    <Link href="/" className="volver-link">
                        <PrimaryButton>{t('myTrips.back')}</PrimaryButton>
                    </Link>
                </div>
            </div>
        </>
    );
}
