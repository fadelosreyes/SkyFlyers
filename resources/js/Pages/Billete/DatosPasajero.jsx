import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Header from '../../Components/Header';
import { route } from 'ziggy-js';

export default function DatosPasajero({ vuelo, asientosSeleccionados, totalBase }) {
  const { data, setData, post, processing, errors: serverErrors } = useForm({
    pasajeros: asientosSeleccionados.map(a => ({
      nombre_pasajero: '',
      documento_identidad: '',
      maleta_adicional: false,
      asiento_id: a.id,
    })),
    cancelacion_flexible_global: false,
    total: totalBase,
  });

  // Estado para errores cliente
  const [clientErrors, setClientErrors] = useState({});

  function handleInputChange(i, field, val) {
    const arr = [...data.pasajeros];
    arr[i][field] = val;
    setData('pasajeros', arr);
  }

  function handleCancelacionGlobalChange(checked) {
    setData('cancelacion_flexible_global', checked);
  }

  function calcularPrecioPasajero(i) {
    let p = parseFloat(asientosSeleccionados[i].precio_base);
    if (data.pasajeros[i].maleta_adicional) p += 20;
    return p;
  }

  function calcularPrecioTotal() {
    const sumaPasajeros = data.pasajeros.reduce((sum, _, i) => sum + calcularPrecioPasajero(i), 0);
    const recargoCancelacion = data.cancelacion_flexible_global
      ? data.pasajeros.length * 15
      : 0;
    return sumaPasajeros + recargoCancelacion;
  }

  function validate() {
    const errs = {};
    data.pasajeros.forEach((pas, i) => {
      // Nombre: mínimo 3 caracteres, solo letras y espacios
      const nombre = pas.nombre_pasajero.trim();
      if (!nombre || nombre.length < 3) {
        errs[`nombre_${i}`] = 'El nombre debe tener al menos 3 caracteres.';
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(nombre)) {
        errs[`nombre_${i}`] = 'El nombre solo puede contener letras y espacios.';
      }

      // DNI/Pasaporte: 5–10 alfanuméricos con al menos un dígito
      const doc = pas.documento_identidad.trim();
      if (!doc) {
        errs[`doc_${i}`] = 'El DNI/Pasaporte es obligatorio.';
      } else if (!/^(?=.*\d)[A-Za-z0-9]{5,10}$/.test(doc)) {
        errs[`doc_${i}`] = 'Formato de DNI/Pasaporte inválido.';
      }
    });
    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const totalConRecargos = calcularPrecioTotal();
    post(route('billetes.preparar_pago'), {
      pasajeros: data.pasajeros,
      cancelacion_flexible_global: data.cancelacion_flexible_global,
      total: totalConRecargos,
    });
  }

  return (
    <>
      <Header activePage="#" />

      <form onSubmit={handleSubmit} className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Datos de los pasajeros</h2>

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
              className="w-full p-2 border mb-1"
            />
            {clientErrors[`nombre_${i}`] && (
              <div className="text-red-600 text-sm mb-1">
                {clientErrors[`nombre_${i}`]}
              </div>
            )}
            {serverErrors[`pasajeros.${i}.nombre_pasajero`] && (
              <div className="text-red-600 text-sm mb-1">
                {serverErrors[`pasajeros.${i}.nombre_pasajero`]}
              </div>
            )}

            <label className="block mb-1">DNI / Pasaporte</label>
            <input
              type="text"
              value={pas.documento_identidad}
              onChange={e => handleInputChange(i, 'documento_identidad', e.target.value)}
              className="w-full p-2 border mb-1"
            />
            {clientErrors[`doc_${i}`] && (
              <div className="text-red-600 text-sm mb-1">
                {clientErrors[`doc_${i}`]}
              </div>
            )}
            {serverErrors[`pasajeros.${i}.documento_identidad`] && (
              <div className="text-red-600 text-sm mb-1">
                {serverErrors[`pasajeros.${i}.documento_identidad`]}
              </div>
            )}

            <label className="block mb-3">
              <input
                type="checkbox"
                checked={pas.maleta_adicional}
                onChange={e => handleInputChange(i, 'maleta_adicional', e.target.checked)}
              />{' '}
              Maleta adicional (+20 €)
            </label>

            <p className="mt-3 font-semibold">
              Precio pasajero: {calcularPrecioPasajero(i).toFixed(2)} €
            </p>
          </div>
        ))}

        <label className="block mb-6">
          <input
            type="checkbox"
            checked={data.cancelacion_flexible_global}
            onChange={e => handleCancelacionGlobalChange(e.target.checked)}
          />{' '}
          Cancelación flexible (+15 € por pasajero)
        </label>

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
