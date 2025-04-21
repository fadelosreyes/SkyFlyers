import React from 'react';
import { Head, Link } from '@inertiajs/react';
import '../../css/principal.css';
import '../../css/resultados.css';

import PrimaryButton from '../Components/PrimaryButton';

export default function Resultados({ vuelos, startDate, endDate }) {
  return (
    <>
      <Head title="Resultados de vuelos" />
      <header className="encabezado">
        <div className="text-2xl font-bold">✈️</div>
        <nav className="enlaces-navegacion">
          <Link href="/" className="nav-link">Inicio</Link>
          <Link href="/vuelos" className="nav-link">Viajes</Link>
          <Link href="#" className="nav-link">Sobre nosotros</Link>
          <Link href="#" className="nav-link">Contacto</Link>
        </nav>
        <div className="idioma-sesion">
          <span className="idioma">🇪🇸</span>
          <PrimaryButton className="btn-login">Iniciar sesión</PrimaryButton>
        </div>
      </header>

      {vuelos.length > 0 ? (
        <table className="tabla-vuelos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vuelos.map(v => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{new Date(v.fecha_salida).toLocaleString()}</td>
                <td>{v.aeropuerto_origen?.nombre} ({v.aeropuerto_origen?.codigo_iata})</td>
                <td>{v.aeropuerto_destino?.nombre} ({v.aeropuerto_destino?.codigo_iata})</td>
                <td>
                  <Link href={`/vuelos/reservar/${v.id}`} className="btn-reservar">
                    <PrimaryButton className="btn-primary">Reservar</PrimaryButton>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-vuelos">No se encontraron vuelos para los criterios seleccionados.</p>
      )}

      <div className="volver-btn">
        <Link href="/" className="volver-link">
          <PrimaryButton className="btn-primary">Volver</PrimaryButton>
        </Link>
      </div>
    </>
  );
}
