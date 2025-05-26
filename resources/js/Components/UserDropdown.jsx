import React from 'react';
import Dropdown from '@/Components/Dropdown';
import { route } from 'ziggy-js';

export default function UserDropdown({ user }) {
    if (!user) return null;

    return (
        <div className="ml-6 flex items-center">
            <Dropdown>
                <Dropdown.Trigger>
                    <button
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        {user.name}
                        <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </Dropdown.Trigger>

                <Dropdown.Content>
                    {/* Opción Cancelaciones */}
                    <Dropdown.Link href={route('cancelaciones.index')}>
                        Reembolsos
                    </Dropdown.Link>

                    {/* Cerrar sesión */}
                    <Dropdown.Link href={route('logout')} method="post" as="button">
                        Cerrar sesión
                    </Dropdown.Link>
                </Dropdown.Content>
            </Dropdown>
        </div>
    );
}
