import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import '../../css/principal.css';
import '../../css/resultados.css';

import Header from '../Components/Header';
import PrimaryButton from '../Components/PrimaryButton';

export default function Resultados({ vuelos, passengers }) {
    return (
        <>
            <Head title="Resultados de vuelos" />
            <Header activePage="#" />

            <div className="resultados-vuelos">
                {vuelos.length > 0 ? (
                    <div className="lista-vuelos">
                        {vuelos.map(v => {
                            // Cálculo duración en formato ISO 8601 PT#H#M
                            const salida = new Date(v.fecha_salida);
                            const llegada = new Date(v.fecha_llegada);
                            const durMs = llegada - salida;
                            let durationISO = '';
                            if (!isNaN(durMs)) {
                                const totalMinutes = Math.floor(durMs / 60000);
                                const hours = Math.floor(totalMinutes / 60);
                                const minutes = totalMinutes % 60;
                                durationISO = `PT${hours}H${minutes}M`;
                            }

                            return (
                                <div
                                    className="billete-vuelos"
                                    key={v.id}
                                    itemScope
                                    itemType="http://schema.org/Flight"
                                >
                                    <meta itemProp="flightNumber" content={v.numero_vuelo || ''} />

                                    <div className="billete-vuelos-header">
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
                                        <div className="price" itemProp="offers" itemScope itemType="http://schema.org/Offer">
                                            {v.precio_minimo !== null ? (
                                                <>
                                                    <meta itemProp="price" content={v.precio_minimo} />
                                                    <meta itemProp="priceCurrency" content="EUR" />
                                                    Desde {v.precio_minimo} €
                                                </>
                                            ) : (
                                                'Sin plazas disponibles'
                                            )}
                                        </div>
                                    </div>

                                    <div className="billete-vuelos-body">
                                        {/* Origen */}
                                        <div
                                            className="segment"
                                            itemProp="departureAirport"
                                            itemScope
                                            itemType="http://schema.org/Airport"
                                        >
                                            <div className="city" itemProp="name">
                                                {v.aeropuerto_origen.ciudad}
                                            </div>
                                            <div className="code">
                                                (<span itemProp="iataCode">{v.aeropuerto_origen.codigo_iata}</span>)
                                            </div>
                                            <time
                                                className="time"
                                                itemProp="departureTime"
                                                dateTime={salida.toISOString()}
                                            >
                                                {salida.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </time>
                                            <div className="date">
                                                {salida.toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>

                                        <div className="divider">✈︎</div>

                                        {/* Destino */}
                                        <div
                                            className="segment"
                                            itemProp="arrivalAirport"
                                            itemScope
                                            itemType="http://schema.org/Airport"
                                        >
                                            <div className="city" itemProp="name">
                                                {v.aeropuerto_destino.ciudad}
                                            </div>
                                            <div className="code">
                                                (<span itemProp="iataCode">{v.aeropuerto_destino.codigo_iata}</span>)
                                            </div>
                                            <time
                                                className="time"
                                                itemProp="arrivalTime"
                                                dateTime={(llegada || salida).toISOString()}
                                            >
                                                {(llegada || salida).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </time>
                                            <div className="date">
                                                {(llegada || salida).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="billete-vuelos-footer">
                                        <div className="details">
                                            Duración:{' '}
                                            <time itemProp="duration" dateTime={durationISO}>
                                                {!durationISO ? '--' : `${Math.floor(durMs / 3600000)}h ${Math.floor((durMs % 3600000) / 60000)}m`}
                                            </time>
                                        </div>

                                        <button
                                            type="button"
                                            className="btn-reserva"
                                            onClick={() =>
                                                router.get(
                                                    route('seleccionar.asientos', { id: v.id }),
                                                    { passengers }
                                                )
                                            }
                                            disabled={
                                                v.precio_minimo === null ||
                                                v.plazas_libres < passengers
                                            }
                                        >
                                            Reservar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="no-vuelos">
                        No se encontraron vuelos para los criterios seleccionados.
                    </p>
                )}

                <div className="volver-btn">
                    <Link href="/" className="volver-link">
                        <PrimaryButton>Volver</PrimaryButton>
                    </Link>
                </div>
            </div>
        </>
    );
}
