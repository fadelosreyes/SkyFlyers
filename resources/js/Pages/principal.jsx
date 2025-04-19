import React from 'react';
import { Head, Link } from '@inertiajs/react';
import '../../css/principal.css';

export default function Principal() {
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
                    <button>Iniciar sesión</button>
                </div>
            </header>

            <section className="seccion-principal" style={{ backgroundImage: "url('/images/hero.jpg')" }}>
                <div className="texto-principal">
                    Reserva tu viaje
                </div>
                <div className="buscador">
                    <input placeholder="Origen" />
                    <input placeholder="Destino" />
                    <input type="date" />
                    <input type="date" />
                    <button>Buscar</button>
                </div>
            </section>

            <section className="seccion-servicios">
                <div>
                    <div className="text-4xl mb-2">💲</div>
                    <h3>Reembolsos y cancelaciones</h3>
                    <p>Consulta nuestras políticas y realiza cambios al instante</p>
                    <button>Más información</button>
                </div>
                <div>
                    <div className="text-4xl mb-2">📅</div>
                    <h3>Gestión de reservas</h3>
                    <p>Gestiona tus vuelos o solicita reembolsos fácilmente</p>
                    <button>Gestionar mi reserva</button>
                </div>
                <div>
                    <div className="text-4xl mb-2">🏨✈️</div>
                    <h3>Otros servicios</h3>
                    <p>Explora hoteles, coches, trenes y más en un solo lugar</p>
                    <button>Explorar</button>
                </div>
            </section>
        </>
    );
}
