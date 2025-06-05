import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import '../../css/principal.css';
import '../../css/resultados.css';

import Header from '../Components/Header';
import PrimaryButton from '../Components/PrimaryButton';

export default function Resultados({
    vuelosIda = {},
    vuelosVuelta = {},
    passengers,
    tipo_vuelo,
}) {
    const { t } = useTranslation();

    const vuelosIdaArray = vuelosIda.data || [];
    const vuelosVueltaArray = vuelosVuelta?.data || [];

    // Estado para guardar IDs seleccionados (ida / vuelta)
    const [vueloSeleccionadoIda, setVueloSeleccionadoIda] = useState(null);
    const [vueloSeleccionadoVuelta, setVueloSeleccionadoVuelta] = useState(null);

    const renderVuelos = (lista, titulo = null, esIda = true) => (
        <div className="lista-vuelos">
            {titulo && <h2 className="titulo-vuelo">{titulo}</h2>}
            {lista.length === 0 ? (
                <p>{t('results.noFlights')}</p>
            ) : (
                lista.map((v) => {
                    const salida = new Date(v.fecha_salida);
                    const llegada = new Date(v.fecha_llegada);
                    const durMs = llegada - salida;
                    let durationISO = '';
                    if (!isNaN(durMs) && durMs > 0) {
                        const totalMinutes = Math.floor(durMs / 60000);
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        durationISO = `PT${hours}H${minutes}M`;
                    }

                    // ¿Es vuelo ida+vuelta?
                    const esRoundtrip = tipo_vuelo === 'roundtrip';

                    // ¿Está seleccionado este vuelo?
                    const seleccionado = esIda
                        ? vueloSeleccionadoIda === v.id
                        : vueloSeleccionadoVuelta === v.id;

                    return (
                        <div
                            className={`Billete-vuelos ${seleccionado ? 'seleccionado' : ''}`}
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
                                <div
                                    className="price"
                                    itemProp="offers"
                                    itemScope
                                    itemType="http://schema.org/Offer"
                                >
                                    {v.precio_minimo !== null ? (
                                        <>
                                            <meta itemProp="price" content={v.precio_minimo} />
                                            <meta itemProp="priceCurrency" content="EUR" />
                                            {t('results.from')} {v.precio_minimo} €
                                        </>
                                    ) : (
                                        t('results.noSeats')
                                    )}
                                </div>
                            </div>

                            <div className="Billete-vuelos-body">
                                {/* Origen */}
                                <div
                                    className="segment"
                                    itemProp="departureAirport"
                                    itemScope
                                    itemType="http://schema.org/Airport"
                                >
                                    <div className="city" itemProp="name">
                                        {v.aeropuerto_origen?.ciudad || 'N/A'}
                                    </div>
                                    <div className="code">
                                        (
                                        <span itemProp="iataCode">
                                            {v.aeropuerto_origen?.codigo_iata || '---'}
                                        </span>
                                        )
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
                                    <div className="date">{salida.toLocaleDateString()}</div>
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
                                        {v.aeropuerto_destino?.ciudad || 'N/A'}
                                    </div>
                                    <div className="code">
                                        (
                                        <span itemProp="iataCode">
                                            {v.aeropuerto_destino?.codigo_iata || '---'}
                                        </span>
                                        )
                                    </div>
                                    <time
                                        className="time"
                                        itemProp="arrivalTime"
                                        dateTime={llegada.toISOString()}
                                    >
                                        {llegada.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </time>
                                    <div className="date">{llegada.toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="Billete-vuelos-footer">
                                <div className="details">
                                    {t('results.duration')}:{' '}
                                    <time itemProp="duration" dateTime={durationISO}>
                                        {!durationISO || durMs <= 0
                                            ? '--'
                                            : `${Math.floor(durMs / 3600000)}h ${Math.floor(
                                                  (durMs % 3600000) / 60000
                                              )}m`}
                                    </time>
                                </div>

                                {esRoundtrip ? (
                                    <button
                                        type="button"
                                        className={`btn-seleccionar ${
                                            seleccionado ? 'seleccionado' : ''
                                        }`}
                                        onClick={() => {
                                            if (esIda) {
                                                setVueloSeleccionadoIda(v.id);
                                            } else {
                                                setVueloSeleccionadoVuelta(v.id);
                                            }
                                        }}
                                        disabled={
                                            v.precio_minimo === null ||
                                            v.plazas_libres < passengers ||
                                            passengers <= 0
                                        }
                                    >
                                        {seleccionado
                                            ? t('results.selected')
                                            : t('results.select')}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn-reserva"
                                        onClick={() =>
                                            router.get(
                                                route('seleccionar.asientos', {
                                                    id: v.id,
                                                    passengers: passengers,
                                                })
                                            )
                                        }
                                        disabled={
                                            v.precio_minimo === null ||
                                            v.plazas_libres < passengers ||
                                            passengers <= 0
                                        }
                                    >
                                        {t('results.reserve')}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );

    // Botón “Confirmar” para redirigir al selector de asientos ida y vuelta
    const confirmarSeleccion = () => {
        if (vueloSeleccionadoIda && vueloSeleccionadoVuelta) {
            router.get(
                route('seleccionar.asientos', {
                    id: vueloSeleccionadoIda, // segmento {id} = vuelo de ida
                    idVuelta: vueloSeleccionadoVuelta, // query string
                    passengers, // query string
                })
            );
        }
    };

    return (
        <>
            <Head title={t('results.title')} />
            <Header activePage="#" />

            <div className="resultados-vuelos">
                {(vuelosIdaArray.length > 0 || vuelosVueltaArray.length > 0) ? (
                    <>
                        {renderVuelos(
                            vuelosIdaArray,
                            t('results.outbound') || 'Vuelos de ida',
                            true
                        )}

                        {tipo_vuelo === 'roundtrip' &&
                            vuelosVueltaArray.length > 0 &&
                            renderVuelos(
                                vuelosVueltaArray,
                                t('results.return') || 'Vuelos de vuelta',
                                false
                            )}

                        {tipo_vuelo === 'roundtrip' &&
                            vueloSeleccionadoIda &&
                            vueloSeleccionadoVuelta && (
                                <div className="volver-btn">
                                    <PrimaryButton onClick={confirmarSeleccion}>
                                        {t('results.confirm')}
                                    </PrimaryButton>
                                </div>
                            )}
                    </>
                ) : (
                    <p className="no-vuelos">{t('results.noFlights')}</p>
                )}
            </div>
        </>
    );
}
