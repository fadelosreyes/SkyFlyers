import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import PrimaryButton from './PrimaryButton';
import { useTranslation } from 'react-i18next';

export default function VuelosDestacados() {
  const { t } = useTranslation();
  const [vuelos, setVuelos] = useState([]);

  useEffect(() => {
    fetch('/vuelos/destacados')
      .then(res => res.json())
      .then(data => setVuelos(data))
      .catch(err => console.error(err));
  }, []);

  if (vuelos.length === 0) {
    return <p className="text-center py-4">{t('flights.loadingRecommended')}</p>;
  }

  const handleVerMas = (vueloId) => {
    router.get(`/vuelos/reservar/${vueloId}`);
  };

  return (
    <section className="seccion-vuelos-destacados mt-12 p-6 bg-gradient-to-b from-white to-gray-100 flex flex-col items-center">
      <h2 className="w-full max-w-[1200px] text-4xl font-extrabold mb-10 mt-12 text-center text-black flex items-center justify-center gap-3 mx-auto">
        {t('flights.recommended')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-6 w-full max-w-[1200px]">
        {vuelos.map((vuelo) => (
          <article
            key={vuelo.id}
            className="bg-white rounded-2xl shadow-xl p-4 hover:shadow-2xl transition-shadow duration-300 flex flex-col"
          >
            <img
              src={vuelo.imagen}
              alt={`${t('flights.flightFrom')} ${vuelo.origen} ${t('flights.to')} ${vuelo.destino}`}
              className="w-full h-52 object-cover rounded-xl mb-3"
            />
            <h3 className="text-xl font-semibold mb-1 text-center text-gray-800">
              {vuelo.origen} → {vuelo.destino}
            </h3>
            <p className="text-sm mb-1 text-center text-gray-600">
              {t('flights.departure')}: {new Date(vuelo.fecha_salida).toLocaleString()}
            </p>
            <p className="text-sm mb-3 text-center text-gray-600">
              {t('flights.arrival')}: {new Date(vuelo.fecha_llegada).toLocaleString()}
            </p>
            {vuelo.precio_minimo !== undefined && vuelo.precio_minimo !== null ? (
              <p className="text-center text-2xl font-bold text-indigo-600 mb-4">
                {t('flights.from')} {vuelo.precio_minimo} €
              </p>
            ) : (
              <p className="text-center text-red-600 mb-4">{t('flights.noSeats')}</p>
            )}
            <PrimaryButton className="w-full mt-auto" onClick={() => handleVerMas(vuelo.id)}>
              {t('flights.viewMore')}
            </PrimaryButton>
          </article>
        ))}
      </div>
    </section>
  );
}
