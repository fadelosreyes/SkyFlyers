import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import '../../css/principal.css';
import PrimaryButton from '../Components/PrimaryButton';
import Header from '../Components/Header';


export default function Principal({ auth }) {
    const [originQuery, setOriginQuery] = useState('');
    const [destQuery, setDestQuery] = useState('');
    const [originList, setOriginList] = useState([]);
    const [destList, setDestList] = useState([]);
    const [originSelected, setOriginSelected] = useState(null);
    const [destSelected, setDestSelected] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [passengers, setPassengers] = useState(null);

    const [errors, setErrors] = useState({
        origin: '',
        dest: '',
        startDate: '',
        endDate: '',
        passengers: '',
    });

    const originRef = useRef();
    const destRef = useRef();

    // Autocompletar Origen
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

    // Autocompletar Destino
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

    // Cerrar dropdown al clicar fuera
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

    const handleSearch = () => {
        // Validación por campos
        const newErrors = {
            origin: !originSelected ? 'Selecciona un aeropuerto de origen' : '',
            dest: !destSelected ? 'Selecciona un aeropuerto de destino' : '',
            startDate: !startDate ? 'Selecciona la fecha de salida' : '',
            endDate: !endDate ? 'Selecciona la fecha de regreso' : '',
            passengers: !passengers ? 'Indica el número de pasajeros' : '',
        };
        setErrors(newErrors);

        // Si hay algún error
        if (Object.values(newErrors).some(msg => msg)) {
            return;
        }

        // Si todo OK, redirigimos
        router.get('/vuelos/resultados', {
            origen: originSelected.id,
            destino: destSelected.id,
            start_date: startDate,
            end_date: endDate,
            pasajeros: passengers,
        });
    };

    return (
        <>
            <Head title="Inicio" />
            <Header activePage="inicio" />

            <section className="seccion-principal" style={{ backgroundImage: "url('/img/image.png')" }}>
                <div className="texto-principal">Reserva tu viaje</div>

                <div className="buscador">
                    {/* Origen */}
                    <div className="autocomplete" ref={originRef}>
                        <input
                            placeholder="Origen"
                            value={originSelected ? `${originSelected.nombre} (${originSelected.codigo_iata})` : originQuery}
                            onChange={e => {
                                setOriginQuery(e.target.value);
                                setOriginSelected(null);
                                setErrors(prev => ({ ...prev, origin: '' }));
                            }}
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
                                        {a.nombre} — {a.ciudad}, {a.pais} ({a.codigo_iata})
                                    </li>
                                ))}
                            </ul>
                        )}
                        {errors.origin && <div className="error-message">{errors.origin}</div>}
                    </div>

                    {/* Destino */}
                    <div className="autocomplete" ref={destRef}>
                        <input
                            placeholder="Destino"
                            value={destSelected ? `${destSelected.nombre} (${destSelected.codigo_iata})` : destQuery}
                            onChange={e => {
                                setDestQuery(e.target.value);
                                setDestSelected(null);
                                setErrors(prev => ({ ...prev, dest: '' }));
                            }}
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
                                        {a.nombre} — {a.ciudad}, {a.pais} ({a.codigo_iata})
                                    </li>
                                ))}
                            </ul>
                        )}
                        {errors.dest && <div className="error-message">{errors.dest}</div>}
                    </div>

                    {/* Fechas */}
                    <div>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => {
                                setStartDate(e.target.value);
                                setErrors(prev => ({ ...prev, startDate: '' }));
                            }}
                        />
                        {errors.startDate && <div className="error-message">{errors.startDate}</div>}
                    </div>
                    <div>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => {
                                setEndDate(e.target.value);
                                setErrors(prev => ({ ...prev, endDate: '' }));
                            }}
                        />
                        {errors.endDate && <div className="error-message">{errors.endDate}</div>}
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
                            placeholder="Pasajeros"
                        />
                        {errors.passengers && <div className="error-message">{errors.passengers}</div>}
                    </div>

                    <PrimaryButton onClick={handleSearch}>Buscar</PrimaryButton>
                </div>
            </section>

            {/* Sección de servicios */}
            <section className="seccion-servicios">
                <div>
                    <figure><img src="img/reembolso 1.png" alt="Reembolsos y cancelaciones" /></figure>
                    <h3>Reembolsos y cancelaciones</h3>
                    <p>Consulta nuestras políticas de reembolsos y cancelaciones, y realiza los cambios que necesites de manera rápida y sencilla en cualquier momento.</p>
                    <PrimaryButton>Más información</PrimaryButton>
                </div>
                <div>
                    <figure><img src="img/pngwing.com (1) 1.png" alt="Gestión de reservas" /></figure>
                    <h3>Gestión de reservas</h3>
                    <p>La forma más rápida y sencilla de gestionar un vuelo o solicitar un reembolso es hacerlo a través de Gestionar mi reserva.</p>
                    <PrimaryButton>Gestionar mi reserva</PrimaryButton>
                </div>
                <div>
                    <figure><img src="img/pngegg (3) 1.png" alt="Otros servicios" /></figure>
                    <h3>Otros servicios</h3>
                    <p>Explora opciones de hoteles, coches, trenes y más y gestiona todos tus servicios de viaje en un solo lugar</p>
                    <PrimaryButton disabled>Explorar</PrimaryButton>
                </div>
            </section>
        </>
    );
}
