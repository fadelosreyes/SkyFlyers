import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import '../../css/SeleccionarAsientos.css';
import '../../css/principal.css';
import Header from '../Components/Header';

export default function SeleccionarAsientos({ vuelo, asientos, numPasajeros, billete, claseSeleccionada: claseInicial }) {
    const { t } = useTranslation();

    const modoCambio = Boolean(billete);
    const claseInicialLower = claseInicial ? claseInicial.toLowerCase() : 'turista';

    const [claseSeleccionada, setClaseSeleccionada] = useState(modoCambio ? claseInicialLower : 'turista');

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
            primera: []
        };
    });

    const parseAsiento = (numero) => {
        const match = numero.match(/^(\d+)([A-Z])$/i);
        return match ? { fila: parseInt(match[1]), letra: match[2] } : { fila: 0, letra: '' };
    };

    const asientosFiltrados = asientos
        .filter(asiento => asiento.clase.nombre.toLowerCase() === claseSeleccionada)
        .sort((a, b) => {
            const aParsed = parseAsiento(a.numero);
            const bParsed = parseAsiento(b.numero);
            return aParsed.fila - bParsed.fila || aParsed.letra.localeCompare(bParsed.letra);
        });

    const columnasTotales =
        claseSeleccionada === 'turista' ? 7 :
            claseSeleccionada === 'business' ? 5 : 3;

    const getSeleccionados = () => seleccionPorClase[claseSeleccionada];
    const totalSeleccionados = Object.values(seleccionPorClase).reduce((acc, arr) => acc + arr.length, 0);

    const filas = {};
    asientosFiltrados.forEach(asiento => {
        const { fila } = parseAsiento(asiento.numero);
        if (!filas[fila]) filas[fila] = [];
        filas[fila].push(asiento);
    });

    Object.values(filas).forEach(filaAsientos => {
        filaAsientos.sort((a, b) => a.numero.localeCompare(b.numero));
    });

    const toggleSeleccion = (id) => {
        const seleccionadosActuales = seleccionPorClase[claseSeleccionada];
        const yaSeleccionado = seleccionadosActuales.includes(id);

        if (!yaSeleccionado) {
            if (modoCambio) {
                setSeleccionPorClase(prev => ({
                    ...prev,
                    [claseSeleccionada]: [id]
                }));
            } else {
                if (totalSeleccionados >= numPasajeros) {
                    alert(t('seleccionar_asientos.alerta_limite', { numPasajeros }));
                    return;
                }
                setSeleccionPorClase(prev => ({
                    ...prev,
                    [claseSeleccionada]: [...prev[claseSeleccionada], id]
                }));
            }
        } else {
            setSeleccionPorClase(prev => ({
                ...prev,
                [claseSeleccionada]: prev[claseSeleccionada].filter(a => a !== id)
            }));
        }
    };

    const confirmarSeleccion = () => {
        if (modoCambio) {
            const seleccionados = getSeleccionados();
            if (seleccionados.length !== 1) {
                alert(t('seleccionar_asientos.error_seleccion'));
                return;
            }

            router.post(route('billetes.actualizarAsiento', billete.id), {
                asiento_id: seleccionados[0],
            }, {
                onSuccess: () => {
                    alert(t('seleccionar_asientos.exito_cambio'));
                    // Redirigir a cancelaciones tras cambiar asiento
                    router.visit(route('cancelaciones.index'));
                },
                onError: (errors) => {
                    alert(errors.asiento_id || t('seleccionar_asientos.error_general'));
                }
            });
        } else {
            const todosSeleccionados = Object.values(seleccionPorClase).flat();
            router.get(route('billetes.create'), {
                vuelo_id: vuelo.id,
                asientos: todosSeleccionados,
            });
        }
    };

    const limpiarSeleccionClaseActual = () => {
        setSeleccionPorClase(prev => ({
            ...prev,
            [claseSeleccionada]: []
        }));
    };

    const limpiarTodosSeleccionados = () => {
        setSeleccionPorClase({
            turista: [],
            business: [],
            primera: []
        });
    };

    // Función para cancelar (redirigir a cancelaciones)
    const cancelar = () => {
        router.visit(route('cancelaciones.index'));
    };

    return (
        <>
            <Head title={`${modoCambio ? t('seleccionar_asientos.titulo_cambio') : t('seleccionar_asientos.titulo')} - Vuelo ${vuelo.id}`} />
            <Header activePage="#" />

            <div className="contenedor-principal">
                <div
                    className="contenedor-avion"
                    style={{
                        gridTemplateColumns: `repeat(${(columnasTotales - 1) / 2}, 2.5em) 1.5em repeat(${(columnasTotales - 1) / 2}, 2.5em)`,
                        gap: '0.8em 1em'
                    }}
                >
                    {Object.entries(filas).map(([fila, asientosFila]) => {
                        const mitad = Math.ceil(asientosFila.length / 2);
                        return (
                            <React.Fragment key={fila}>
                                {asientosFila.slice(0, mitad).map(asiento => {
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
                                {asientosFila.slice(mitad).map(asiento => {
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

                <div className="contenedor-menu">
                    {!modoCambio && (
                        <>
                            <h3>{t('seleccionar_asientos.selecciona_clase')}</h3>
                            <select
                                value={claseSeleccionada}
                                onChange={e => setClaseSeleccionada(e.target.value)}
                            >
                                <option value="turista">{t('clases.turista')}</option>
                                <option value="business">{t('clases.business')}</option>
                                <option value="primera">{t('clases.primera')}</option>
                            </select>
                        </>
                    )}

                    {/* Mostrar contador solo si NO es modo cambio */}
                    {!modoCambio && (
                        <p><strong>{t('seleccionar_asientos.asientos_seleccionados')}:</strong> {totalSeleccionados} / {numPasajeros}</p>
                    )}

                    {!modoCambio && Object.entries(seleccionPorClase).map(([clase, ids]) => (
                        ids.length > 0 && (
                            <div key={clase}>
                                <p><strong>{t(`clases.${clase}`)}:</strong> {ids.length} {t('seleccionar_asientos.asientos')}</p>
                            </div>
                        )
                    ))}

                    <button
                        onClick={confirmarSeleccion}
                        disabled={modoCambio ? getSeleccionados().length === 0 : totalSeleccionados === 0}
                        className="btn-confirmar"
                    >
                        {modoCambio ? t('seleccionar_asientos.confirmar_cambio') : t('seleccionar_asientos.confirmar')}
                    </button>

                    {/* Botón cancelar visible solo en modo cambio */}
                    {modoCambio && (
                        <button
                            onClick={cancelar}
                            className="btn-cancelar"
                            style={{ marginTop: '1em', backgroundColor: '#f44336', color: 'white' }}
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
                                {t('seleccionar_asientos.limpiar_clase', { clase: t(`clases.${claseSeleccionada}`) })}
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
