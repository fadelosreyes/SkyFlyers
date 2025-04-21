import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import '../../css/principal.css';
import PrimaryButton from '../Components/PrimaryButton';

export default function Principal() {
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [originList, setOriginList] = useState([]);
  const [destList, setDestList] = useState([]);
  const [originSelected, setOriginSelected] = useState(null);
  const [destSelected, setDestSelected] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);

  const originRef = useRef();
  const destRef = useRef();

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

  const handleSearch = () => {
    if (!originSelected || !destSelected || !startDate || !endDate) {
      setError('Por favor completa todos los campos');
      return;
    }

    setError(null);

    router.get('/vuelos/resultados', {
      origen: originSelected.id,
      destino: destSelected.id,
      start_date: startDate,
      end_date: endDate,
    });
  };

  return (
    <>
      <Head title="Inicio" />
      <header className="encabezado">
        <div className="text-2xl font-bold">✈️</div>
        <nav className="enlaces-navegacion">
          <Link href="/">Inicio</Link>
          <Link href="/vuelos">Viajes</Link>
          <Link href="#">Sobre nosotros</Link>
          <Link href="#">Contacto</Link>
        </nav>
        <div className="idioma-sesion">
            <span>🇪🇸</span>
            <Link href="/login">
                <PrimaryButton>
                    Iniciar sesión
                </PrimaryButton>
            </Link>
        </div>
      </header>

      <section className="seccion-principal" style={{ backgroundImage: "url('/images/hero.jpg')" }}>
        <div className="texto-principal">Reserva tu viaje</div>
        <div className="buscador">
          <div className="autocomplete" ref={originRef}>
            <input
              placeholder="Origen"
              value={originSelected ? `${originSelected.nombre} (${originSelected.codigo_iata})` : originQuery}
              onChange={e => {
                setOriginQuery(e.target.value);
                setOriginSelected(null);
              }}
            />
            {originList.length > 0 && !originSelected && (
              <ul className="dropdown">
                {originList.map(a => (
                  <li key={a.id} onClick={() => {
                    setOriginSelected(a);
                    setOriginQuery('');
                    setOriginList([]);
                  }}>
                    {a.nombre} — {a.ciudad}, {a.pais} ({a.codigo_iata})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="autocomplete" ref={destRef}>
            <input
              placeholder="Destino"
              value={destSelected ? `${destSelected.nombre} (${destSelected.codigo_iata})` : destQuery}
              onChange={e => {
                setDestQuery(e.target.value);
                setDestSelected(null);
              }}
            />
            {destList.length > 0 && !destSelected && (
              <ul className="dropdown">
                {destList.map(a => (
                  <li key={a.id} onClick={() => {
                    setDestSelected(a);
                    setDestQuery('');
                    setDestList([]);
                  }}>
                    {a.nombre} — {a.ciudad}, {a.pais} ({a.codigo_iata})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />

          <PrimaryButton onClick={handleSearch}>Buscar</PrimaryButton>
        </div>
      </section>

      {/* Sección de servicios */}
      <section className="seccion-servicios">
        <div>
          <div className="text-4xl mb-2">💲</div>
          <h3>Reembolsos y cancelaciones</h3>
          <p>Consulta nuestras políticas y realiza cambios al instante</p>
          <PrimaryButton>Más información</PrimaryButton>
        </div>
        <div>
          <div className="text-4xl mb-2">📅</div>
          <h3>Gestión de reservas</h3>
          <p>Gestiona tus vuelos o solicita reembolsos fácilmente</p>
          <PrimaryButton>Gestionar mi reserva</PrimaryButton>
        </div>
        <div>
          <div className="text-4xl mb-2">🏨✈️</div>
          <h3>Otros servicios</h3>
          <p>Explora hoteles, coches, trenes y más en un solo lugar</p>
          <PrimaryButton>Explorar</PrimaryButton>
        </div>
      </section>
    </>
  );
}
