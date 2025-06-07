// resources/js/Pages/QuienesSomos.jsx
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/Components/Header';

function AccordionItem({ title, children }) {
const [open, setOpen] = useState(false);
return (
<div className="mb-4 bg-white rounded-lg shadow">
    <button className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition"
        onClick={()=> setOpen(!open)}
        >
        <span className="text-lg font-medium text-gray-800 font-bold">{title}</span>
        <svg className={`w-5 h-5 text-gray-600 transform transition-transform ${open ? 'rotate-180' : '' }`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    </button>
    <div className={`px-6 overflow-hidden transition-max-h duration-300 ${ open ? 'max-h-screen py-4' : 'max-h-0' }`}>
        <p className="text-gray-700 leading-relaxed">{children}</p>
    </div>
</div>
);
}

export default function QuienesSomos() {
return (
<>

    <Head title="Quiénes somos" />
    <Header activePage="quienes-somos" />

    <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-12">
                <span className="font-bold">Quiénes somos</span>
            </h1>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Columna izquierda: texto dividido */}
                <div className="lg:w-1/2 bg-white rounded-lg shadow p-8 space-y-8">

                    {/* Sección: ¿Quiénes somos? */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            ¿Quiénes somos?
                        </h2>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            <strong>Skyflyers</strong> es una de las <strong>principales marcas de viajes
                                online</strong> con sede en Barcelona, fundada en <strong>1999</strong>. Desde entonces
                            hemos revolucionado el sector de las reservas de viajes, usando <strong>tecnología de
                                vanguardia</strong> para que viajar sea más cómodo y económico en<span
                                className="font-semibold"> 44 países</span>, desde España y Reino Unido hasta Estados
                            Unidos.
                        </p>
                    </section>

                    {/* Sección: Nuestros servicios como agencia de viajes */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Nuestros servicios como agencia de viajes
                        </h2>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            Gracias a nuestro <strong>motor de búsqueda online</strong> puedes combinar vuelos
                            <strong>low-cost</strong> y <strong>tradicionales</strong> para encontrar las mejores rutas
                            y precios. Además, ofrecemos:
                        </p>
                        <ul className="list-disc list-inside text-xl text-gray-700 leading-relaxed space-y-2 mt-4">
                            <li><strong>Seguros de viaje</strong> adaptados a tus necesidades.</li>
                            <li><strong>Alquiler de coches</strong> en el destino.</li>
                            <li><strong>Alojamiento</strong> en más de 2,1 millones de hoteles.</li>
                            <li><strong>Paquetes vuelo + hotel</strong> personalizados.</li>
                            <li>Asistencia <strong>24/7</strong> vía app y línea de Atención al Cliente.</li>
                        </ul>
                    </section>
                </div>

                {/* Columna derecha: acordeón */}
                <div className="lg:w-1/2">

                    <AccordionItem title="Cancelación Vuelos">
                        <p>
                            Los vuelos se pueden cancelar siempre y cuando tengas la <strong>cancelación
                                flexible</strong>
                            y lo hagas con <strong>más de 3 días de antelación</strong> a la fecha de salida.
                        </p>
                        <p className="mt-2">
                            En caso contrario, se aplicarán las tarifas estándar de cancelación.
                        </p>
                    </AccordionItem>

                    <AccordionItem title="Cambios Vuelos">
                        <p>
                            El cambio de asiento está permitido siempre y cuando <strong>haya sitio disponible</strong>
                            en la clase original de tu billete.
                        </p>
                        <p className="mt-2">
                            Si no hay plazas libres, podrás optar a un cambio de clase (con diferencias de tarifa).
                        </p>
                    </AccordionItem>

                    <AccordionItem title="Equipaje">
                        <p>
                            Detalles de franquicia de equipaje, requisitos de peso y medidas
                            para llevar tu equipaje sin problemas.
                        </p>
                    </AccordionItem>

                    <AccordionItem title="Hoteles">
                        <p>
                            Las reservas de hotel se gestionan a través de <strong>Booking.com </strong>
                            usando parámetros en la URL, sin necesidad de integrar su API directamente.
                        </p>
                        <ul className="list-disc list-inside mt-2 text-gray-700 leading-relaxed">
                            <li>
                                Incluimos tu <strong>ID de afiliado</strong> y preferencias de búsqueda
                                (fecha, ubicación, nº de huéspedes) en la URL.
                            </li>
                            <li>
                                Al hacer clic, se abre Booking.com con todos los filtros preestablecidos.
                            </li>
                            <li>
                                El pago y la cancelación se manejan en la misma plataforma de Booking.com.
                            </li>
                        </ul>
                    </AccordionItem>
                </div>

            </div>
        </div>
    </div>
</>
);
}
