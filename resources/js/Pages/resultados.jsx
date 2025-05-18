import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import '../../css/principal.css';
import '../../css/resultados.css';

import Header from '../Components/Header';
import PrimaryButton from '../Components/PrimaryButton';

export default function Resultados({ vuelos }) {
    return (
        <>
            <Head title="Resultados de vuelos" />
            <Header activePage="#" />

            <div className="flight-results">
                {vuelos.length > 0 ? (
                    <div className="flight-list">
                        {vuelos.map(v => (
                            <div className="flight-card" key={v.id}>
                                <div className="flight-card-header">
                                    <div className="airline">{v.avion?.aerolinea?.nombre || 'Skyflyers'}</div>
                                    <div className="price">
                                        {v.precio_minimo !== null ? `Desde ${v.precio_minimo} €` : 'Sin plazas disponibles'}
                                    </div>
                                </div>

                                <div className="flight-card-body">
                                    <div className="segment">
                                        <div className="city">{v.aeropuerto_origen.ciudad}</div>
                                        <div className="code">({v.aeropuerto_origen.codigo_iata})</div>
                                        <div className="time">
                                            {new Date(v.fecha_salida).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>

                                    <div className="divider">✈︎</div>

                                    <div className="segment">
                                        <div className="city">{v.aeropuerto_destino.ciudad}</div>
                                        <div className="code">({v.aeropuerto_destino.codigo_iata})</div>
                                        <div className="time">
                                            {new Date(v.fecha_llegada || v.fecha_salida).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flight-card-footer">
                                    <div className="details">
                                        Duración: {(() => {
                                            const salida = new Date(v.fecha_salida);
                                            const llegada = new Date(v.fecha_llegada);
                                            const duracionMs = llegada - salida;

                                            if (isNaN(duracionMs)) return '--';

                                            const duracionMin = Math.floor(duracionMs / 60000);
                                            const horas = Math.floor(duracionMin / 60);
                                            const minutos = duracionMin % 60;

                                            return `${horas}h ${minutos}m`;
                                        })()}
                                    </div>

                                    <button
                                        className="btn-reserve"
                                        onClick={() => router.get(`/vuelos/reservar/${v.id}`)}
                                        disabled={v.precio_minimo === null}
                                    >
                                        Reservar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-flights">No se encontraron vuelos para los criterios seleccionados.</p>
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
