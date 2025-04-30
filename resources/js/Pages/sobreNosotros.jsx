import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import '../../css/principal.css';
import '../../css/sobreNosotros.css';
import Header from '../Components/Header';


export default function SobreNosotros() {
  const { auth } = usePage();

  return (
    <>
      <Head title="Sobre Nosotros" />

      <Header activePage="sobre-nosotros" />

      <main className="contenido-principal">
        {/* Sección con la foto */}
        <section>
          <img
            src="/img/avion-blanco 1.png"
            alt="Foto representativa"
            className="foto-representativa"
          />
        </section>

        {/* Sección de servicios (Sobre Nosotros y Redes Sociales) */}
        <section className="seccion-acerca-de">
          <div className="contenido-acerca-de">
            <p className="texto-acerca-de">
              En SkyFlyer, somos tu aliado experto en la gestión de billetes de
              avión. Desde 2005 hemos simplificado la compra de tu vuelo,
              comparando precios de decenas de aerolíneas y ofreciendo las mejores
              tarifas disponibles en tiempo real. Nuestro compromiso es ahorrarte
              tiempo y dinero, para que solo te preocupes por disfrutar tu viaje.
              <br />
              <br />
              Gracias a nuestra plataforma intuitiva y a un equipo dedicado de
              atención al cliente, podrás reservar, modificar o cancelar tu vuelo
              de manera rápida y segura. En SkyFlyer, tu comodidad y satisfacción
              están siempre en el centro de nuestro servicio, con atención
              personalizada y soporte 24/7 para resolver cualquier incidencia.
            </p>
          </div>

          <div className="enlaces-sociales">
            <ul className="lista-sociales">
              {['Instagram','Facebook','Twitter','YouTube','LinkedIn','Contáctanos'].map((item) => (
                <li key={item}>
                  <a href="#" className="item-social">
                    <span>{item}</span>
                    <img
                      src="/img/icons8-izquierda-2-100 1.png"
                      alt={`Icono de ${item}`}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
