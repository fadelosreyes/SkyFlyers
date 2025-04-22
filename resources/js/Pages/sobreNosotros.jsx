import React from 'react';
import { Head, Link } from '@inertiajs/react';
import '../../css/principal.css';
import '../../css/sobreNosotros.css';

export default function SobreNosotros() {
    return (
        <>
            <Head title="Sobre Nosotros" />

            <header className="encabezado">
                <figure>
                    <img src="/img/_12534FEB-C593-4152-9369-72787BB3F5C6_-removebg-preview 2.png" alt="avion" height={50} />
                </figure>

                <nav className="enlaces-navegacion">
                    <Link href="/">Inicio</Link>
                    <Link href="#">Mis Viajes</Link>
                    <Link href="/sobre-nosotros" className="active">Sobre Nosotros</Link>
                    <Link href="/contacto">Contacto</Link>
                </nav>

                <div className="idioma-sesion">
                    <img src="/img/image 1.png" alt="España" height={30} />
                    <button>Iniciar sesión</button>
                </div>
            </header>

            <main className="contenido-principal">
                {/* Sección con la foto */}
                <section>
                    <img src="/img/avion-blanco 1.png" alt="Foto representativa" className="foto-representativa" />
                </section>

                {/* Sección de servicios (Sobre Nosotros y Redes Sociales) */}
                <section className="seccion-acerca-de">
                    <div className="contenido-acerca-de">
                        <p className="texto-acerca-de">
                            En SkyFlyer, somos tu aliado experto en la gestión de billetes de avión. Desde 2005 hemos simplificado la compra de tu vuelo, comparando precios de decenas de aerolíneas y ofreciendo las mejores tarifas disponibles en tiempo real. Nuestro compromiso es ahorrarte tiempo y dinero, para que solo te preocupes por disfrutar tu viaje.
                            <br /><br />
                            Gracias a nuestra plataforma intuitiva y a un equipo dedicado de atención al cliente, podrás reservar, modificar o cancelar tu vuelo de manera rápida y segura. En SkyFlyer, tu comodidad y satisfacción están siempre en el centro de nuestro servicio, con atención personalizada y soporte 24/7 para resolver cualquier incidencia.
                        </p>
                    </div>

                    <div className="enlaces-sociales">
                        <ul className="lista-sociales">
                            <li>
                                <a href="#" className="item-social">
                                    <span>Instagram</span>
                                    <img src="/img/icons8-izquierda-2-100 1.png" alt="Icono de Instagram" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="item-social">
                                    <span>Facebook</span>
                                    <img src="/img/icons8-izquierda-2-100 1.png" alt="Icono de Facebook" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="item-social">
                                    <span>Twitter</span>
                                    <img src="/img/icons8-izquierda-2-100 1.png" alt="Icono de Twitter" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="item-social">
                                    <span>YouTube</span>
                                    <img src="/img/icons8-izquierda-2-100 1.png" alt="Icono de YouTube" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="item-social">
                                    <span>LinkedIn</span>
                                    <img src="/img/icons8-izquierda-2-100 1.png" alt="Icono de LinkedIn" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="item-social">
                                    <span>Contáctanos</span>
                                    <img src="/img/icons8-izquierda-2-100 1.png" alt="Icono de contacto" />
                                </a>
                            </li>
                        </ul>

                    </div>
                </section>
            </main>
        </>
    );
}
