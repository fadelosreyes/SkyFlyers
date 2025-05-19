import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import '../../css/SeleccionarAsientos.css';
import '../../css/principal.css';
import Header from '../Components/Header';

export default function SeleccionarAsientos({ vuelo, asientos }) {
  const [claseSeleccionada, setClaseSeleccionada] = useState('turista');
  const [seleccionados, setSeleccionados] = useState([]);

  // 🔢 Función para extraer número de fila y letra del asiento
  const parseAsiento = (numero) => {
    const match = numero.match(/^(\d+)([A-Z])$/i);
    return match ? { fila: parseInt(match[1]), letra: match[2] } : { fila: 0, letra: '' };
  };

  // 🔁 Ordenar asientos por fila y letra
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

  const columnasGrid =
    claseSeleccionada === 'turista' ? 6 :
    claseSeleccionada === 'business' ? 4 :
    2;

  function toggleSeleccion(id) {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter(a => a !== id));
    } else {
      setSeleccionados([...seleccionados, id]);
    }
  }

  function confirmarSeleccion() {
    router.post('/vuelos/confirmar-asientos', {
      vuelo_id: vuelo.id,
      asientos: seleccionados,
    });
  }

  return (
    <>
      <Head title={`Seleccionar Asientos - Vuelo ${vuelo.id}`} />
      <Header activePage="#" />
      <div className="contenedor-principal">
        <div
          className="contenedor-avion"
          style={{ gridTemplateColumns: `repeat(${columnasGrid}, 2.5em)` }}
        >
          {asientosFiltrados.map(asiento => (
            <button
              key={asiento.id}
              disabled={asiento.estado.nombre === 'ocupado'}
              className={`asiento ${
                asiento.estado.nombre === 'ocupado' ? 'ocupado' : ''
              } ${seleccionados.includes(asiento.id) ? 'seleccionado' : ''}`}
              onClick={() => {
                if (asiento.estado.nombre !== 'ocupado') toggleSeleccion(asiento.id);
              }}
              title={asiento.numero}
            >
              {asiento.numero}
            </button>
          ))}
        </div>

        <div className="contenedor-menu">
          <h3>Selecciona clase</h3>
          <select
            value={claseSeleccionada}
            onChange={e => {
              setClaseSeleccionada(e.target.value);
              setSeleccionados([]);
            }}
            style={{ width: '100%', padding: '0.5em', marginBottom: '1em' }}
          >
            <option value="turista">Turista</option>
            <option value="business">Business</option>
            <option value="primera">Primera</option>
          </select>

          <button
            onClick={confirmarSeleccion}
            disabled={seleccionados.length === 0}
            style={{
              padding: '0.625em 1.25em',
              fontSize: '1em',
              backgroundColor: seleccionados.length === 0 ? '#999' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '0.5em',
              cursor: seleccionados.length === 0 ? 'not-allowed' : 'pointer',
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
