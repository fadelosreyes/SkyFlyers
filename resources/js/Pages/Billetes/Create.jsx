import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function Create({ asientos, estados }) {
  const { data, setData, post, processing, errors } = useForm({
    nombre_pasajero: '',
    documento_identidad: '',
    asiento_id: '',
    estado_id: '',
    tarifa_base: '',
    recargos: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/billetes'); // Ruta que apunta al método store
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Crear Billete</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Nombre del pasajero</label>
          <input
            type="text"
            value={data.nombre_pasajero}
            onChange={(e) => setData('nombre_pasajero', e.target.value)}
            className="w-full border rounded p-2"
          />
          {errors.nombre_pasajero && <div className="text-red-500 text-sm">{errors.nombre_pasajero}</div>}
        </div>

        <div>
          <label className="block">Documento de identidad</label>
          <input
            type="text"
            value={data.documento_identidad}
            onChange={(e) => setData('documento_identidad', e.target.value)}
            className="w-full border rounded p-2"
          />
          {errors.documento_identidad && <div className="text-red-500 text-sm">{errors.documento_identidad}</div>}
        </div>

        <div>
          <label className="block">Asiento</label>
          <select
            value={data.asiento_id}
            onChange={(e) => setData('asiento_id', e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">Selecciona un asiento</option>
            {asientos.map((asiento) => (
              <option key={asiento.id} value={asiento.id}>
                {asiento.numero} - {asiento.tipo}
              </option>
            ))}
          </select>
          {errors.asiento_id && <div className="text-red-500 text-sm">{errors.asiento_id}</div>}
        </div>

        <div>
          <label className="block">Estado</label>
          <select
            value={data.estado_id}
            onChange={(e) => setData('estado_id', e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">Selecciona un estado</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>
          {errors.estado_id && <div className="text-red-500 text-sm">{errors.estado_id}</div>}
        </div>

        <div>
          <label className="block">Tarifa base (€)</label>
          <input
            type="number"
            value={data.tarifa_base}
            onChange={(e) => setData('tarifa_base', e.target.value)}
            className="w-full border rounded p-2"
          />
          {errors.tarifa_base && <div className="text-red-500 text-sm">{errors.tarifa_base}</div>}
        </div>

        <div>
          <label className="block">Recargos (€)</label>
          <input
            type="number"
            value={data.recargos}
            onChange={(e) => setData('recargos', e.target.value)}
            className="w-full border rounded p-2"
          />
          {errors.recargos && <div className="text-red-500 text-sm">{errors.recargos}</div>}
        </div>

        <button
          type="submit"
          disabled={processing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Confirmar billete
        </button>
      </form>
    </div>
  );
}
