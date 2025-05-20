import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import UserDropdown from '@/Components/UserDropdown';

export default function Header({ activePage }) {
  const { auth } = usePage().props;

  return (
    <header className="encabezado">
      <figure>
        <img
          src="/img/_12534FEB-C593-4152-9369-72787BB3F5C6_-removebg-preview 2.png"
          alt="avion"
          height={50}
        />
      </figure>

      <nav className="enlaces-navegacion">
        <Link href="/" className={activePage === 'inicio' ? 'active' : ''}>
          Inicio
        </Link>
        <Link href="#" className={activePage === 'viajes' ? 'active' : ''}>
          Mis Viajes
        </Link>
        <Link
          href="/sobre-nosotros"
          className={activePage === 'sobre-nosotros' ? 'active' : ''}
        >
          Sobre Nosotros
        </Link>
        <Link
          href="/contacto"
          className={activePage === 'contacto' ? 'active' : ''}
        >
          Contacto
        </Link>
      </nav>

      <div className="idioma-sesion flex items-center gap-4">
        <img src="/img/image 1.png" alt="España" height={30} />

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

