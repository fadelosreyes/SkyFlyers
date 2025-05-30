import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import '../../css/principal.css';
import '../../css/contacto.css';
import Header from '../Components/Header';


export default function Contacto() {
  const { auth } = usePage();

  return (
    <>
      <Head title="Contacto" />
      <Header activePage="contacto" />

      <main className="body3">
        <section>
          <img
            src="/img/azafatasç.png"
            alt="Foto representativa"
            className="foto-representativa"
          />
        </section>

        <section>
          <div className="botones-sociales">
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
    </>
  );
}
