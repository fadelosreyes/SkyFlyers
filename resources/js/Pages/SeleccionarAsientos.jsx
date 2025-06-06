import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../../css/SeleccionarAsientos.css';
import '../../css/principal.css';
import Header from '../Components/Header';

export default function SeleccionarAsientos({
    vuelo,
    asientos,
    numPasajeros,
    idVuelta,
    billete,
    claseSeleccionada: claseInicial
}) {
    const { t } = useTranslation();

    // 1) Determinar si es ida/vuelta
    const esRoundTrip = Boolean(idVuelta);
    const isSeleccionVuelta = esRoundTrip && String(vuelo?.id) === String(idVuelta);

    // 2) Modo “cambio de asiento” si proviene de un billete
    const modoCambio = Boolean(billete);

    // 3) Estado inicial de la clase seleccionada (minúsculas)
    const claseInicialLower = claseInicial ? claseInicial.toLowerCase() : 'turista';
    const [claseSeleccionada, setClaseSeleccionada] = useState(
        modoCambio ? claseInicialLower : 'turista'
    );

    // 4) Estado de Asientos seleccionados agrupado por clase
    const [seleccionPorClase, setSeleccionPorClase] = useState(() => {
        if (modoCambio) {
            return {
                turista: [],
                business: [],
                primera: [],
                [claseInicialLower]: [billete.asiento_id],
            };
        }
        return {
            turista: [],
            business: [],
            primera: [],
        };
    });

    // 5) Función para parsear “12A” → { fila: 12, letra: 'A' }
    const parseAsiento = (numero) => {
        const match = numero.match(/^(\d+)([A-Z])$/i);
        return match
            ? { fila: parseInt(match[1]), letra: match[2] }
            : { fila: 0, letra: '' };
    };

    // 6) Filtrar y ordenar asientos según claseSeleccionada
    const asientosFiltrados = asientos
        .filter((a) => a.clase.nombre.toLowerCase() === claseSeleccionada)
        .sort((a, b) => {
            const ap = parseAsiento(a.numero);
            const bp = parseAsiento(b.numero);
            return ap.fila - bp.fila || ap.letra.localeCompare(bp.letra);
        });

    // 7) Columnas a renderizar según la clase (solo para la vista del asiento)
    const rawTurista = vuelo.avion?.asientos_por_fila_turista || 0;
    const rawBusiness = vuelo.avion?.asientos_por_fila_business || 0;
    const rawPrimera = vuelo.avion?.asientos_por_fila_primera || 0;

    // Convertimos a entero y sumamos 1:
    const columnasTotales =
        claseSeleccionada === 'turista'
            ? parseInt(rawTurista, 10) + 1
            : claseSeleccionada === 'business'
                ? parseInt(rawBusiness, 10) + 1
                : parseInt(rawPrimera, 10) + 1;

    // 8) Agrupar asientos por filas
    const filas = {};
    asientosFiltrados.forEach((a) => {
        const { fila } = parseAsiento(a.numero);
        if (!filas[fila]) filas[fila] = [];
        filas[fila].push(a);
    });
    Object.values(filas).forEach((arr) => {
        arr.sort((a, b) => a.numero.localeCompare(b.numero));
    });

    // 9) Auxiliares para contar selecciones
    const getSeleccionados = () => seleccionPorClase[claseSeleccionada];
    const totalSeleccionados = Object.values(seleccionPorClase).reduce(
        (acc, arr) => acc + arr.length,
        0
    );

    // 10) Función para alternar selección de un asiento
    const toggleSeleccion = (id) => {
        const actuales = seleccionPorClase[claseSeleccionada];
        const yaSel = actuales.includes(id);

        if (!yaSel) {
            if (modoCambio) {
                // Solo un asiento en modo cambio
                setSeleccionPorClase((prev) => ({
                    ...prev,
                    [claseSeleccionada]: [id],
                }));
            } else {
                // ← Si numPasajeros es NULL, no hacemos la comprobación de límite
                if (numPasajeros !== null && totalSeleccionados >= numPasajeros) {
                    alert(t('seleccionar_asientos.alerta_limite', { numPasajeros }));
                    return;
                }
                setSeleccionPorClase((prev) => ({
                    ...prev,
                    [claseSeleccionada]: [...prev[claseSeleccionada], id],
                }));
            }
        } else {
            // Deseleccionar
            setSeleccionPorClase((prev) => ({
                ...prev,
                [claseSeleccionada]: prev[claseSeleccionada].filter((a) => a !== id),
            }));
        }
    };

    // 11) Confirmar selección
    const confirmarSeleccion = () => {
        // --- A) MODO CAMBIO ---
        if (modoCambio) {
            const seleccionados = getSeleccionados();
            if (seleccionados.length !== 1) {
                alert(t('seleccionar_asientos.error_seleccion'));
                return;
            }

            router.post(
                route('billetes.actualizarAsiento', billete.id),
                { asiento_id: seleccionados[0] },
                {
                    onSuccess: () => {
                        alert(t('seleccionar_asientos.exito_cambio'));
                        router.visit(route('cancelaciones.index'));
                    },
                    onError: (errors) => {
                        alert(errors.asiento_id || t('seleccionar_asientos.error_general'));
                    },
                }
            );
            return;
        }

        // --- B) IDA DE UN ROUND TRIP ---
        if (esRoundTrip && !isSeleccionVuelta) {
            const seleccionadosIda = Object.values(seleccionPorClase).flat();

            // ← Solo validamos conteo si numPasajeros no es null
            if (numPasajeros !== null && seleccionadosIda.length !== numPasajeros) {
                alert(t('seleccionar_asientos.error_seleccion_ida', { numPasajeros }));
                return;
            }

            axios
                .post('/vuelos/guardar-seleccion-ida', {
                    vueloIda: vuelo.id,
                    seats: seleccionadosIda,
                    passengers: numPasajeros,
                })
                .then(() => {
                    router.get(
                        route('seleccionar.asientos', { id: idVuelta }) +
                        `?passengers=${numPasajeros}&idVuelta=${idVuelta}`
                    );
                })
                .catch((error) => {
                    console.error(
                        'POST /vuelos/guardar-seleccion-ida failed',
                        error.response?.data || error.message
                    );
                    alert(t('seleccionar_asientos.error_general'));
                });

            return;
        }

        // --- C) VUELTA DE UN ROUND TRIP ---
        if (esRoundTrip && isSeleccionVuelta && !modoCambio) {
            axios
                .get('/vuelos/obtener-seleccion-ida')
                .then(({ data }) => {
                    const vueloIda = data.vuelo_ida;
                    const seatsIda = data.asientos_ida || [];
                    const seleccionadosVuelta = Object.values(seleccionPorClase).flat();

                    if (!vueloIda) {
                        alert(t('seleccionar_asientos.error_seleccion', { numPasajeros }));
                        return;
                    }

                    // ← Solo validamos conteo si numPasajeros no es null
                    if (numPasajeros !== null && seleccionadosVuelta.length !== numPasajeros) {
                        alert(t('seleccionar_asientos.error_seleccion_vuelta', { numPasajeros }));
                        return;
                    }

                    const payload = {
                        vuelo_ida: vueloIda,
                        seats_ida: seatsIda,
                        vuelo_vuelta: idVuelta,
                        seats_vuelta: seleccionadosVuelta,
                        passengers: numPasajeros,
                    };
                    router.post(route('billetes.asientos'), payload);
                })
                .catch((error) => {
                    console.error('Error detallado:', error);
                    alert(
                        t('seleccionar_asientos.error_general') +
                        '\n' +
                        (error.response?.data?.message || error.message || JSON.stringify(error))
                    );
                });

            return;
        }

        // --- D) SOLO IDA (NO ROUND TRIP, NO CAMBIO)
        const seleccionadosIda = Object.values(seleccionPorClase).flat();

        // ← Solo validamos conteo si numPasajeros no es null
        if (numPasajeros !== null && seleccionadosIda.length !== numPasajeros) {
            alert(t('seleccionar_asientos.error_seleccion', { numPasajeros }));
            return;
        }

        router.post(route('billetes.asientos'), {
            vuelo_ida: vuelo.id,
            seats_ida: seleccionadosIda,
            vuelo_vuelta: null,
            seats_vuelta: null,
            passengers: numPasajeros,
        });
    };

    // 12) Funciones para limpiar selección
    const limpiarSeleccionClaseActual = () => {
        setSeleccionPorClase((prev) => ({
            ...prev,
            [claseSeleccionada]: [],
        }));
    };
    const limpiarTodosSeleccionados = () => {
        setSeleccionPorClase({ turista: [], business: [], primera: [] });
    };

    // 13) Función para cancelar (solo en modo cambio)
    const cancelar = () => {
        router.visit(route('cancelaciones.index'));
    };

    return (
        <>
            <Head
                title={`${modoCambio
                        ? t('seleccionar_asientos.titulo_cambio')
                        : idVuelta
                            ? t('seleccionar_asientos.titulo_ida')
                            : t('seleccionar_asientos.titulo')
                    } - Vuelo ${vuelo.id}`}
            />
            <Header activePage="#" />

            <div className="contenedor-principal">
                {/* ---------- MAPA DE ASIENTOS ---------- */}
                <div
                    className="contenedor-avion"
                    style={{
                        gridTemplateColumns: `repeat(${(columnasTotales - 1) / 2}, 2.5em) 1.5em repeat(${(columnasTotales -
                            1) /
                            2}, 2.5em)`,
                        gap: '0.8em 1em',
                    }}
                >
                    {Object.entries(filas).map(([fila, asientosFila]) => {
                        const mitad = Math.ceil(asientosFila.length / 2);
                        return (
                            <React.Fragment key={fila}>
                                {asientosFila.slice(0, mitad).map((asiento) => {
                                    const estaSeleccionado = getSeleccionados().includes(asiento.id);
                                    const estaOcupado = asiento.estado.nombre === 'Ocupado';
                                    const imgSrc = estaOcupado
                                        ? '/img/asiento_rojo.png'
                                        : estaSeleccionado
                                            ? '/img/asiento_verde.png'
                                            : '/img/asiento_vacio.png';

                                    return (
                                        <button
                                            key={asiento.id}
                                            disabled={estaOcupado}
                                            className="asiento"
                                            onClick={() => toggleSeleccion(asiento.id)}
                                            title={`${t('seleccionar_asientos.asiento')} ${asiento.numero} - ${asiento.precio_base}€`}
                                            type="button"
                                        >
                                            <img
                                                src={imgSrc}
                                                alt={`${t('seleccionar_asientos.asiento')} ${asiento.numero}`}
                                            />
                                        </button>
                                    );
                                })}
                                <div style={{ width: '1.5em' }} />
                                {asientosFila.slice(mitad).map((asiento) => {
                                    const estaSeleccionado = getSeleccionados().includes(asiento.id);
                                    const estaOcupado = asiento.estado.nombre === 'Ocupado';
                                    const imgSrc = estaOcupado
                                        ? '/img/asiento_rojo.png'
                                        : estaSeleccionado
                                            ? '/img/asiento_verde.png'
                                            : '/img/asiento_vacio.png';

                                    return (
                                        <button
                                            key={asiento.id}
                                            disabled={estaOcupado}
                                            className="asiento"
                                            onClick={() => toggleSeleccion(asiento.id)}
                                            title={`${t('seleccionar_asientos.asiento')} ${asiento.numero} - ${asiento.precio_base}€`}
                                            type="button"
                                        >
                                            <img
                                                src={imgSrc}
                                                alt={`${t('seleccionar_asientos.asiento')} ${asiento.numero}`}
                                            />
                                        </button>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* ---------- MENÚ LATERAL ---------- */}
                <div className="contenedor-menu">
                    {modoCambio && (
                        <h3
                            style={{
                                fontSize: '1.5rem',
                                textAlign: 'center',
                                margin: '20px 20px',
                                fontWeight: 'bold',
                                color: '#333',
                            }}
                        >
                            {t('seleccionar_asientos.modo_cambio')}
                        </h3>
                    )}

                    {!modoCambio && (
                        <>
                            {/* Selección de clase solo si no es modo cambio */}
                            <h3>{t('seleccionar_asientos.selecciona_clase')}</h3>
                            <select
                                value={claseSeleccionada}
                                onChange={(e) => setClaseSeleccionada(e.target.value)}
                            >
                                <option value="turista">{t('clases.turista')}</option>
                                <option value="business">{t('clases.business')}</option>
                                <option value="primera">{t('clases.primera')}</option>
                            </select>
                        </>
                    )}

                    {!modoCambio && (
                        <p>
                            <strong>{t('seleccionar_asientos.asientos_seleccionados')}:</strong>{' '}
                            {totalSeleccionados} {numPasajeros !== null && `/ ${numPasajeros}`}
                        </p>
                    )}

                    {!modoCambio &&
                        Object.entries(seleccionPorClase).map(
                            ([clase, ids]) =>
                                ids.length > 0 && (
                                    <div key={clase}>
                                        <p>
                                            <strong>{t(`clases.${clase}`)}:</strong> {ids.length}{' '}
                                            {t('seleccionar_asientos.asientos')}
                                        </p>
                                    </div>
                                )
                        )}

                    <button
                        onClick={confirmarSeleccion}
                        disabled={
                            modoCambio
                                ? getSeleccionados().length === 0
                                : numPasajeros !== null
                                    ? totalSeleccionados !== numPasajeros
                                    : totalSeleccionados === 0
                        }
                        className="btn-confirmar"
                    >
                        {modoCambio
                            ? t('seleccionar_asientos.confirmar_cambio')
                            : esRoundTrip
                                ? t('seleccionar_asientos.confirmar_ida')
                                : t('seleccionar_asientos.confirmar')}
                    </button>

                    {modoCambio && (
                        <button
                            onClick={cancelar}
                            className="btn-cancelar mt-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                        >
                            {t('seleccionar_asientos.cancelar')}
                        </button>
                    )}

                    {!modoCambio && (
                        <div style={{ display: 'flex', gap: '1em', marginTop: '1em' }}>
                            <button
                                onClick={limpiarSeleccionClaseActual}
                                disabled={getSeleccionados().length === 0}
                                className="btn-limpiar"
                            >
                                {t('seleccionar_asientos.limpiar_clase', {
                                    clase: t(`clases.${claseSeleccionada}`),
                                })}
                            </button>

                            <button
                                onClick={limpiarTodosSeleccionados}
                                disabled={totalSeleccionados === 0}
                                className="btn-limpiar"
                            >
                                {t('seleccionar_asientos.limpiar_todos')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
