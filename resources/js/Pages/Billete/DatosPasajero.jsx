import React, { useState } from 'react';
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
  const asientosVuelta = Array.isArray(asientosSeleccionadosVuelta) ? asientosSeleccionadosVuelta : [];

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
          asiento_vuelta: asientosVuelta[i]?.id || null,
        }))
      : [],
    cancelacion_flexible_global: false,
    total: totalBaseIda + totalBaseVuelta,
    language: '',
  });

  const [clientErrors, setClientErrors] = useState({});

  // Al cambiar datos de pasajero, sincronizamos para ambos vuelos (es la misma persona)
  function handleInputChange(i, field, val) {
    const pasajerosCopy = [...data.pasajeros];
    pasajerosCopy[i][field] = val;
    setData('pasajeros', pasajerosCopy);
  }

  function handleCheckboxChange(i, field, checked) {
    // maletas ida y vuelta son independientes, no se sincronizan
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
    if (data.pasajeros[i]?.maleta_adicional_vuelta) precio += 20;

    const precioIda = asientosIda[i]?.precio_base || 0;
    const precioVuelta = asientosVuelta[i]?.precio_base || 0;

    precio += parseFloat(precioIda) + parseFloat(precioVuelta);

    return precio;
  }

  function calculateTotalPrice() {
    const suma = data.pasajeros.reduce((acc, _, i) => acc + calculatePassengerPrice(i), 0);
    const cancellation = data.cancelacion_flexible_global ? (numPasajeros * 15) : 0;
    return suma + cancellation;
  }

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
          if (!/^\d{8}[A-Za-z]$/.test(doc)) {
            errs[`doc_${i}`] = t('errors.doc_dni_format');
          }
        } else if (tipoDoc === 'pasaporte') {
          if (!/^[A-Za-z]{3}\d{6}\d$/.test(doc)) {
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

    // Si quieres activar validación:
    // if (!validate()) return;

    const totalWithExtras = calculateTotalPrice();
    setData('language', i18n.language);

    const pasajerosEnviados = data.pasajeros.map(p => ({
      nombre_pasajero: p.nombre_pasajero,
      tipo_documento: p.tipo_documento,
      documento_identidad: p.documento_identidad,
      maleta_adicional_ida: p.maleta_adicional_ida,
      maleta_adicional_vuelta: p.maleta_adicional_vuelta,
      asiento_ida: p.asiento_ida,
      asiento_vuelta: p.asiento_vuelta,
    }));

    post(route('billetes.preparar_pago'), {
      pasajeros: pasajerosEnviados,
      cancelacion_flexible_global: data.cancelacion_flexible_global,
      total: totalWithExtras,
      language: i18n.language,
    }, {
      onSuccess: () => {
        console.log('¡Petición enviada con éxito!');
      },
      onError: (errors) => {
        console.error('Errores del servidor:', errors);
      },
      onFinish: () => {
        console.log('Petición finalizada');
      }
    });
  }

  return (
    <>
      <Header activePage="#" />
      <form onSubmit={handleSubmit} className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t('passenger_data.title')}</h2>

        {[...Array(numPasajeros)].map((_, idx) => (
          <div key={idx} className="border p-4 mb-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">{t('passenger_data.passenger')} {idx + 1}</h3>

            <p className="mb-1 font-medium">
              {t('passenger_data.seat')} (Ida): {asientosIda[idx]?.numero || '-'}
            </p>

            {asientosVuelta.length > 0 && (
              <p className="mb-3 font-medium">
                {t('passenger_data.seat')} (Vuelta): {asientosVuelta[idx]?.numero || '-'}
              </p>
            )}

            {/* Datos del pasajero (compartidos para ida y vuelta) */}
            <label className="block mb-1">{t('passenger_data.full_name')}</label>
            <input
              type="text"
              value={data.pasajeros[idx]?.nombre_pasajero || ''}
              onChange={e => handleInputChange(idx, 'nombre_pasajero', e.target.value)}
              className="w-full p-2 border mb-1"
            />
            {clientErrors[`nombre_${idx}`] && <div className="text-red-600 text-sm">{clientErrors[`nombre_${idx}`]}</div>}
            {serverErrors[`pasajeros.${idx}.nombre_pasajero`] && <div className="text-red-600 text-sm">{serverErrors[`pasajeros.${idx}.nombre_pasajero`]}</div>}

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
                  : 'ABC1234567'
              }
              className="w-full p-2 border mb-1"
            />
            {clientErrors[`doc_${idx}`] && <div className="text-red-600 text-sm">{clientErrors[`doc_${idx}`]}</div>}
            {serverErrors[`pasajeros.${idx}.documento_identidad`] && <div className="text-red-600 text-sm">{serverErrors[`pasajeros.${idx}.documento_identidad`]}</div>}

            <div className="flex items-center mt-3 space-x-4">
              <label>
                <input
                  type="checkbox"
                  checked={data.pasajeros[idx]?.maleta_adicional_ida || false}
                  onChange={e => handleCheckboxChange(idx, 'maleta_adicional_ida', e.target.checked)}
                />{' '}
                {t('passenger_data.extra_baggage_ida')}
              </label>

              {asientosVuelta.length > 0 && (
                <label>
                  <input
                    type="checkbox"
                    checked={data.pasajeros[idx]?.maleta_adicional_vuelta || false}
                    onChange={e => handleCheckboxChange(idx, 'maleta_adicional_vuelta', e.target.checked)}
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
