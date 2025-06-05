import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Header from '../../Components/Header';
import { route } from 'ziggy-js';
import { useTranslation } from 'react-i18next';

export default function PassengerData({
  vueloIda = null,
  asientosSeleccionadosIda = [],
  vueloVuelta = null,
  asientosSeleccionadosVuelta = [],
  totalBaseIda = 0,
  totalBaseVuelta = 0,
}) {
  const { t, i18n } = useTranslation();

  const asientosIda = Array.isArray(asientosSeleccionadosIda) ? asientosSeleccionadosIda : [];
  const asientosVuelta = vueloVuelta ? (Array.isArray(asientosSeleccionadosVuelta) ? asientosSeleccionadosVuelta : []) : [];

  const numPasajeros = Math.max(asientosIda.length, asientosVuelta.length);

  const { data, setData, post, processing, errors: serverErrors } = useForm({
    pasajeros: numPasajeros > 0
      ? [...Array(numPasajeros)].map((_, i) => ({
          nombre_pasajero: '',
          tipo_documento: 'dni',
          documento_identidad: '',
          maleta_adicional_ida: false,
          maleta_adicional_vuelta: false,
          asiento_ida: asientosIda[i]?.id || null,
          asiento_vuelta: vueloVuelta ? (asientosVuelta[i]?.id || null) : null,
        }))
      : [],
    cancelacion_flexible_global: false,
    total: 0,
    language: '',
  });

  const [clientErrors, setClientErrors] = useState({});

  function handleInputChange(i, field, val) {
    const pasajerosCopy = [...data.pasajeros];
    pasajerosCopy[i][field] = val;
    setData('pasajeros', pasajerosCopy);
  }

  function handleCheckboxChange(i, field, checked) {
    const pasajerosCopy = [...data.pasajeros];
    pasajerosCopy[i][field] = checked;
    setData('pasajeros', pasajerosCopy);
  }

  function handleCancelacionGlobalChange(checked) {
    setData('cancelacion_flexible_global', checked);
  }

  function calculatePassengerPrice(i) {
    let precio = 0;
    if (data.pasajeros[i]?.maleta_adicional_ida) precio += 20;
    if (vueloVuelta && data.pasajeros[i]?.maleta_adicional_vuelta) precio += 20;

    const precioIda = asientosIda[i]?.precio_base || 0;
    const precioVuelta = vueloVuelta ? (asientosVuelta[i]?.precio_base || 0) : 0;

    precio += parseFloat(precioIda) + parseFloat(precioVuelta);
    return precio;
  }

  function calculateTotalPrice() {
    const sumaPasajeros = data.pasajeros.reduce(
      (acc, _, i) => acc + calculatePassengerPrice(i),
      0
    );
    const cancellation = data.cancelacion_flexible_global ? (numPasajeros * 15) : 0;
    return sumaPasajeros + cancellation;
  }

  useEffect(() => {
    const nuevoTotal = calculateTotalPrice();
    setData('total', nuevoTotal);
  }, [data.pasajeros, data.cancelacion_flexible_global]);

  function validate() {
    const errs = {};
    data.pasajeros.forEach((pas, i) => {
      const name = pas.nombre_pasajero.trim();
      const doc = pas.documento_identidad.trim();
      const tipoDoc = pas.tipo_documento;

      if (!name || name.length < 3) {
        errs[`nombre_${i}`] = t('errors.name_min');
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(name)) {
        errs[`nombre_${i}`] = t('errors.name_letters');
      }

      if (!doc) {
        errs[`doc_${i}`] = t('errors.doc_required');
      } else {
        if (tipoDoc === 'dni') {
          if (!/^[0-9]{8}[A-Z]$/.test(doc)) {
            errs[`doc_${i}`] = t('errors.doc_dni_format');
          }
        } else if (tipoDoc === 'pasaporte') {
          if (!/^[A-Za-z]{3}[0-9]{6}$/.test(doc)) {
            errs[`doc_${i}`] = t('errors.doc_pasaporte_format');
          }
        }
      }
    });

    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    const pasajerosParaEnviar = data.pasajeros.map((pasajero) => ({
      ...pasajero,
      asiento_vuelta: vueloVuelta ? pasajero.asiento_vuelta : null,
      maleta_adicional_vuelta: vueloVuelta ? pasajero.maleta_adicional_vuelta : false,
    }));

    const dataParaEnviar = {
      ...data,
      pasajeros: pasajerosParaEnviar,
      language: i18n.language,
    };

    post(route('billetes.preparar_pago'), {
      data: dataParaEnviar,
      onSuccess: () => console.log('¡Petición enviada con éxito!'),
      onError: (errs) => console.error('Errores del servidor:', errs),
    });
  }

  return (
    <>
      <Header activePage="#" />
      <form onSubmit={handleSubmit} className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t('passenger_data.title')}</h2>

        {[...Array(numPasajeros)].map((_, idx) => (
          <div key={idx} className="border p-4 mb-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">
              {t('passenger_data.passenger')} {idx + 1}
            </h3>

            <p className="mb-1 font-medium">
              {t('passenger_data.seat_ida')}: {asientosIda[idx]?.numero || '-'}
            </p>

            {vueloVuelta && asientosVuelta.length > 0 && (
              <p className="mb-3 font-medium">
                {t('passenger_data.seat_vuelta')}: {asientosVuelta[idx]?.numero || '-'}
              </p>
            )}

            <label className="block mb-1">{t('passenger_data.full_name')}</label>
            <input
              type="text"
              value={data.pasajeros[idx]?.nombre_pasajero || ''}
              onChange={e => handleInputChange(idx, 'nombre_pasajero', e.target.value)}
              className="w-full p-2 border mb-1"
            />
            {clientErrors[`nombre_${idx}`] && (
              <div className="text-red-600 text-sm">{clientErrors[`nombre_${idx}`]}</div>
            )}
            {serverErrors[`pasajeros.${idx}.nombre_pasajero`] && (
              <div className="text-red-600 text-sm">
                {serverErrors[`pasajeros.${idx}.nombre_pasajero`]}
              </div>
            )}

            <label className="block mb-1">{t('passenger_data.document_type')}</label>
            <select
              value={data.pasajeros[idx]?.tipo_documento || 'dni'}
              onChange={e => handleInputChange(idx, 'tipo_documento', e.target.value)}
              className="w-full p-2 border mb-1"
            >
              <option value="dni">{t('passenger_data.dni')}</option>
              <option value="pasaporte">{t('passenger_data.passport')}</option>
            </select>

            <label className="block mb-1">{t('passenger_data.id_document')}</label>
            <input
              type="text"
              value={data.pasajeros[idx]?.documento_identidad || ''}
              onChange={e => handleInputChange(idx, 'documento_identidad', e.target.value)}
              placeholder={
                data.pasajeros[idx]?.tipo_documento === 'dni'
                  ? '12345678A'
                  : 'ABC123456'
              }
              className="w-full p-2 border mb-1"
            />
            {clientErrors[`doc_${idx}`] && (
              <div className="text-red-600 text-sm">{clientErrors[`doc_${idx}`]}</div>
            )}
            {serverErrors[`pasajeros.${idx}.documento_identidad`] && (
              <div className="text-red-600 text-sm">
                {serverErrors[`pasajeros.${idx}.documento_identidad`]}
              </div>
            )}

            <div className="flex items-center mt-3 space-x-4">
              <label>
                <input
                  type="checkbox"
                  checked={data.pasajeros[idx]?.maleta_adicional_ida || false}
                  onChange={e => handleCheckboxChange(idx, 'maleta_adicional_ida', e.target.checked)}
                />{' '}
                {t('passenger_data.extra_baggage_ida')}
              </label>

              {vueloVuelta && (
                <label>
                  <input
                    type="checkbox"
                    checked={data.pasajeros[idx]?.maleta_adicional_vuelta || false}
                    onChange={e =>
                      handleCheckboxChange(idx, 'maleta_adicional_vuelta', e.target.checked)
                    }
                  />{' '}
                  {t('passenger_data.extra_baggage_vuelta')}
                </label>
              )}
            </div>

            <p className="mt-2 font-semibold">
              {t('passenger_data.price')}: {calculatePassengerPrice(idx).toFixed(2)} €
            </p>
          </div>
        ))}

        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={data.cancelacion_flexible_global}
            onChange={e => handleCancelacionGlobalChange(e.target.checked)}
          />
          <span className="ml-2">{t('passenger_data.flexible_cancellation')}</span>
        </label>

        <p className="text-xl font-bold mb-6">
          {t('passenger_data.total_price')}: {calculateTotalPrice().toFixed(2)} €
        </p>

        <button
          type="submit"
          disabled={processing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {processing ? t('passenger_data.sending') : t('passenger_data.submit')}
        </button>
      </form>
    </>
  );
}
