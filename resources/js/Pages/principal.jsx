import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import '../../css/principal.css';
import PrimaryButton from '../Components/PrimaryButton';
import Header from '../Components/Header';
import VuelosDestacados from '../Components/VuelosDestacados';
import { useTranslation } from 'react-i18next';

export default function Principal({ auth }) {
    const { t } = useTranslation();

    // Estado para manejar la búsqueda y selección de aeropuertos de origen y destino
    const [originQuery, setOriginQuery] = useState('');
    const [destQuery, setDestQuery] = useState('');
    const [originList, setOriginList] = useState([]);
    const [destList, setDestList] = useState([]);
    const [originSelected, setOriginSelected] = useState(null);
    const [destSelected, setDestSelected] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [passengers, setPassengers] = useState(null);

    const [soloIda, setSoloIda] = useState(false);
    const [idaVuelta, setIdaVuelta] = useState(true);

    const [errors, setErrors] = useState({
        origin: '',
        dest: '',
        startDate: '',
        endDate: '',
        passengers: '',
    });

    // Referencias para detectar clics fuera
    const originRef = useRef();
    const destRef = useRef();

    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Array de imagenes para mostrar en un carrusel
    const imagenes = ['/img/image.png', '/img/index2.png'];
    const [imagenActual, setImagenActual] = useState(0);

    // Efecto para rotar imágenes automáticamente cada 4 segundos
    useEffect(() => {
        const intervalo = setInterval(() => {
            setImagenActual((prev) => (prev + 1) % imagenes.length);
        }, 3900);
        return () => clearInterval(intervalo);
    }, []);

    // Efecto para buscar sugerencias de origen tras un pequeño retraso (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            if (originQuery.length < 2) {
                setOriginList([]);
                return;
            }
            fetch(`/aeropuertos?q=${encodeURIComponent(originQuery)}`, {
                headers: { Accept: 'application/json' },
            })
                .then((res) => res.json())
                .then(setOriginList)
                .catch(() => setOriginList([]));
        }, 300);
        return () => clearTimeout(handler);
    }, [originQuery]);

    // Efecto similar para las sugerencias de destino
    useEffect(() => {
        const handler = setTimeout(() => {
            if (destQuery.length < 2) {
                setDestList([]);
                return;
            }
            fetch(`/aeropuertos?q=${encodeURIComponent(destQuery)}`, {
                headers: { Accept: 'application/json' },
            })
                .then((res) => res.json())
                .then(setDestList)
                .catch(() => setDestList([]));
        }, 300);
        return () => clearTimeout(handler);
    }, [destQuery]);

    // Efecto para ocultar las listas de sugerencias si se hace clic fuera de los inputs
    useEffect(() => {
        const onClickOutside = (e) => {
            if (originRef.current && !originRef.current.contains(e.target)) {
                setOriginList([]);
            }
            if (destRef.current && !destRef.current.contains(e.target)) {
                setDestList([]);
            }
        };
        document.addEventListener('click', onClickOutside);
        return () => document.removeEventListener('click', onClickOutside);
    }, []);

    // Desactivar fecha de llegada si es solo ida
    useEffect(() => {
        if (soloIda) {
            setEndDate('');
        }
    }, [soloIda]);

    const handleSearch = () => {
        // Validaciones del formulario
        const newErrors = {
            origin: !originSelected ? t('home.errors.origin') : '',
            dest: !destSelected ? t('home.errors.dest') : '',
            startDate: !startDate ? t('home.errors.startDate') : '',
            endDate: !soloIda && !endDate ? t('home.errors.endDate') : '',
            passengers: !passengers ? t('home.errors.passengers') : '',
        };
        setErrors(newErrors);

        if (Object.values(newErrors).some((msg) => msg)) return;

        router.get('/vuelos/resultados', {
            origen: originSelected.id,
            destino: destSelected.id,
            start_date: startDate,
            end_date: soloIda ? null : endDate,
            pasajeros: passengers,
            tipo_vuelo: soloIda ? 'oneway' : 'roundtrip',
        });
    };

    return (
        <>
            <Head title={t('home.title')} />
            <Header activePage="inicio" />

            <section
                className="seccion-principal bg-cover bg-center py-[2em]"
                style={{
                    backgroundImage: `url('${imagenes[imagenActual]}')`,
                    transition: 'background-image 1s ease-in-out',
                }}
            >
                <div className="text-center text-[2em] font-bold text-white mb-[1.5em] px-[1em] drop-shadow-lg">
                    {t('home.heading')}
                </div>


                {/* Movemos más abajo y ensanchamos el buscador */}
                <div
                    className="
            buscador-container
            mx-auto
            w-[50vw]
            max-w-[100em]
            bg-white
            p-[1.5em]
            rounded-[1em]
            shadow-lg
            flex
            flex-col
            gap-[1em]
            mt-[8em]
          "
                    itemScope
                    itemType="http://schema.org/Flight"
                >
                    <div className="flex flex-col sm:flex-row sm:gap-8">
                        {/* Checkbox Solo Ida */}
                        <div className="flex items-center gap-2 mb-2 sm:mb-0">
                            <input
                                type="checkbox"
                                checked={soloIda}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSoloIda(checked);
                                    if (checked) setIdaVuelta(false);
                                }}
                                className="w-5 h-5 accent-indigo-600"
                            />
                            <label className="text-base font-medium cursor-pointer">
                                {t('home.flightType.soloIda')}
                            </label>
                        </div>

                        {/* Checkbox Ida y Vuelta */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={idaVuelta}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setIdaVuelta(checked);
                                    if (checked) setSoloIda(false);
                                }}
                                className="w-5 h-5 accent-indigo-600"
                            />
                            <label className="text-base font-medium cursor-pointer">
                                {t('home.flightType.idaVuelta')}
                            </label>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1em]">
                        {/* Origen */}
                        <div className="relative" ref={originRef} itemProp="departureAirport" itemScope itemType="http://schema.org/Airport">
                            <input
                                placeholder={t('home.origin')}
                                value={
                                    originSelected
                                        ? `${originSelected.nombre} (${originSelected.codigo_iata})`
                                        : originQuery
                                }
                                onChange={(e) => {
                                    setOriginQuery(e.target.value);
                                    setOriginSelected(null);
                                    setErrors((prev) => ({ ...prev, origin: '' }));
                                }}
                                aria-label={t('home.originLabel')}
                                className="
                  w-full
                  p-[0.75em]
                  border
                  border-gray-300
                  rounded-[0.5em]
                  text-[1em]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
                            />
                            {originList.length > 0 && !originSelected && (
                                <ul className="dropdown">
                                    {originList.map((a) => (
                                        <li
                                            key={a.id}
                                            onClick={() => {
                                                setOriginSelected(a);
                                                setOriginQuery('');
                                                setOriginList([]);
                                                setErrors((prev) => ({ ...prev, origin: '' }));
                                            }}
                                        >
                                            {a.ciudad}, {a.pais} ({a.codigo_iata})
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {errors.origin && <div className="error-message text-[0.875em]">{errors.origin}</div>}
                            {originSelected && (
                                <>
                                    <meta itemProp="name" content={originSelected.nombre} />
                                    <meta itemProp="iataCode" content={originSelected.codigo_iata} />
                                </>
                            )}
                        </div>

                        {/* Destino */}
                        <div className="relative" ref={destRef} itemProp="arrivalAirport" itemScope itemType="http://schema.org/Airport">
                            <input
                                placeholder={t('home.destination')}
                                value={
                                    destSelected
                                        ? `${destSelected.nombre} (${destSelected.codigo_iata})`
                                        : destQuery
                                }
                                onChange={(e) => {
                                    setDestQuery(e.target.value);
                                    setDestSelected(null);
                                    setErrors((prev) => ({ ...prev, dest: '' }));
                                }}
                                aria-label={t('home.destinationLabel')}
                                className="
                  w-full
                  p-[0.75em]
                  border
                  border-gray-300
                  rounded-[0.5em]
                  text-[1em]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
                            />
                            {destList.length > 0 && !destSelected && (
                                <ul className="dropdown">
                                    {destList.map((a) => (
                                        <li
                                            key={a.id}
                                            onClick={() => {
                                                setDestSelected(a);
                                                setDestQuery('');
                                                setDestList([]);
                                                setErrors((prev) => ({ ...prev, dest: '' }));
                                            }}
                                        >
                                            {a.ciudad}, {a.pais} ({a.codigo_iata})
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {errors.dest && <div className="error-message text-[0.875em]">{errors.dest}</div>}
                            {destSelected && (
                                <>
                                    <meta itemProp="name" content={destSelected.nombre} />
                                    <meta itemProp="iataCode" content={destSelected.codigo_iata} />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1em]">
                        <div>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setErrors((prev) => ({ ...prev, startDate: '' }));
                                    if (endDate && e.target.value > endDate) setEndDate('');
                                }}
                                min={today}
                                aria-label={t('home.departureDateLabel')}
                                className="
                  w-full
                  p-[0.75em]
                  border
                  border-gray-300
                  rounded-[0.5em]
                  text-[1em]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
                            />
                            {errors.startDate && <div className="error-message text-[0.875em]">{errors.startDate}</div>}
                            {startDate && <meta itemProp="departureTime" content={startDate} />}
                        </div>
                        <div>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setErrors((prev) => ({ ...prev, endDate: '' }));
                                }}
                                min={startDate || today}
                                aria-label={t('home.returnDateLabel')}
                                disabled={soloIda}
                                className={`
                  w-full
                  p-[0.75em]
                  border
                  border-gray-300
                  rounded-[0.5em]
                  text-[1em]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                  ${soloIda ? 'bg-gray-100 cursor-not-allowed' : ''}
                `}
                            />
                            {errors.endDate && <div className="error-message text-[0.875em]">{errors.endDate}</div>}
                            {endDate && <meta itemProp="arrivalTime" content={endDate} />}
                        </div>
                        <div>
                            <input
                                type="number"
                                min="1"
                                value={passengers ?? ''}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setPassengers(v === '' ? null : parseInt(v));
                                    setErrors((prev) => ({ ...prev, passengers: '' }));
                                }}
                                placeholder={t('home.passengers')}
                                aria-label={t('home.passengersLabel')}
                                className="
                  w-full
                  p-[0.75em]
                  border
                  border-gray-300
                  rounded-[0.5em]
                  text-[1em]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
                            />
                            {errors.passengers && <div className="error-message text-[0.875em]">{errors.passengers}</div>}
                            {passengers && <meta itemProp="passengerCount" content={passengers} />}
                        </div>
                    </div>

                    <div className="text-center">
                        <PrimaryButton onClick={handleSearch} className="px-[2em] py-[0.75em] text-[1em]">
                            {t('home.search')}
                        </PrimaryButton>
                    </div>
                </div>
            </section>

            <VuelosDestacados />
        </>
    );
}
