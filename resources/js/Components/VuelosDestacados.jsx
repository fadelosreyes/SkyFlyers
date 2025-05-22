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
        <section className="seccion-vuelos-destacados mt-8 p-4 bg-gray-50 flex flex-col items-center">
            <h2 className="w-full max-w-[1200px] text-3xl font-extrabold mb-6 mt-8 text-center text-black flex items-center justify-center gap-3 mx-auto">
                Vuelos Recomendados
            </h2>

            <div className="flex justify-between gap-4 w-full max-w-[1200px]">
                {vuelos.map((vuelo) => (
                    <article
                        key={vuelo.id}
                        className="bg-white rounded-2xl shadow p-4 flex-grow min-w-0 max-w-[calc(20%-0.8rem)]"
                        style={{ flexBasis: '20%' }}
                    >
                        <img
                            src={vuelo.imagen}
                            alt={`Vuelo de ${vuelo.origen} a ${vuelo.destino}`}
                            className="w-full h-36 object-cover rounded-xl mb-2"
                        />
                        <h3 className="text-lg font-medium mb-1">
                            {vuelo.origen} → {vuelo.destino}
                        </h3>
                        <p className="text-sm mb-1">
                            Salida: {new Date(vuelo.fecha_salida).toLocaleString('es-ES')}
                        </p>
                        <p className="text-sm mb-3">
                            Llegada: {new Date(vuelo.fecha_llegada).toLocaleString('es-ES')}
                        </p>
                        {/* Precio destacado */}
                        {vuelo.precio_minimo !== undefined && vuelo.precio_minimo !== null ? (
                            <p className="text-center text-2xl font-bold text-indigo-600 mb-4">
                                Desde {vuelo.precio_minimo} €
                            </p>
                        ) : (
                            <p className="text-center text-red-600 mb-4">Sin plazas disponibles</p>
                        )}
                        <PrimaryButton className="w-full">Ver más</PrimaryButton>
                    </article>
                ))}
            </div>
        </section>
    );
}
