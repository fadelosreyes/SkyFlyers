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
        router.post('/billetes', {
            vuelo_id: vuelo.id,
            asientos: todosSeleccionados,
        });
    };

    const limpiarSeleccionClaseActual = () => {
        setSeleccionPorClase(prev => ({
            ...prev,
            [claseSeleccionada]: []
        }));
    };

    // Nueva función para limpiar todos los asientos seleccionados
    const limpiarTodosSeleccionados = () => {
        setSeleccionPorClase({
            turista: [],
            business: [],
            primera: []
        });
    };

    return (
        <>
            <Head title={`Seleccionar Asientos - Vuelo ${vuelo.id}`} />
            <Header activePage="#" />

            <div className="contenedor-principal">
                <div
                    className="contenedor-avion"
                    style={{
                        gridTemplateColumns: `repeat(${(columnasTotales - 1) / 2}, 2.5em) 1.5em repeat(${(columnasTotales - 1) / 2}, 2.5em)`
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
                                        >
                                            <img
                                                src={imgSrc}
                                                alt={`Asiento ${asiento.numero}`}
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
                                        >
                                            <img
                                                src={imgSrc}
                                                alt={`Asiento ${asiento.numero}`}
                                            />
                                        </button>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="contenedor-menu">
                    <h3>Selecciona clase</h3>
                    <select
                        value={claseSeleccionada}
                        onChange={e => setClaseSeleccionada(e.target.value)}
                    >
                        <option value="turista">Turista</option>
                        <option value="business">Business</option>
                        <option value="primera">Primera</option>
                    </select>

                    <p><strong>Asientos seleccionados:</strong> {totalSeleccionados} / {numPasajeros}</p>

                    {Object.entries(seleccionPorClase).map(([clase, ids]) => (
                        ids.length > 0 && (
                            <div key={clase}>
                                <p><strong>{clase.charAt(0).toUpperCase() + clase.slice(1)}:</strong> {ids.length} asientos</p>
                            </div>
                        )
                    ))}

                    <button
                        onClick={confirmarSeleccion}
                        disabled={totalSeleccionados === 0}
                        className="btn-confirmar"
                    >
                        Confirmar selección
                    </button>

                    <div style={{ display: 'flex', gap: '1em', marginTop: '1em' }}>
                        <button
                            onClick={limpiarSeleccionClaseActual}
                            disabled={getSeleccionados().length === 0}
                            className="btn-limpiar"
                        >
                            Limpiar {claseSeleccionada}
                        </button>

                        <button
                            onClick={limpiarTodosSeleccionados}
                            disabled={totalSeleccionados === 0}
                            className="btn-limpiar"
                        >
                            Limpiar todos
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}
