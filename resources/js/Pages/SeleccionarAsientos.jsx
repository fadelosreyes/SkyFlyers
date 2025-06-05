import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../../css/SeleccionarAsientos.css';
import '../../css/principal.css';
import Header from '../Components/Header';

export default function SeleccionarAsientos({
  vuelo,
  asientos,
  numPasajeros,
  idVuelta,              // Si no es null, es roundtrip “fase ida”
  billete,
  claseSeleccionada: claseInicial
}) {
  const { t, i18n } = useTranslation();

  // 1) Determinar modos
  const esRoundTrip  = Boolean(idVuelta);
  const modoCambio   = Boolean(billete);

  // 2) Estado de la clase seleccionada (turista/business/primera)
  const claseInicialLower = claseInicial ? claseInicial.toLowerCase() : 'turista';
  const [claseSeleccionada, setClaseSeleccionada] = useState(
    modoCambio ? claseInicialLower : 'turista'
  );

  // 3) Estado de los asientos seleccionados, agrupado por clase
  const [seleccionPorClase, setSeleccionPorClase] = useState(() => {
    if (modoCambio) {
      return {
        turista: [],
        business: [],
        primera: [],
        [claseInicialLower]: [billete.asiento_id],
      };
    }
    return {
      turista: [],
      business: [],
      primera: []
    };
  });

  // 4) Función para parsear "12A" → { fila:12, letra:'A' }
  const parseAsiento = (numero) => {
    const match = numero.match(/^(\d+)([A-Z])$/i);
    return match
      ? { fila: parseInt(match[1]), letra: match[2] }
      : { fila: 0, letra: '' };
  };

  // 5) Filtrar + ordenar asientos por la clase seleccionada
  const asientosFiltrados = asientos
    .filter(a => a.clase.nombre.toLowerCase() === claseSeleccionada)
    .sort((a, b) => {
      const ap = parseAsiento(a.numero);
      const bp = parseAsiento(b.numero);
      return ap.fila - bp.fila || ap.letra.localeCompare(bp.letra);
    });

  // 6) Columnas a renderizar según la clase
  const columnasTotales =
    claseSeleccionada === 'turista' ? 7 :
    claseSeleccionada === 'business' ? 5 : 3;

  // 7) Agrupar asientos por filas (objeto { fila: [asientos...] })
  const filas = {};
  asientosFiltrados.forEach(a => {
    const { fila } = parseAsiento(a.numero);
    if (!filas[fila]) filas[fila] = [];
    filas[fila].push(a);
  });
  Object.values(filas).forEach(arr => {
    arr.sort((a, b) => a.numero.localeCompare(b.numero));
  });

  // 8) Auxiliares para contar selecciones
  const getSeleccionados = () => seleccionPorClase[claseSeleccionada];
  const totalSeleccionados = Object.values(seleccionPorClase).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  // 9) Función para alternar selección de un asiento
  const toggleSeleccion = (id) => {
    const actuales = seleccionPorClase[claseSeleccionada];
    const yaSel = actuales.includes(id);

    if (!yaSel) {
      if (modoCambio) {
        // Solo un asiento en modo cambio
        setSeleccionPorClase(prev => ({
          ...prev,
          [claseSeleccionada]: [id]
        }));
      } else {
        // Si es compra normal, no permitir más de numPasajeros
        if (totalSeleccionados >= numPasajeros) {
          alert(t('seleccionar_asientos.alerta_limite', { numPasajeros }));
          return;
        }
        setSeleccionPorClase(prev => ({
          ...prev,
          [claseSeleccionada]: [...prev[claseSeleccionada], id]
        }));
      }
    } else {
      // Deseleccionar
      setSeleccionPorClase(prev => ({
        ...prev,
        [claseSeleccionada]: prev[claseSeleccionada].filter(a => a !== id)
      }));
    }
  };

  // 10) Al pulsar “Confirmar”:
  const confirmarSeleccion = () => {
    // --- A) MODO CAMBIO ---
    if (modoCambio) {
      const seleccionados = getSeleccionados();
      if (seleccionados.length !== 1) {
        alert(t('seleccionar_asientos.error_seleccion'));
        return;
      }
      router.post(
        route('billetes.actualizarAsiento', billete.id),
        { asiento_id: seleccionados[0] },
        {
          onSuccess: () => {
            alert(t('seleccionar_asientos.exito_cambio'));
            router.visit(route('cancelaciones.index'));
          },
          onError: (errors) => {
            alert(errors.asiento_id || t('seleccionar_asientos.error_general'));
          }
        }
      );
      return;
    }

    // --- B) PRIMERA FASE de ROUNDTRIP (selección de ida) ---
    if (esRoundTrip) {
      const seleccionadosIda = Object.values(seleccionPorClase).flat();
      if (seleccionadosIda.length !== numPasajeros) {
        alert(t('seleccionar_asientos.error_seleccion_ida', { numPasajeros }));
        return;
      }

      axios.post('/vuelos/guardar-seleccion-ida', {
        vueloIda: vuelo.id,
        seats: seleccionadosIda,
        passengers: numPasajeros
      })
      .then(() => {
        router.get(
          route('seleccionar.asientos', {
            id: idVuelta,
            passengers: numPasajeros
          })
        );
      })
      .catch(() => {
        alert(t('seleccionar_asientos.error_general'));
      });

      return;
    }

    // --- C) SEGUNDA FASE de ROUNDTRIP o SINGLE-FLIGHT ---
    if (!esRoundTrip) {
      // Solo ida -> no recuperar selección previa
      const seleccionadosIda = Object.values(seleccionPorClase).flat();

      if (seleccionadosIda.length !== numPasajeros) {
        alert(t('seleccionar_asientos.error_seleccion', { numPasajeros }));
        return;
      }

      router.post(route('billetes.asientos'), {
        vuelo_ida: vuelo.id,
        seats_ida: seleccionadosIda,
        vuelo_vuelta: null,
        seats_vuelta: null,
        passengers: numPasajeros,
        language: i18n.language
      }, {
        onSuccess: () => {
          console.log('Redirigiendo a preparar pago...');
        },
        onError: (errors) => {
          console.error('Error en preparar_pago (single flight):', errors);
          alert('Error en preparar_pago:\n' + (errors.message || JSON.stringify(errors) || 'Error desconocido'));
        }
      });

      return;
    }

    // Si llegamos aquí, es ROUNDTRIP y segunda fase (selección vuelta)
    axios.get('/vuelos/obtener-seleccion-ida')
      .then(({ data }) => {
        const vueloIda = data.vuelo_ida;
        const seatsIda = data.asientos_ida || [];

        const seleccionadosVuelta = Object.values(seleccionPorClase).flat();

        if (!vueloIda) {
          alert(t('seleccionar_asientos.error_seleccion', { numPasajeros }));
          return;
        }

        if (seleccionadosVuelta.length !== numPasajeros) {
          alert(t('seleccionar_asientos.error_seleccion_vuelta', { numPasajeros }));
          return;
        }

        router.post(route('billetes.asientos'), {
          vuelo_ida: vueloIda,
          seats_ida: seatsIda,
          vuelo_vuelta: vuelo.id,
          seats_vuelta: seleccionadosVuelta,
          passengers: numPasajeros,
          language: i18n.language
        }, {
          onSuccess: () => {
            console.log('Redirigiendo a preparar pago...');
          },
          onError: (errors) => {
            console.error('Error en preparar_pago (roundtrip):', errors);
            alert('Error en preparar_pago:\n' + (errors.message || JSON.stringify(errors) || 'Error desconocido'));
          }
        });
      })
      .catch((error) => {
        console.error('Error detallado:', error);
        alert(t('seleccionar_asientos.error_general') + '\n' + (error.response?.data?.message || error.message || JSON.stringify(error)));
      });
  };
  // 11) Funciones para limpiar selección
  const limpiarSeleccionClaseActual = () => {
    setSeleccionPorClase(prev => ({
      ...prev,
      [claseSeleccionada]: []
    }));
  };
  const limpiarTodosSeleccionados = () => {
    setSeleccionPorClase({ turista: [], business: [], primera: [] });
  };

  // 12) Función para cancelar (solo en modo cambio)
  const cancelar = () => {
    router.visit(route('cancelaciones.index'));
  };

  return (
    <>
      <Head
        title={`${modoCambio
          ? t('seleccionar_asientos.titulo_cambio')
          : idVuelta
            ? t('seleccionar_asientos.titulo_ida')
            : t('seleccionar_asientos.titulo')} - Vuelo ${vuelo.id}`}
      />
      <Header activePage="#" />

      <div className="contenedor-principal">
        {/* ---------- MAPA DE ASIENTOS ---------- */}
        <div
          className="contenedor-avion"
          style={{
            gridTemplateColumns: `repeat(${(columnasTotales - 1) / 2}, 2.5em) 1.5em repeat(${(columnasTotales - 1) / 2}, 2.5em)`,
            gap: '0.8em 1em'
          }}
        >
          {Object.entries(filas).map(([fila, asientosFila]) => {
            const mitad = Math.ceil(asientosFila.length / 2);
            return (
              <React.Fragment key={fila}>
                {asientosFila.slice(0, mitad).map(asiento => {
                  const estaSeleccionado = getSeleccionados().includes(asiento.id);
                  const estaOcupado     = asiento.estado.nombre === 'Ocupado';
                  const imgSrc = estaOcupado
                    ? '/img/asiento_rojo.png'
                    : estaSeleccionado
                      ? '/img/asiento_verde.png'
                      : '/img/asiento_vacio.png';

                  return (
                    <button
                      key={asiento.id}
                      disabled={estaOcupado}
                      className="asiento"
                      onClick={() => toggleSeleccion(asiento.id)}
                      title={`${t('seleccionar_asientos.asiento')} ${asiento.numero} - ${asiento.precio_base}€`}
                      type="button"
                    >
                      <img
                        src={imgSrc}
                        alt={`${t('seleccionar_asientos.asiento')} ${asiento.numero}`}
                      />
                    </button>
                  );
                })}
                <div style={{ width: '1.5em' }} />
                {asientosFila.slice(mitad).map(asiento => {
                  const estaSeleccionado = getSeleccionados().includes(asiento.id);
                  const estaOcupado     = asiento.estado.nombre === 'Ocupado';
                  const imgSrc = estaOcupado
                    ? '/img/asiento_rojo.png'
                    : estaSeleccionado
                      ? '/img/asiento_verde.png'
                      : '/img/asiento_vacio.png';

                  return (
                    <button
                      key={asiento.id}
                      disabled={estaOcupado}
                      className="asiento"
                      onClick={() => toggleSeleccion(asiento.id)}
                      title={`${t('seleccionar_asientos.asiento')} ${asiento.numero} - ${asiento.precio_base}€`}
                      type="button"
                    >
                      <img
                        src={imgSrc}
                        alt={`${t('seleccionar_asientos.asiento')} ${asiento.numero}`}
                      />
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        {/* ---------- MENÚ LATERAL ---------- */}
        <div className="contenedor-menu">
          {!modoCambio && (
            <>
              {/* Selección de clase solo si no es modo cambio */}
              <h3>{t('seleccionar_asientos.selecciona_clase')}</h3>
              <select
                value={claseSeleccionada}
                onChange={e => setClaseSeleccionada(e.target.value)}
              >
                <option value="turista">{t('clases.turista')}</option>
                <option value="business">{t('clases.business')}</option>
                <option value="primera">{t('clases.primera')}</option>
              </select>
            </>
          )}

          {!modoCambio && (
            <p>
              <strong>{t('seleccionar_asientos.asientos_seleccionados')}:</strong>{' '}
              {totalSeleccionados} / {numPasajeros}
            </p>
          )}

          {!modoCambio && Object.entries(seleccionPorClase).map(([clase, ids]) => (
            ids.length > 0 && (
              <div key={clase}>
                <p>
                  <strong>{t(`clases.${clase}`)}:</strong> {ids.length}{' '}
                  {t('seleccionar_asientos.asientos')}
                </p>
              </div>
            )
          ))}

         <button
  onClick={confirmarSeleccion}
  disabled={
    modoCambio
      ? getSeleccionados().length === 0
      : totalSeleccionados !== numPasajeros  // Aquí está la clave para que tenga todos
  }
  className="btn-confirmar"
>
  {modoCambio
    ? t('seleccionar_asientos.confirmar_cambio')
    : esRoundTrip
      ? t('seleccionar_asientos.confirmar_ida')
      : t('seleccionar_asientos.confirmar')}
</button>


            {modoCambio && (
            <button
                onClick={cancelar}
                className="btn-cancelar mt-1 bg-red-600 text-white py- px-4 rounded-lg hover:bg-red-700"
            >
            {t('seleccionar_asientos.cancelar')}
            </button>
            )}


          {!modoCambio && (
            <div style={{ display: 'flex', gap: '1em', marginTop: '1em' }}>
              <button
                onClick={limpiarSeleccionClaseActual}
                disabled={getSeleccionados().length === 0}
                className="btn-limpiar"
              >
                {t('seleccionar_asientos.limpiar_clase', {
                  clase: t(`clases.${claseSeleccionada}`)
                })}
              </button>

              <button
                onClick={limpiarTodosSeleccionados}
                disabled={totalSeleccionados === 0}
                className="btn-limpiar"
              >
                {t('seleccionar_asientos.limpiar_todos')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
