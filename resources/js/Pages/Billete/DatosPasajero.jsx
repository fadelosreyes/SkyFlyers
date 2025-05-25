import React from 'react';
import { useForm } from '@inertiajs/react';
import Header from '../../Components/Header';
import { route } from 'ziggy-js';

export default function DatosPasajero({ vuelo, asientosSeleccionados, totalBase }) {
  // Inicializamos el formulario con pasajeros; no ponemos total aquí,
  // porque lo calcularemos justo antes de enviar.
  const { data, setData, post, processing, errors } = useForm({
    pasajeros: asientosSeleccionados.map(a => ({
      nombre_pasajero: '',
      documento_identidad: '',
      maleta_adicional: false,
      cancelacion_flexible: false,
      asiento_id: a.id,
    })),
  });

  function handleInputChange(i, field, val) {
    const arr = [...data.pasajeros];
    arr[i][field] = val;
    setData('pasajeros', arr);
  }

  function calcularPrecioPasajero(i) {
    let p = parseFloat(asientosSeleccionados[i].precio_base);
    if (data.pasajeros[i].maleta_adicional)     p += 20;
    if (data.pasajeros[i].cancelacion_flexible) p += 15;
    return p;
  }

  function calcularPrecioTotal() {
    // Partimos del precio base total (sin recargos) que vino del servidor...
    // o bien sumamos directamente pasajero a pasajero:
    return data.pasajeros.reduce((sum, _, i) => sum + calcularPrecioPasajero(i), 0);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const totalConRecargos = calcularPrecioTotal();

    // Enviamos pasajeros y total al backend
    post(route('billetes.preparar_pago'), {
      ...data,
      total: totalConRecargos,
    });
  }

  return (
    <>
      <Header activePage="#" />

      <form onSubmit={handleSubmit} className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Datos de los pasajeros</h2>

        <p className="text-lg mb-4">
          <strong>Precio base total:</strong> {totalBase.toFixed(2)} €
        </p>

        {data.pasajeros.map((pas, i) => (
          <div key={pas.asiento_id} className="border p-4 mb-6 rounded shadow-sm">
            <h3 className="text-lg font-semibold mb-2">
              Pasajero {i + 1} – Asiento {asientosSeleccionados[i].numero}
            </h3>

            <label className="block mb-1">Nombre completo</label>
            <input
              type="text"
              value={pas.nombre_pasajero}
              onChange={e => handleInputChange(i, 'nombre_pasajero', e.target.value)}
              className="w-full p-2 border mb-3"
            />
            {errors[`pasajeros.${i}.nombre_pasajero`] && (
              <div className="text-red-600 text-sm">
                {errors[`pasajeros.${i}.nombre_pasajero`]}
              </div>
            )}

            <label className="block mb-1">DNI / Pasaporte</label>
            <input
              type="text"
              value={pas.documento_identidad}
              onChange={e => handleInputChange(i, 'documento_identidad', e.target.value)}
              className="w-full p-2 border mb-3"
            />
            {errors[`pasajeros.${i}.documento_identidad`] && (
              <div className="text-red-600 text-sm">
                {errors[`pasajeros.${i}.documento_identidad`]}
              </div>
            )}

            <label className="block mb-1">
              <input
                type="checkbox"
                checked={pas.maleta_adicional}
                onChange={e => handleInputChange(i, 'maleta_adicional', e.target.checked)}
              />{' '}
              Maleta adicional (+20 €)
            </label>

            <label className="block mt-1">
              <input
                type="checkbox"
                checked={pas.cancelacion_flexible}
                onChange={e => handleInputChange(i, 'cancelacion_flexible', e.target.checked)}
              />{' '}
              Cancelación flexible (+15 €)
            </label>

            <p className="mt-3 font-semibold">
              Precio pasajero: {calcularPrecioPasajero(i).toFixed(2)} €
            </p>
          </div>
        ))}

        <p className="text-xl font-bold mb-4">
          <strong>Precio total con recargos:</strong> {calcularPrecioTotal().toFixed(2)} €
        </p>

        <button
          type="submit"
          disabled={processing}
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          Continuar al pago
        </button>
      </form>
    </>
  );
}
