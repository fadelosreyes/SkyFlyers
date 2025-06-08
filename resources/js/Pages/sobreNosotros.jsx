import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/Components/Header';

function AccordionItem({ title, children, isOpen, onClick }) {
  return (
    <div className="mb-4 bg-white rounded-lg shadow">
      <button
        className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition"
        onClick={onClick}
      >
        <span className="text-lg font-medium text-gray-800 font-bold">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-600 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`px-6 overflow-hidden transition-max-h duration-300 ${
          isOpen ? 'max-h-screen py-4' : 'max-h-0'
        }`}
      >
        <div className="text-gray-700 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function QuienesSomos() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggleIndex = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <>
      <Head title="Quiénes somos" />
      <Header activePage="quienes-somos" />

      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-32"> {/* Más separación vertical */}

          {/* Bloque 1: texto a la izquierda, imagen a la derecha */}
          <div className="flex flex-col lg:flex-row gap-12 items-start"> {/* Más gap horizontal */}
            <div className="lg:w-1/2 bg-white rounded-lg shadow p-8 space-y-8">
              <h1 className="text-4xl font-extrabold text-gray-800 mb-4">¿Quiénes somos?</h1>
              <p className="text-xl text-gray-700 leading-relaxed">
                <strong>Skyflyers</strong> es una de las <strong>principales marcas de viajes online</strong> con sede en Barcelona, fundada en <strong>1999</strong>. Desde entonces hemos revolucionado el sector de las reservas de viajes, usando <strong>tecnología de vanguardia</strong> para que viajar sea más cómodo y económico en <span className="font-semibold">44 países</span>.
              </p>
              <p className="text-xl text-gray-700 leading-relaxed">
                Desde España y Reino Unido hasta Estados Unidos, ayudamos a millones a volar mejor.
              </p>
            </div>
            <div className="lg:w-1/2">
              <img
                src="/img/nosotros/equipo.jpg"
                alt="Skyflyers equipo"
                className="rounded-lg shadow w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Bloque 2: imagen a la izquierda, acordeón a la derecha */}
          <div className="flex flex-col lg:flex-row gap-12 items-start"> {/* Más gap horizontal */}
            <div className="lg:w-1/2">
              <img
                src="/img/nosotros/equipaje.jpg"
                alt="Servicios Skyflyers"
                className="rounded-lg shadow w-full h-auto object-cover"
              />
            </div>
            <div className="lg:w-1/2 space-y-8"> {/* Más separación entre AccordionItem */}

              <AccordionItem
                title="Cancelación de Vuelos"
                isOpen={openIndex === 0}
                onClick={() => toggleIndex(0)}
              >
                <p>
                  Con nuestra <strong>cancelación flexible</strong>, puedes anular tu vuelo sin cargos adicionales hasta <strong>3 días antes</strong> de la salida programada.
                </p>
                <p className="mt-2">
                  Si necesitas cancelar con menos de 3 días de antelación, aplicamos unas tarifas reducidas y te ofrecemos la opción de obtener un <strong>crédito de viaje</strong> válido por 12 meses para que replanifiques sin perder tu inversión.
                </p>
                <ul className="list-disc list-inside mt-2">
                  <li>Proceso 100% online: gestiona tu cancelación desde tu cuenta.</li>
                  <li>Atención personalizada: nuestro equipo te asesorará en cada paso.</li>
                </ul>
              </AccordionItem>

              <AccordionItem
                title="Cambios de Vuelos"
                isOpen={openIndex === 1}
                onClick={() => toggleIndex(1)}
              >
                <p>
                  ¿Necesitas cambiar de fecha u hora? Con Skyflyers puedes modificar tu billete sin complicaciones siempre que haya plazas disponibles en la misma clase.
                </p>
                <p className="mt-2">
                  Si no hay espacio en tu clase original, te ofrecemos opciones de <strong>upgrade</strong> con diferencias de tarifa mínimas o alternativas de rutas que se ajusten a tu presupuesto.
                </p>
                <ul className="list-disc list-inside mt-2">
                  <li>Cambios hasta 24 h antes de la salida.</li>
                  <li>Sin sorpresas: verás la diferencia de precio antes de confirmar.</li>
                </ul>
              </AccordionItem>

              <AccordionItem
                title="Equipaje"
                isOpen={openIndex === 2}
                onClick={() => toggleIndex(2)}
              >
                <p>
                  Cada aerolínea tiene sus propias normas de peso y medidas, pero en Skyflyers te lo ponemos fácil: consulta toda la información en un solo clic.
                </p>
                <p className="mt-2">
                  Ofrecemos paquetes de equipaje extra al mejor precio, desde maleta adicional hasta prioridad de embarque, con descuentos exclusivos por ser cliente Skyflyers.
                </p>
                <ul className="list-disc list-inside mt-2">
                  <li>Maleta de mano y facturada con hasta 30 kg.</li>
                  <li>Seguro por pérdida o retraso de equipaje incluido.</li>
                </ul>
              </AccordionItem>

              <AccordionItem
                title="Hoteles"
                isOpen={openIndex === 3}
                onClick={() => toggleIndex(3)}
              >
                <p>
                  Reserva tu alojamiento al mejor precio gracias a nuestra alianza con <strong>Booking.com</strong>. Te mostramos ofertas exclusivas y habitaciones con cancelación gratuita.
                </p>
                <p className="mt-2">
                  Personaliza tu búsqueda por precio, ubicación y servicios, y accede directamente al pago seguro en la plataforma de Booking. ¡Todo de forma transparente!
                </p>
                <ul className="list-disc list-inside mt-2">
                  <li>Más de 2,1 millones de hoteles en todo el mundo.</li>
                  <li>Opiniones reales de otros viajeros.</li>
                  <li>Atención 24/7 si necesitas ayuda con tu reserva.</li>
                </ul>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
