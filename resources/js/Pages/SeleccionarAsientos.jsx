import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import '../../css/SeleccionarAsientos.css';
import '../../css/principal.css';
import Header from '../Components/Header';

export default function SeleccionarAsientos({ vuelo, asientos, numPasajeros }) {
    const [claseSeleccionada, setClaseSeleccionada] = useState('turista');

    // Estado por clase para asientos seleccionados
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
            if (aParsed.fila === bParsed.fila) {
                return aParsed.letra.localeCompare(bParsed.letra);
            }
            return aParsed.fila - bParsed.fila;
        });

    // Número de columnas totales incluyendo pasillo
    const columnasTotales =
        claseSeleccionada === 'turista' ? 7 : // 6 asientos + 1 pasillo
            claseSeleccionada === 'business' ? 5 : // 4 asientos + 1 pasillo
                3; // 2 asientos + 1 pasillo

    // Obtener seleccionados para la clase actual
    const getSeleccionados = () => seleccionPorClase[claseSeleccionada];

    // Total de asientos seleccionados en todas las clases
    const totalSeleccionados = Object.values(seleccionPorClase).reduce((acc, arr) => acc + arr.length, 0);

    // Agrupar asientos por fila
    const filas = {};
    asientosFiltrados.forEach(asiento => {
        const { fila } = parseAsiento(asiento.numero);
        if (!filas[fila]) filas[fila] = [];
        filas[fila].push(asiento);
    });
    // Ordenar letras dentro de la fila
    Object.values(filas).forEach(filaAsientos => {
        filaAsientos.sort((a, b) => a.numero.localeCompare(b.numero));
    });

    // Función para seleccionar/deseleccionar asiento con límite global
    function toggleSeleccion(id) {
        const seleccionadosActuales = seleccionPorClase[claseSeleccionada];
        const yaSeleccionado = seleccionadosActuales.includes(id);

        if (!yaSeleccionado && totalSeleccionados >= numPasajeros) {
            alert(`Solo puedes seleccionar hasta ${numPasajeros} asientos en total.`);
            return; // No permitimos seleccionar más
        }

        const nuevosSeleccionados = yaSeleccionado
            ? seleccionadosActuales.filter(a => a !== id)
            : [...seleccionadosActuales, id];

        setSeleccionPorClase({
            ...seleccionPorClase,
            [claseSeleccionada]: nuevosSeleccionados
        });
    }

    // Confirmar selección y enviar al backend
    function confirmarSeleccion() {
        const todosSeleccionados = Object.values(seleccionPorClase).flat();

        router.post('/vuelos/confirmar-asientos', {
            vuelo_id: vuelo.id,
            asientos: todosSeleccionados,
        });
    }

    return (
        <>
            <Head title={`Seleccionar Asientos - Vuelo ${vuelo.id}`} />
            <Header activePage="#" />
            <div className="contenedor-principal" style={{ display: 'flex' }}>
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
                                {/* Mitad izquierda */}
                                {asientosFila.slice(0, mitad).map(asiento => {
                                    const estaSeleccionado = getSeleccionados().includes(asiento.id);
                                    const estaOcupado = asiento.estado.nombre === 'Ocupado';

                                    let imgSrc = '/img/asiento_vacio.png';
                                    if (estaOcupado) imgSrc = '/img/asiento_rojo.png';
                                    else if (estaSeleccionado) imgSrc = '/img/asiento_verde.png';

                                    return (
                                        <button
                                            key={asiento.id}
                                            disabled={estaOcupado}
                                            className="asiento"
                                            onClick={() => {
                                                if (!estaOcupado) toggleSeleccion(asiento.id);
                                            }}
                                            title={asiento.numero}
                                            type="button"
                                            style={{ padding: 0, border: 'none', background: 'transparent', cursor: estaOcupado ? 'not-allowed' : 'pointer' }}
                                        >
                                            <img
                                                src={imgSrc}
                                                alt={`Asiento ${asiento.numero}`}
                                                style={{ width: '2.5em', height: '2.5em', display: 'block' }}
                                            />
                                        </button>
                                    );
                                })}
                                {/* Pasillo vacío */}
                                <div style={{ width: '1.5em' }} />
                                {/* Mitad derecha */}
                                {asientosFila.slice(mitad).map(asiento => {
                                    const estaSeleccionado = getSeleccionados().includes(asiento.id);
                                    const estaOcupado = asiento.estado.nombre === 'Ocupado';

                                    let imgSrc = '/img/asiento_vacio.png';
                                    if (estaOcupado) imgSrc = '/img/asiento_rojo.png';
                                    else if (estaSeleccionado) imgSrc = '/img/asiento_verde.png';

                                    return (
                                        <button
                                            key={asiento.id}
                                            disabled={estaOcupado}
                                            className="asiento"
                                            onClick={() => {
                                                if (!estaOcupado) toggleSeleccion(asiento.id);
                                            }}
                                            title={asiento.numero}
                                            type="button"
                                            style={{ padding: 0, border: 'none', background: 'transparent', cursor: estaOcupado ? 'not-allowed' : 'pointer' }}
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
