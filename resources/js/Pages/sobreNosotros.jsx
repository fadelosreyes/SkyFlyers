import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Header from '@/Components/Header';
import { useTranslation } from 'react-i18next';

function Acordeon({ title, children, abierto, onClick }) {
  return (
    <div className="mb-4 bg-white rounded-lg shadow">
      <button
        className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition"
        onClick={onClick}
      >
        <span className="text-lg font-medium text-gray-800 font-bold">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-600 transform transition-transform ${abierto ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`px-6 overflow-hidden transition-max-h duration-300 ${abierto ? 'max-h-screen py-4' : 'max-h-0'}`}>
        <div className="text-gray-700 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function QuienesSomos() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);
  const toggleIndex = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <>
      <Head title={t('sobreNosotros.titulo')} />
      <Header activePage="quienes-somos" />

      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-32">

          {/* Bloque 1 */}
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="lg:w-1/2 bg-white rounded-lg shadow p-8 space-y-8">
              <h1 className="text-4xl font-extrabold text-gray-800 mb-4">{t('sobreNosotros.titulo')}</h1>
              <p className="text-xl text-gray-700 leading-relaxed">{t('sobreNosotros.descripcion1')}</p>
              <p className="text-xl text-gray-700 leading-relaxed">{t('sobreNosotros.descripcion2')}</p>
            </div>
            <div className="lg:w-1/2">
              <img
                src="/img/nosotros/equipo.jpg"
                alt="Skyflyers equipo"
                className="rounded-lg shadow w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Bloque 2 */}
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="lg:w-1/2">
              <img
                src="/img/nosotros/equipaje.jpg"
                alt="Servicios Skyflyers"
                className="rounded-lg shadow w-full h-auto object-cover"
              />
            </div>
            <div className="lg:w-1/2 space-y-8">
              <Acordeon title={t('sobreNosotros.acordeon1.titulo')} abierto={openIndex === 0} onClick={() => toggleIndex(0)}>
                <p>{t('sobreNosotros.acordeon1.texto1')}</p>
                <p className="mt-2">{t('sobreNosotros.acordeon1.texto2')}</p>
                <ul className="list-disc list-inside mt-2">
                  <li>{t('sobreNosotros.acordeon1.lista1')}</li>
                  <li>{t('sobreNosotros.acordeon1.lista2')}</li>
                </ul>
              </Acordeon>

              <Acordeon title={t('sobreNosotros.acordeon2.titulo')} abierto={openIndex === 1} onClick={() => toggleIndex(1)}>
                <p>{t('sobreNosotros.acordeon2.texto1')}</p>
                <p className="mt-2">{t('sobreNosotros.acordeon2.texto2')}</p>
                <ul className="list-disc list-inside mt-2">
                  <li>{t('sobreNosotros.acordeon2.lista1')}</li>
                  <li>{t('sobreNosotros.acordeon2.lista2')}</li>
                </ul>
              </Acordeon>

              <Acordeon title={t('sobreNosotros.acordeon3.titulo')} abierto={openIndex === 2} onClick={() => toggleIndex(2)}>
                <p>{t('sobreNosotros.acordeon3.texto1')}</p>
                <p className="mt-2">{t('sobreNosotros.acordeon3.texto2')}</p>
                <ul className="list-disc list-inside mt-2">
                  <li>{t('sobreNosotros.acordeon3.lista1')}</li>
                  <li>{t('sobreNosotros.acordeon3.lista2')}</li>
                </ul>
              </Acordeon>

              <Acordeon title={t('sobreNosotros.acordeon4.titulo')} abierto={openIndex === 3} onClick={() => toggleIndex(3)}>
                <p>{t('sobreNosotros.acordeon4.texto1')}</p>
                <p className="mt-2">{t('sobreNosotros.acordeon4.texto2')}</p>
                <ul className="list-disc list-inside mt-2">
                  <li>{t('sobreNosotros.acordeon4.lista1')}</li>
                  <li>{t('sobreNosotros.acordeon4.lista2')}</li>
                  <li>{t('sobreNosotros.acordeon4.lista3')}</li>
                </ul>
              </Acordeon>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
