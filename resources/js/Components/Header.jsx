import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import UserDropdown from '@/Components/UserDropdown';

export default function Header({ activePage }) {
  const { auth } = usePage().props;

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
          Inicio
        </Link>
        <Link
          href="/mis-viajes"
          className={`whitespace-nowrap font-bold ${
            activePage === 'viajes' ? 'underline underline-offset-2 decoration-[#FF7F50] decoration-2' : ''
          }`}
        >
          Mis Viajes
        </Link>
        <Link
          href="/sobre-nosotros"
          className={`whitespace-nowrap font-bold ${
            activePage === 'sobre-nosotros' ? 'underline underline-offset-2 decoration-[#FF7F50] decoration-2' : ''
          }`}
        >
          Sobre Nosotros
        </Link>
        <Link
          href="/contacto"
          className={`whitespace-nowrap font-bold ${
            activePage === 'contacto' ? 'underline underline-offset-2 decoration-[#FF7F50] decoration-2' : ''
          }`}
        >
          Contacto
        </Link>
      </nav>

      <div className="flex items-center gap-3 flex-shrink-0">
        <img
          src="/img/image 1.png"
          alt="España"
          className="h-8 w-auto"
        />

        {auth?.user ? (
          <UserDropdown user={auth.user} />
        ) : (
          <Link href="/login">
            <PrimaryButton>Iniciar sesión</PrimaryButton>
          </Link>
        )}
      </div>
    </header>
  );
}
