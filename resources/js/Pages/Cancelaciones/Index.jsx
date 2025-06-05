import React from 'react';
import { Link, router } from '@inertiajs/react';
import Header from "@/Components/Header";
import { useTranslation } from 'react-i18next';

export default function Index({ grupos }) {
  const { t } = useTranslation();

  // Cancela todos los vuelos que vengan en el mismo "grupo" (ida + posible vuelta)
  const cancelarViaje = (vuelosIds) => {
    if (!confirm(t('billetes_index.confirmar_cancelacion'))) {
      return;
    }

    vuelosIds.forEach((id) => {
      router.post(
        `/vuelos/${id}/cancelar-billetes`,
        {},
        {
          preserveScroll: true,
          onSuccess: () => {
            // Opcional: mostrar notificación de éxito
          },
          onError: () => {
            alert(t('billetes_index.cancelacion_error'));
          },
        }
      );
    });

    alert(t('billetes_index.cancelacion_exitosa'));
  };

  // Cancela solamente el vuelo cuyo ID se le pase
  const cancelarSoloUnVuelo = (vueloId) => {
    if (!confirm(t('billetes_index.confirmar_cancelacion'))) {
      return;
    }

    router.post(
      `/vuelos/${vueloId}/cancelar-billetes`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          alert(t('billetes_index.cancelacion_exitosa'));
        },
        onError: () => {
          alert(t('billetes_index.cancelacion_error'));
        },
      }
    );
  };

  return (
    <>
      <Header activePage="#" />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{t('billetes_index.titulo')}</h1>

        {grupos.length === 0 && (
          <p>{t('billetes_index.no_encontrado')}</p>
        )}

        <div className="space-y-10">
          {grupos.map((grupo, idx) => {
            // Extraemos los IDs de vuelo (ida siempre existe; vuelta puede ser null)
            const vuelosParaCancelar = [grupo.ida.vuelo.id];
            if (grupo.vuelta) {
              vuelosParaCancelar.push(grupo.vuelta.vuelo.id);
            }

            // Determinamos si hay al menos un billete con cancelacion_flexible en el grupo:
            const idaFlexible = grupo.ida.billetes.some(b => b.cancelacion_flexible);
            const vueltaFlexible =
              grupo.vuelta?.billetes.some(b => b.cancelacion_flexible) || false;
            const puedeCancelarViaje = idaFlexible || vueltaFlexible;

            return (
              <div key={idx} className="border rounded p-6 shadow bg-white">
                <h2 className="text-xl font-semibold mb-4">
                  {t('billetes_index.viaje')}:{' '}
                  {grupo.ida.vuelo.origen} → {grupo.ida.vuelo.destino}
                  {grupo.vuelta && (
                    <>
                      {' '}
                      &amp; {grupo.vuelta.vuelo.origen} → {grupo.vuelta.vuelo.destino}
                    </>
                  )}
                </h2>

                {/* — Sección IDA — */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">
                    {t('billetes_index.ida')}
                  </h3>
                  <p>
                    <strong>{t('billetes_index.fecha_salida')}:</strong>{' '}
                    {new Date(grupo.ida.vuelo.fecha_salida).toLocaleString()}
                  </p>
                  <p>
                    <strong>{t('billetes_index.fecha_llegada')}:</strong>{' '}
                    {new Date(grupo.ida.vuelo.fecha_llegada).toLocaleString()}
                  </p>

                  <div className="mt-4 space-y-4">
                    {grupo.ida.billetes.map((billete) => (
                      <div
                        key={billete.id}
                        className="border p-4 rounded bg-gray-50"
                      >
                        <p>
                          <strong>{t('billetes_index.nombre_pasajero')}:</strong>{' '}
                          {billete.nombre_pasajero}
                        </p>
                        <p>
                          <strong>{t('billetes_index.documento')}:</strong>{' '}
                          {billete.documento_identidad}
                        </p>
                        <p>
                          <strong>{t('billetes_index.pnr')}:</strong>{' '}
                          {billete.pnr}
                        </p>
                        <p>
                          <strong>{t('billetes_index.asiento')}:</strong>{' '}
                          {billete.asiento_numero}
                        </p>
                        <p>
                          <strong>{t('billetes_index.total')}:</strong>{' '}
                          {new Intl.NumberFormat('es-ES', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(billete.total)}
                        </p>
                        <p>
                          <strong>{t('billetes_index.fecha_reserva')}:</strong>{' '}
                          {new Date(billete.fecha_reserva).toLocaleString()}
                        </p>

                        <button
                          onClick={() =>
                            router.get(`/billetes/${billete.id}/cambiar-asiento`)
                          }
                          className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          {t('billetes_index.cambiar_asiento')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* — Sección VUELTA (solo si existe) — */}
                {grupo.vuelta && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      {t('billetes_index.vuelta')}
                    </h3>
                    <p>
                      <strong>{t('billetes_index.fecha_salida')}:</strong>{' '}
                      {new Date(grupo.vuelta.vuelo.fecha_salida).toLocaleString()}
                    </p>
                    <p>
                      <strong>{t('billetes_index.fecha_llegada')}:</strong>{' '}
                      {new Date(grupo.vuelta.vuelo.fecha_llegada).toLocaleString()}
                    </p>

                    <div className="mt-4 space-y-4">
                      {grupo.vuelta.billetes.map((billete) => (
                        <div
                          key={billete.id}
                          className="border p-4 rounded bg-gray-50"
                        >
                          <p>
                            <strong>{t('billetes_index.nombre_pasajero')}:</strong>{' '}
                            {billete.nombre_pasajero}
                          </p>
                          <p>
                            <strong>{t('billetes_index.documento')}:</strong>{' '}
                            {billete.documento_identidad}
                          </p>
                          <p>
                            <strong>{t('billetes_index.pnr')}:</strong>{' '}
                            {billete.pnr}
                          </p>
                          <p>
                            <strong>{t('billetes_index.asiento')}:</strong>{' '}
                            {billete.asiento_numero}
                          </p>
                          <p>
                            <strong>{t('billetes_index.total')}:</strong>{' '}
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(billete.total)}
                          </p>
                          <p>
                            <strong>{t('billetes_index.fecha_reserva')}:</strong>{' '}
                            {new Date(billete.fecha_reserva).toLocaleString()}
                          </p>

                          <button
                            onClick={() =>
                              router.get(`/billetes/${billete.id}/cambiar-asiento`)
                            }
                            className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                          >
                            {t('billetes_index.cambiar_asiento')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* — Botón global “Cancelar viaje” solo si hay algún billete con cancelación flexible — */}
                {puedeCancelarViaje && (
                  <div className="mt-6">
                    <button
                      onClick={() => cancelarViaje(vuelosParaCancelar)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      {t('billetes_index.cancelar_viaje')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* — Enlace de “Volver al inicio” — */}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {t('billetes_index.volver_inicio')}
          </Link>
        </div>
      </div>
    </>
  );
}
