import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import PrimaryButton from './PrimaryButton';
import { useTranslation } from 'react-i18next';

export default function VuelosDestacados() {
    const { t } = useTranslation();
    const [vuelos, setVuelos] = useState([]);
    const [marginTop, setMarginTop] = useState(48); // margen inicial en px (ejemplo 3em = 48px)

    useEffect(() => {
        fetch('/vuelos/destacados')
            .then(res => res.json())
            .then(data => setVuelos(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        function handleResize() {
            const width = window.innerWidth;
            let newMargin;

            if (width >= 1200) { 
                newMargin = 60;
            } else if (width >= 768) {
                newMargin = 200;
            } else if (width >= 480) {
                newMargin = 280;
            } else {
                newMargin = 320;
            }
            setMarginTop(newMargin);
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (vuelos.length === 0) {
        return <p className="text-center py-4">{t('flights.loadingRecommended')}</p>;
    }

    const handleVerMas = (vueloId) => {
        router.get(`/vuelos/reservar/${vueloId}`);
    };

    return (
        <section
            className="seccion-vuelos-destacados p-6 bg-gradient-to-b from-white to-gray-100 flex flex-col items-center"
            style={{ marginTop: `${marginTop}px` }}
        >
            <h2 className="w-full max-w-[1200px] text-4xl font-extrabold mb-10 mt-12 text-center text-black flex items-center justify-center gap-3 mx-auto">
                {t('flights.recommended')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-6 w-full max-w-[1200px]">
                {vuelos.map((vuelo) => {
                    const { plazas_libres } = vuelo;
                    const mostrarAviso = typeof plazas_libres === 'number' && plazas_libres <= 30;

                    return (
                        <article
                            key={vuelo.id}
                            className="bg-white rounded-2xl shadow-xl p-4 hover:shadow-2xl transition-shadow duration-300 flex flex-col"
                        >
                            <div className="relative w-full h-52 mb-3">
                                <img
                                    src={vuelo.imagen}
                                    alt={`${t('flights.flightFrom')} ${vuelo.origen} ${t('flights.to')} ${vuelo.destino}`}
                                    className="w-full h-full object-cover rounded-xl"
                                />

                                {mostrarAviso && (
                                    <span className="absolute top-2 left-2 font-bold bg-white bg-opacity-75 px-2 py-1 rounded text-red-600">
                                        {plazas_libres < 5
                                            ? t('flights.lastSeats')
                                            : t('flights.onlySeatsLeft', { count: plazas_libres })
                                        }
                                    </span>
                                )}
                            </div>

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
                    );
                })}
            </div>
        </section>
    );
}
