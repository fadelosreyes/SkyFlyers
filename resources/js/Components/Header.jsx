import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import UserDropdown from '@/Components/UserDropdown';
import { useTranslation } from 'react-i18next';

const flags = {
  es: '/img/image 1.png',
  en: '/img/UK.png',
};

export default function Header({ activePage }) {
  const { auth } = usePage().props;
  const { t, i18n } = useTranslation();

  const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
  const [language, setLanguage] = useState(savedLanguage || 'es');

  const [dropdownOpen, setDropdownOpen] = useState(false); // Para selector idioma
  const [gestionDropdownOpen, setGestionDropdownOpen] = useState(false); // Para menú Gestión
  const [menuMobil, setmenuMobil] = useState(false);

  const dropdownRef = useRef(null);
  const gestionDropdownRef = useRef(null);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  // Cerrar dropdown idioma si clicas fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar dropdown gestión si clicas fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (gestionDropdownRef.current && !gestionDropdownRef.current.contains(event.target)) {
        setGestionDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setDropdownOpen(false);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const navLinks = (
    <>
      <Link
        href="/"
        className={`whitespace-nowrap font-bold ${
          activePage === 'inicio' ? 'underline underline-offset-2 decoration-[#FF7F50] decoration-2' : ''
        }`}
        onClick={() => setmenuMobil(false)}
      >
        {t('menu.home')}
      </Link>
      <Link
        href="/mis-viajes"
        className={`whitespace-nowrap font-bold ${
          activePage === 'viajes' ? 'underline underline-offset-2 decoration-[#FF7F50] decoration-2' : ''
        }`}
        onClick={() => setmenuMobil(false)}
      >
        {t('menu.myTrips')}
      </Link>
      <Link
        href="/sobre-nosotros"
        className={`whitespace-nowrap font-bold ${
          activePage === 'sobre-nosotros' ? 'underline underline-offset-2 decoration-[#FF7F50] decoration-2' : ''
        }`}
        onClick={() => setmenuMobil(false)}
      >
        {t('menu.aboutUs')}
      </Link>
      <Link
        href="/destinos"
        className={`whitespace-nowrap font-bold ${
          activePage === 'destinos' ? 'underline underline-offset-2 decoration-[#FF7F50] decoration-2' : ''
        }`}
        onClick={() => setmenuMobil(false)}
      >
        {t('menu.destinos')}
      </Link>

      {/* Menú Gestión solo para admin */}
      {auth?.user?.role_id === 1 && (
        <div className="relative" ref={gestionDropdownRef}>
          <button
            className="whitespace-nowrap font-bold cursor-pointer flex items-center gap-1"
            onClick={() => setGestionDropdownOpen(!gestionDropdownOpen)}
            aria-haspopup="true"
            aria-expanded={gestionDropdownOpen}
          >
            Gestión
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {gestionDropdownOpen && (
            <div className="absolute bg-white text-black rounded shadow-lg mt-2 right-0 w-40 z-50">
              <Link
                href="/admin/usuarios"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setmenuMobil(false)}
              >
                Usuarios
              </Link>
              <Link
                href="/admin/roles"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setmenuMobil(false)}
              >
                Roles
              </Link>
              <Link
                href="/admin/aerolineas"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setmenuMobil(false)}
              >
                Aerolineas
            </Link><Link
                href="/admin/aeropuertos"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setmenuMobil(false)}
              >
                Aeropuertos
              </Link>
              <Link
                href="/admin/billetes"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setmenuMobil(false)}
              >
                Billetes
              </Link>
              <Link
                href="/admin/asientos"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setmenuMobil(false)}
              >
                Asientos
              </Link>
              <Link
                href="/admin/vuelos"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setmenuMobil(false)}
              >
                Vuelos
              </Link>
              <Link
                href="/admin/aviones"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setmenuMobil(false)}
              >
                Aviones
              </Link>
              <Link
                href="/admin/estados"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setmenuMobil(false)}
              >
                Estados Asientos
              </Link>
              <Link
                href="/admin/paises"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setmenuMobil(false)}
              >
                Paises
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <header className="bg-[#003366] text-white px-4 py-4 flex items-center justify-between relative">
      <div className="flex items-center gap-6">
        <figure className="flex-shrink-0">
          <img
            src="/img/_12534FEB-C593-4152-9369-72787BB3F5C6_-removebg-preview 2.png"
            alt="avion"
            className="h-10 md:h-14"
          />
        </figure>

        <nav className="hidden md:flex items-center gap-8">{navLinks}</nav>
      </div>

      <div className="flex items-center gap-3 md:gap-5" ref={dropdownRef}>
        {/* Selector idioma */}
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="focus:outline-none">
          <img
            src={flags[language]}
            alt={language === 'es' ? 'España' : 'UK'}
            className="h-8 w-auto cursor-pointer"
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-4 top-16 w-32 bg-white text-black rounded shadow-lg z-50">
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
              <img src={flags['en']} alt="UK" className="h-5 w-auto" />
              English
            </button>
          </div>
        )}

        <div className="hidden md:block">
          {auth?.user ? (
            <UserDropdown user={auth.user} />
          ) : (
            <Link href="/login">
              <PrimaryButton>{t('menu.login')}</PrimaryButton>
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-white text-3xl font-bold"
          onClick={() => setmenuMobil(!menuMobil)}
          aria-label="Toggle menu"
        >
          {menuMobil ? '✕' : '☰'}
        </button>
      </div>

      {menuMobil && (
        <div className="fixed top-0 left-0 h-full w-64 bg-[#003366] text-white flex flex-col p-6 gap-6 z-50 shadow-lg">
          {/* Cerrar con botón arriba */}
          <button
            className="self-end text-3xl font-bold"
            onClick={() => setmenuMobil(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
          <nav className="flex flex-col gap-6 text-lg">{navLinks}</nav>
          <div className="mt-auto">
            {auth?.user ? (
              <UserDropdown user={auth.user} />
            ) : (
              <Link href="/login">
                <PrimaryButton className="w-full">{t('menu.login')}</PrimaryButton>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
