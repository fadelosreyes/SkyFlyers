import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import '../../css/principal.css';
import '../../css/contacto.css';

export default function Contacto() {
  return (
    <div>
      <header className="encabezado">
        <figure>
          <img src="/img/_12534FEB-C593-4152-9369-72787BB3F5C6_-removebg-preview 2.png" alt="avion" height={50} />
        </figure>
        <nav className="enlaces-navegacion">
          <Link href="/">Inicio</Link>
          <Link href="#">Mis Viajes</Link>
          <Link href="/sobre-nosotros">Sobre Nosotros</Link>
          <Link href="/contacto"  className="active">Contacto</Link>
        </nav>
        <div className="idioma-sesion">
          <img src="/img/image 1.png" alt="España" height={30} />
          <button>Iniciar sesión</button>
        </div>
      </header>

      <main className="body3">
            <section>
                <img src="/img/azafatasç.png" alt="Foto representativa" className="foto-representativa" />
            </section>

        <section>
          <div className="social-buttons">
            <button type="button" className="botones_rrss">
              <img src="/img/instagram-new 1.png" alt="Instagram" />
            </button>
            <button type="button" className="botones_rrss">
              <img src="/img/twitter.png" alt="Twitter" />
            </button>
            <button type="button" className="botones_rrss">
              <img src="/img/facebook.png" alt="Facebook" />
            </button>
            <button type="button" className="botones_rrss">
              <img src="/img/youtube.png" alt="YouTube" />
            </button>
            <button type="button" className="botones_rrss">
              <img src="/img/linkedin.png" alt="LinkedIn" />
            </button>
            <button type="button" className="botones_rrss">
              <img src="/img/correo.png" alt="Correo" />
            </button>
          </div>

          <input type="checkbox" id="btn-menu" />
        </section>
      </main>
    </div>
  );
}
