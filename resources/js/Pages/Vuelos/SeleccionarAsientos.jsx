import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function SeleccionarAsientos({ vuelo, asientos }) {
  const [selected, setSelected] = useState([]);

  function toggleSeleccion(id) {
    if (selected.includes(id)) {
      setSelected(selected.filter(a => a !== id));
    } else {
      setSelected([...selected, id]);
    }
  }

  function confirmarSeleccion() {
    router.post('/vuelos/confirmar-asientos', { vuelo_id: vuelo.id, asientos: selected });
  }

  return (
    <>
      <Head title={`Seleccionar asientos - Vuelo ${vuelo.id}`} />

      <h1>Selecciona tus asientos para el vuelo {vuelo.id}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 50px)', gap: '10px', marginBottom: '20px' }}>
        {asientos.map(asiento => (
          <button
            key={asiento.id}
            disabled={asiento.ocupado}
            onClick={() => toggleSeleccion(asiento.id)}
            style={{
              backgroundColor: asiento.ocupado ? '#ccc' : selected.includes(asiento.id) ? '#4caf50' : 'white',
              cursor: asiento.ocupado ? 'not-allowed' : 'pointer',
              height: '50px',
            }}
          >
            {asiento.numero}
          </button>
        ))}
      </div>

      <div>
        <h3>Asientos seleccionados:</h3>
        <ul>
          {selected.map(id => (
            <li key={id}>Asiento {id}</li>
          ))}
        </ul>
      </div>

      <button onClick={confirmarSeleccion} disabled={selected.length === 0}>
        Confirmar selección
      </button>
    </>
  );
}

