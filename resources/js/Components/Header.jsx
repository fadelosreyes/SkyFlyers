import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import UserDropdown from '@/Components/UserDropdown';
import { useTranslation } from 'react-i18next';

const flags = {
  es: '/img/image 1.png',       // bandera de España
  en: '/img/UK.png',            // bandera de Reino Unido
};

export default function Header({ activePage }) {
  const { auth } = usePage().props;
  const { t, i18n } = useTranslation();

  // Leer idioma guardado en localStorage o usar 'es' por defecto
  const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
  const [language, setLanguage] = useState(savedLanguage || 'es');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Al montar, cambiar idioma a la preferencia guardada o por defecto
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  // Cerrar dropdown si haces click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setDropdownOpen(false);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang); // Guardar preferencia
  };

  return (
    <header className="bg-[#003366] text-white px-6 py-4 flex items-center gap-4 md:gap-8">
      <figure className="flex-shrink-0">
        <img
          src="/img/_12534FEB-C593-4152-9369-72787BB3F5C6_-removebg-preview 2.png"
          alt="avion"
          className="h-12 md:h-14"
        />
      </figure>

      <nav className="flex-grow flex space-x-6 md:space-x-12 overflow-x-auto no-scrollbar">
        <Link
          href="/"
          className={`whitespace-nowrap font-bold ${
            activePage === 'inicio' ? 'underline underline-offset-2 decoration-[#FF7F50] decoration-2' : ''
          }`}
        >
          {t('menu.home')}
        </Link>
        <Link
          href="/mis-viajes"
          className={`whitespace-nowrap font-bold ${
            activePage === 'viajes' ? 'underline underline-offset-2 decoration-[#FF7F50] decoration-2' : ''
          }`}
        >
          {t('menu.myTrips')}
        </Link>
        <Link
          href="/sobre-nosotros"
          className={`whitespace-nowrap font-bold ${
            activePage === 'sobre-nosotros' ? 'underline underline-offset-2 decoration-[#FF7F50] decoration-2' : ''
          }`}
        >
          {t('menu.aboutUs')}
        </Link>
        <Link
          href="/contacto"
          className={`whitespace-nowrap font-bold ${
            activePage === 'contacto' ? 'underline underline-offset-2 decoration-[#FF7F50] decoration-2' : ''
          }`}
        >
          {t('menu.contact')}
        </Link>
      </nav>

      <div className="flex items-center gap-3 flex-shrink-0 relative" ref={dropdownRef}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="focus:outline-none">
          <img
            src={flags[language]}
            alt={language === 'es' ? 'España' : 'Reino Unido'}
            className="h-8 w-auto cursor-pointer"
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded shadow-lg z-50">
            <button
              onClick={() => changeLanguage('es')}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 w-full text-left"
            >
              <img src={flags['es']} alt="España" className="h-5 w-auto" />
              Español
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 w-full text-left"
            >
              <img src={flags['en']} alt="Reino Unido" className="h-5 w-auto" />
              English
            </button>
          </div>
        )}

        {auth?.user ? (
          <UserDropdown user={auth.user} />
        ) : (
          <Link href="/login">
            <PrimaryButton>{t('menu.login')}</PrimaryButton>
          </Link>
        )}
      </div>
    </header>
  );
}
