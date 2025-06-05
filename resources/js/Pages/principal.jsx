import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import '../../css/principal.css';
import PrimaryButton from '../Components/PrimaryButton';
import Header from '../Components/Header';
import VuelosDestacados from '../Components/VuelosDestacados';
import { useTranslation } from 'react-i18next';

export default function Principal({ auth }) {
    const { t } = useTranslation();

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

    const originRef = useRef();
    const destRef = useRef();
    const today = new Date().toISOString().split('T')[0];
    const imagenes = ['/img/image.png', '/img/index2.png'];
    const [imagenActual, setImagenActual] = useState(0);

    useEffect(() => {
        const intervalo = setInterval(() => {
            setImagenActual((prev) => (prev + 1) % imagenes.length);
        }, 30000);
        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (originQuery.length < 2) {
                setOriginList([]);
                return;
            }
            fetch(`/aeropuertos?q=${encodeURIComponent(originQuery)}`, {
                headers: { Accept: 'application/json' },
            })
                .then(res => res.json())
                .then(setOriginList)
                .catch(() => setOriginList([]));
        }, 300);
        return () => clearTimeout(handler);
    }, [originQuery]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (destQuery.length < 2) {
                setDestList([]);
                return;
            }
            fetch(`/aeropuertos?q=${encodeURIComponent(destQuery)}`, {
                headers: { Accept: 'application/json' },
            })
                .then(res => res.json())
                .then(setDestList)
                .catch(() => setDestList([]));
        }, 300);
        return () => clearTimeout(handler);
    }, [destQuery]);

    useEffect(() => {
        const onClickOutside = e => {
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
        const newErrors = {
            origin: !originSelected ? t('home.errors.origin') : '',
            dest: !destSelected ? t('home.errors.dest') : '',
            startDate: !startDate ? t('home.errors.startDate') : '',
            endDate: !soloIda && !endDate ? t('home.errors.endDate') : '',
            passengers: !passengers ? t('home.errors.passengers') : '',
        };
        setErrors(newErrors);

        if (Object.values(newErrors).some(msg => msg)) return;

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
                className="seccion-principal"
                style={{
                    backgroundImage: `url('${imagenes[imagenActual]}')`,
                    transition: 'background-image 1s ease-in-out',
                }}
            >
                <div className="texto-principal">{t('home.heading')}</div>

                <div className="buscador" itemScope itemType="http://schema.org/Flight">

                    <div style={{ display: 'flex', flexDirection: 'column', width: '10em' }}>
                        {/* Solo Ida */}
                        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{t('home.flightType.soloIda')}</span>
                            <input
                                type="checkbox"
                                checked={soloIda}
                                onChange={e => {
                                    const checked = e.target.checked;
                                    setSoloIda(checked);
                                    if (checked) setIdaVuelta(false);
                                }}
                            />
                        </div>
                        {/* Ida y vuelta */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{t('home.flightType.idaVuelta')}</span>
                            <input
                                type="checkbox"
                                checked={idaVuelta}
                                onChange={e => {
                                    const checked = e.target.checked;
                                    setIdaVuelta(checked);
                                    if (checked) setSoloIda(false);
                                }}
                            />
                        </div>
                    </div>

                    {/* Origen */}
                    <div className="autocompletar" ref={originRef} itemProp="departureAirport" itemScope itemType="http://schema.org/Airport">
                        <input
                            placeholder={t('home.origin')}
                            value={originSelected ? `${originSelected.nombre} (${originSelected.codigo_iata})` : originQuery}
                            onChange={e => {
                                setOriginQuery(e.target.value);
                                setOriginSelected(null);
                                setErrors(prev => ({ ...prev, origin: '' }));
                            }}
                            aria-label={t('home.originLabel')}
                        />
                        {originList.length > 0 && !originSelected && (
                            <ul className="dropdown">
                                {originList.map(a => (
                                    <li key={a.id} onClick={() => {
                                        setOriginSelected(a);
                                        setOriginQuery('');
                                        setOriginList([]);
                                        setErrors(prev => ({ ...prev, origin: '' }));
                                    }}>
                                        {a.ciudad}, {a.pais} ({a.codigo_iata})
                                    </li>
                                ))}
                            </ul>
                        )}
                        {errors.origin && <div className="error-message">{errors.origin}</div>}
                        {originSelected && (
                            <>
                                <meta itemProp="name" content={originSelected.nombre} />
                                <meta itemProp="iataCode" content={originSelected.codigo_iata} />
                            </>
                        )}
                    </div>

                    {/* Destino */}
                    <div className="autocompletar" ref={destRef} itemProp="arrivalAirport" itemScope itemType="http://schema.org/Airport">
                        <input
                            placeholder={t('home.destination')}
                            value={destSelected ? `${destSelected.nombre} (${destSelected.codigo_iata})` : destQuery}
                            onChange={e => {
                                setDestQuery(e.target.value);
                                setDestSelected(null);
                                setErrors(prev => ({ ...prev, dest: '' }));
                            }}
                            aria-label={t('home.destinationLabel')}
                        />
                        {destList.length > 0 && !destSelected && (
                            <ul className="dropdown">
                                {destList.map(a => (
                                    <li key={a.id} onClick={() => {
                                        setDestSelected(a);
                                        setDestQuery('');
                                        setDestList([]);
                                        setErrors(prev => ({ ...prev, dest: '' }));
                                    }}>
                                        {a.ciudad}, {a.pais} ({a.codigo_iata})
                                    </li>
                                ))}
                            </ul>
                        )}
                        {errors.dest && <div className="error-message">{errors.dest}</div>}
                        {destSelected && (
                            <>
                                <meta itemProp="name" content={destSelected.nombre} />
                                <meta itemProp="iataCode" content={destSelected.codigo_iata} />
                            </>
                        )}
                    </div>

                    {/* Fechas */}
                    <div className="dates-group" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => {
                                    setStartDate(e.target.value);
                                    setErrors(prev => ({ ...prev, startDate: '' }));
                                    if (endDate && e.target.value > endDate) setEndDate('');
                                }}
                                min={today}
                                aria-label={t('home.departureDateLabel')}
                            />
                            {errors.startDate && <div className="error-message">{errors.startDate}</div>}
                            {startDate && <meta itemProp="departureTime" content={startDate} />}
                        </div>
                        <div>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => {
                                    setEndDate(e.target.value);
                                    setErrors(prev => ({ ...prev, endDate: '' }));
                                }}
                                min={startDate || today}
                                aria-label={t('home.returnDateLabel')}
                                disabled={soloIda}
                            />
                            {errors.endDate && <div className="error-message">{errors.endDate}</div>}
                            {endDate && <meta itemProp="arrivalTime" content={endDate} />}
                        </div>
                    </div>

                    {/* Pasajeros */}
                    <div>
                        <input
                            type="number"
                            min="1"
                            value={passengers ?? ''}
                            onChange={e => {
                                const v = e.target.value;
                                setPassengers(v === '' ? null : parseInt(v));
                                setErrors(prev => ({ ...prev, passengers: '' }));
                            }}
                            placeholder={t('home.passengers')}
                            aria-label={t('home.passengersLabel')}
                        />
                        {errors.passengers && <div className="error-message">{errors.passengers}</div>}
                        {passengers && <meta itemProp="passengerCount" content={passengers} />}
                    </div>

                    <PrimaryButton onClick={handleSearch}>{t('home.search')}</PrimaryButton>
                </div>
            </section>

            <VuelosDestacados />
        </>
    );
}
