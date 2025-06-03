import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import '../../css/principal.css';
import '../../css/sobreNosotros.css';
import Header from '../Components/Header';

export default function SobreNosotros() {
  const { auth } = usePage();
  const { t } = useTranslation();

  return (
    <>
      <Head title={t('aboutUs.title')} />

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
              {t('aboutUs.description')}
            </p>
          </div>

          <div className="enlaces-sociales">
            <ul className="lista-sociales">
              {t('aboutUs.socials', { returnObjects: true }).map((item) => (
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
