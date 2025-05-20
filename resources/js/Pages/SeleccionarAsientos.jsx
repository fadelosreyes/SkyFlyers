import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import '../../css/SeleccionarAsientos.css';
import '../../css/principal.css';
import Header from '../Components/Header';

export default function SeleccionarAsientos({ vuelo, asientos, numPasajeros }) {
    const [claseSeleccionada, setClaseSeleccionada] = useState('turista');

    const [seleccionPorClase, setSeleccionPorClase] = useState({
        turista: [],
        business: [],
        primera: []
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
        claseSeleccionada === 'business' ? 5 :
        3;

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

        if (!yaSeleccionado && totalSeleccionados >= numPasajeros) {
            alert(`Solo puedes seleccionar hasta ${numPasajeros} asientos en total.`);
            return;
        }

        const nuevosSeleccionados = yaSeleccionado
            ? seleccionadosActuales.filter(a => a !== id)
            : [...seleccionadosActuales, id];

        setSeleccionPorClase(prev => ({
            ...prev,
            [claseSeleccionada]: nuevosSeleccionados
        }));
    };

    const confirmarSeleccion = () => {
        const todosSeleccionados = Object.values(seleccionPorClase).flat();
        router.post('/vuelos/confirmar-asientos', {
            vuelo_id: vuelo.id,
            asientos: todosSeleccionados,
        });
    };

    return (
        <>
            <Head title={`Seleccionar Asientos - Vuelo ${vuelo.id}`} />
            <Header activePage="#" />

            <div className="contenedor-principal" style={{ display: 'flex', gap: '2em' }}>
                <div
                    className="contenedor-avion"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${(columnasTotales - 1) / 2}, 2.5em) 1.5em repeat(${(columnasTotales - 1) / 2}, 2.5em)`,
                        columnGap: '0.3em',
                        rowGap: '0.8em',
                        justifyContent: 'center',
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
                                            title={`Asiento ${asiento.numero} - ${asiento.precio_base}€`}
                                            type="button"
                                            style={{
                                                padding: 0,
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: estaOcupado ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            <img
                                                src={imgSrc}
                                                alt={`Asiento ${asiento.numero}`}
                                                style={{ width: '2.5em', height: '2.5em', display: 'block' }}
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
                                            title={`Asiento ${asiento.numero} - ${asiento.precio_base}€`}
                                            type="button"
                                            style={{
                                                padding: 0,
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: estaOcupado ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            <img
                                                src={imgSrc}
                                                alt={`Asiento ${asiento.numero}`}
                                                style={{ width: '2.5em', height: '2.5em', display: 'block' }}
                                            />
                                        </button>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="contenedor-menu" style={{ minWidth: '200px' }}>
                    <h3>Selecciona clase</h3>
                    <select
                        value={claseSeleccionada}
                        onChange={e => setClaseSeleccionada(e.target.value)}
                        style={{ width: '100%', padding: '0.5em', marginBottom: '1em' }}
                    >
                        <option value="turista">Turista</option>
                        <option value="business">Business</option>
                        <option value="primera">Primera</option>
                    </select>

                    <p>
                        Asientos seleccionados: {totalSeleccionados} / {numPasajeros}
                    </p>

                    <button
                        onClick={confirmarSeleccion}
                        disabled={totalSeleccionados === 0}
                        style={{
                            padding: '0.625em 1.25em',
                            fontSize: '1em',
                            backgroundColor: totalSeleccionados === 0 ? '#999' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5em',
                            cursor: totalSeleccionados === 0 ? 'not-allowed' : 'pointer',
                            width: '100%',
                        }}
                    >
                        Confirmar selección
                    </button>
                </div>
            </div>
        </>
    );
}
