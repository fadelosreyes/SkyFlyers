import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Header from '../../Components/Header';
import { route } from 'ziggy-js';
import { useTranslation } from 'react-i18next';

export default function PassengerData({ vuelo, asientosSeleccionados, totalBase }) {
  const { t, i18n } = useTranslation();

  const { data, setData, post, processing, errors: serverErrors } = useForm({
    pasajeros: asientosSeleccionados.map(a => ({
      nombre_pasajero: '',
      documento_identidad: '',
      maleta_adicional: false,
      asiento_id: a.id,
    })),
    cancelacion_flexible_global: false,
    total: totalBase,
    language: '', // Añadido aquí
  });

  const [clientErrors, setClientErrors] = useState({});

  function handleInputChange(i, field, val) {
    const arr = [...data.pasajeros];
    arr[i][field] = val;
    setData('pasajeros', arr);
  }

  function handleCancelacionGlobalChange(checked) {
    setData('cancelacion_flexible_global', checked);
  }

  function calculatePassengerPrice(i) {
    let p = parseFloat(asientosSeleccionados[i].precio_base);
    if (data.pasajeros[i].maleta_adicional) p += 20;
    return p;
  }

  function calculateTotalPrice() {
    const sumPassengers = data.pasajeros.reduce((sum, _, i) => sum + calculatePassengerPrice(i), 0);
    const cancellationFee = data.cancelacion_flexible_global
      ? data.pasajeros.length * 15
      : 0;
    return sumPassengers + cancellationFee;
  }

  function validate() {
    const errs = {};
    data.pasajeros.forEach((pas, i) => {
      const name = pas.nombre_pasajero.trim();
      if (!name || name.length < 3) {
        errs[`nombre_${i}`] = t('errors.name_min');
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(name)) {
        errs[`nombre_${i}`] = t('errors.name_letters');
      }

      const doc = pas.documento_identidad.trim();
      if (!doc) {
        errs[`doc_${i}`] = t('errors.doc_required');
      } else if (!/^(?=.*\d)[A-Za-z0-9]{5,10}$/.test(doc)) {
        errs[`doc_${i}`] = t('errors.doc_format');
      }
    });
    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const totalWithFees = calculateTotalPrice();
    setData('total', totalWithFees);
    setData('language', i18n.language); // Se asegura de que se incluye

    post(route('billetes.preparar_pago'));
  }

  return (
    <>
      <Header activePage="#" />

      <form onSubmit={handleSubmit} className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t('passenger_data.title')}</h2>

        {data.pasajeros.map((pas, i) => (
          <div key={pas.asiento_id} className="border p-4 mb-6 rounded shadow-sm">
            <h3 className="text-lg font-semibold mb-2">
              {t('passenger_data.passenger')} {i + 1} – {t('passenger_data.seat')} {asientosSeleccionados[i].numero}
            </h3>

            <label className="block mb-1">{t('passenger_data.full_name')}</label>
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

            <label className="block mb-1">{t('passenger_data.id_document')}</label>
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
              {t('passenger_data.extra_baggage')} (+20 €)
            </label>

            <p className="mt-3 font-semibold">
              {t('passenger_data.passenger_price')}: {calculatePassengerPrice(i).toFixed(2)} €
            </p>
          </div>
        ))}

        <label className="block mb-6">
          <input
            type="checkbox"
            checked={data.cancelacion_flexible_global}
            onChange={e => handleCancelacionGlobalChange(e.target.checked)}
          />{' '}
          {t('passenger_data.flexible_cancellation')} (+15 € {t('passenger_data.per_passenger')})
        </label>

        <p className="text-xl font-bold mb-4">
          <strong>{t('passenger_data.total_price_with_fees')}:</strong> {calculateTotalPrice().toFixed(2)} €
        </p>

        <button
          type="submit"
          disabled={processing}
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          {t('passenger_data.continue_to_payment')}
        </button>
      </form>
    </>
  );
}


