import { useEffect, useState } from 'react';
import PrimaryButton from './PrimaryButton';

export default function VuelosDestacados() {
  const [vuelos, setVuelos] = useState([]);

  useEffect(() => {
    fetch('/vuelos/destacados')
      .then(res => res.json())
      .then(data => setVuelos(data))
      .catch(err => console.error(err));
  }, []);

  if (vuelos.length === 0) {
    return <p className="text-center py-4">Cargando vuelos recomendados…</p>;
  }

  return (
    <section className="seccion-vuelos-destacados mt-8 p-4 bg-gray-50">
      <h2 className="text-2xl mb-4">Vuelos Recomendados</h2>
      <div className="flex gap-4 overflow-x-auto">
        {vuelos.map(vuelo => (
          <article
            key={vuelo.id}
            className="bg-white rounded-2xl shadow p-4 min-w-[220px] flex-shrink-0"
          >
            <img
              src={vuelo.imagen}
              alt={`Vuelo de ${vuelo.origen} a ${vuelo.destino}`}
              className="w-full h-36 object-cover rounded-xl mb-2"
            />
            <h3 className="text-lg font-medium">
              {vuelo.origen} → {vuelo.destino}
            </h3>
            <p className="text-sm">
              Salida: {new Date(vuelo.fecha_salida).toLocaleString('es-ES')}
            </p>
            <p className="text-sm mb-3">
              Llegada: {new Date(vuelo.fecha_llegada).toLocaleString('es-ES')}
            </p>
            <PrimaryButton className="w-full">Ver más</PrimaryButton>
          </article>
        ))}
      </div>
    </section>
  );
}
