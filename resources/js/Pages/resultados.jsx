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
                        {vuelos.map(v => (
                            <div className="billete-vuelos" key={v.id}>
                                <div className="billete-vuelos-header">
                                    <div className="airline">
                                        {v.avion?.aerolinea?.nombre || 'Skyflyers'}
                                    </div>
                                    <div className="price">
                                        {v.precio_minimo !== null
                                            ? `Desde ${v.precio_minimo} €`
                                            : 'Sin plazas disponibles'}
                                    </div>
                                </div>

                                <div className="billete-vuelos-body">
                                    {/* Origen */}
                                    <div className="segment">
                                        <div className="city">{v.aeropuerto_origen.ciudad}</div>
                                        <div className="code">
                                            ({v.aeropuerto_origen.codigo_iata})
                                        </div>
                                        <div className="time">
                                            {new Date(v.fecha_salida).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                        <div className="date">
                                            {new Date(v.fecha_salida).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </div>

                                    <div className="divider">✈︎</div>

                                    {/* Destino */}
                                    <div className="segment">
                                        <div className="city">{v.aeropuerto_destino.ciudad}</div>
                                        <div className="code">
                                            ({v.aeropuerto_destino.codigo_iata})
                                        </div>
                                        <div className="time">
                                            {new Date(v.fecha_llegada || v.fecha_salida).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                        <div className="date">
                                            {new Date(v.fecha_llegada || v.fecha_salida).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="billete-vuelos-footer">
                                    <div className="details">
                                        Duración: {(() => {
                                            const salida = new Date(v.fecha_salida);
                                            const llegada = new Date(v.fecha_llegada);
                                            const durMs = llegada - salida;
                                            if (isNaN(durMs)) return '--';
                                            const minTotal = Math.floor(durMs / 60000);
                                            return `${Math.floor(minTotal / 60)}h ${minTotal % 60}m`;
                                        })()}
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
                        ))}
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
