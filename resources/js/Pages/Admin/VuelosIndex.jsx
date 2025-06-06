import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import Header from '@/Components/Header';

export default function Index({ vuelos, aviones, aeropuertos }) {
  const [editingId, setEditingId] = useState(null);
  const emptyForm = {
    avion_id: '',
    aeropuerto_origen_id: '',
    aeropuerto_destino_id: '',
    fecha_salida: '',
    fecha_llegada: '',
    imagen: '',
    destacado: false,
  };
  const [formData, setFormData] = useState(emptyForm);
  const [newVuelo, setNewVuelo] = useState(emptyForm);
  const [error, setError] = useState('');

  // —— Paginación, búsqueda y ordenación ——
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderConfig, setOrderConfig] = useState({ key: 'id', direction: 'asc' });
  const itemsPerPage = 20;

  // Ordenar vuelos según orderConfig
  const sortedVuelos = useMemo(() => {
    const arr = [...vuelos];
    const { key, direction } = orderConfig;

    arr.sort((a, b) => {
      let aValue, bValue;

      switch (key) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'avion':
          aValue = a.avion?.modelo?.toLowerCase() || '';
          bValue = b.avion?.modelo?.toLowerCase() || '';
          break;
        case 'origen':
          aValue = a.aeropuerto_origen?.nombre?.toLowerCase() || '';
          bValue = b.aeropuerto_origen?.nombre?.toLowerCase() || '';
          break;
        case 'destino':
          aValue = a.aeropuerto_destino?.nombre?.toLowerCase() || '';
          bValue = b.aeropuerto_destino?.nombre?.toLowerCase() || '';
          break;
        case 'fecha_salida':
          aValue = new Date(a.fecha_salida);
          bValue = new Date(b.fecha_salida);
          break;
        case 'fecha_llegada':
          aValue = new Date(a.fecha_llegada);
          bValue = new Date(b.fecha_llegada);
          break;
        default:
          aValue = '';
          bValue = '';
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return arr;
  }, [vuelos, orderConfig]);

  // Filtrar vuelos por término de búsqueda
  const filteredVuelos = useMemo(() => {
    if (!searchTerm) return sortedVuelos;
    const term = searchTerm.toLowerCase();

    return sortedVuelos.filter((vuelo) =>
      vuelo.id.toString().includes(term) ||
      vuelo.avion?.modelo?.toLowerCase().includes(term) ||
      vuelo.aeropuerto_origen?.nombre?.toLowerCase().includes(term) ||
      vuelo.aeropuerto_destino?.nombre?.toLowerCase().includes(term)
    );
  }, [sortedVuelos, searchTerm]);

  // Obtener los vuelos paginados para la página actual
  const paginatedVuelos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVuelos.slice(start, start + itemsPerPage);
  }, [filteredVuelos, currentPage]);

  const totalPages = Math.ceil(filteredVuelos.length / itemsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (orderConfig.key === key && orderConfig.direction === 'asc') {
      direction = 'desc';
    }
    setOrderConfig({ key, direction });
  };

  // —— Validación y acciones CRUD ——
  const startEditing = (vuelo) => {
    setEditingId(vuelo.id);
    setFormData({
      avion_id: vuelo.avion_id,
      aeropuerto_origen_id: vuelo.aeropuerto_origen_id,
      aeropuerto_destino_id: vuelo.aeropuerto_destino_id,
      fecha_salida: vuelo.fecha_salida.slice(0, 16),
      fecha_llegada: vuelo.fecha_llegada.slice(0, 16),
      imagen: vuelo.imagen || '',
      destacado: vuelo.destacado,
    });
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError('');
  };

  const validate = (data, editing = false) => {
    if (!data.avion_id || !data.aeropuerto_origen_id || !data.aeropuerto_destino_id) {
      setError('Selecciona avión y aeropuertos de origen y destino.');
      return false;
    }
    if (data.aeropuerto_origen_id === data.aeropuerto_destino_id) {
      setError('El aeropuerto de origen y destino deben ser diferentes.');
      return false;
    }
    if (!data.fecha_salida || !data.fecha_llegada) {
      setError('Debes introducir fecha de salida y llegada.');
      return false;
    }
    if (data.fecha_salida >= data.fecha_llegada) {
      setError('La fecha de salida debe ser anterior a la de llegada.');
      return false;
    }
    setError('');
    return true;
  };

  const handleUpdate = (id) => {
    if (!validate(formData, true)) return;

    router.put(route('vuelos.update', id), formData, {
      onSuccess: () => {
        cancelEditing();
      },
    });
  };

  const handleDelete = (id) => {
    if (confirm('¿Seguro que quieres eliminar este vuelo?')) {
      router.delete(route('vuelos.destroy', id));
    }
  };

  const handleCreate = () => {
    if (!validate(newVuelo)) return;

    router.post(route('vuelos.store'), newVuelo, {
      onSuccess: () => {
        setNewVuelo(emptyForm);
      },
    });
  };

  return (
    <div>
      <Header activePage="vuelos" />
      <main className="p-10 max-w-8xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Gestión de Vuelos</h1>

        {error && (
          <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>
        )}

        {/* — Buscador — */}
        <div className="mb-4 flex justify-center">
          <input
            type="text"
            placeholder="Buscar por ID, avión, origen o destino"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // reset página al buscar
            }}
            className="border border-gray-300 rounded px-3 py-2 w-full max-w-md"
          />
        </div>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="text-white select-none" style={{ backgroundColor: '#004080' }}>
              <tr>
                <th
                  className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  ID {orderConfig.key === 'id' ? (orderConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer"
                  onClick={() => handleSort('avion')}
                >
                  Avión {orderConfig.key === 'avion' ? (orderConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer"
                  onClick={() => handleSort('origen')}
                >
                  Origen {orderConfig.key === 'origen' ? (orderConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer"
                  onClick={() => handleSort('destino')}
                >
                  Destino {orderConfig.key === 'destino' ? (orderConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer"
                  onClick={() => handleSort('fecha_salida')}
                >
                  Salida {orderConfig.key === 'fecha_salida' ? (orderConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer"
                  onClick={() => handleSort('fecha_llegada')}
                >
                  Llegada {orderConfig.key === 'fecha_llegada' ? (orderConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide">Imagen (URL)</th>
                <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide">Destacado</th>
                <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVuelos.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-6 text-center text-gray-400 italic">
                    No hay vuelos registrados.
                  </td>
                </tr>
              )}

              {paginatedVuelos.map((vuelo) => (
                <tr
                  key={vuelo.id}
                  className="border-t border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                >
                  <td className="py-3 px-4 text-gray-700">{vuelo.id}</td>

                  <td className="py-3 px-4">
                    {editingId === vuelo.id ? (
                      <select
                        value={formData.avion_id}
                        onChange={(e) => setFormData({ ...formData, avion_id: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 rounded px-2 py-1 w-full"
                      >
                        <option value="">Selecciona avión</option>
                        {aviones.map((avion) => (
                          <option key={avion.id} value={avion.id}>{avion.modelo || `ID ${avion.id}`}</option>
                        ))}
                      </select>
                    ) : (
                      vuelo.avion?.modelo || `ID ${vuelo.avion_id}`
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {editingId === vuelo.id ? (
                      <select
                        value={formData.aeropuerto_origen_id}
                        onChange={(e) => setFormData({ ...formData, aeropuerto_origen_id: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 rounded px-2 py-1 w-full"
                      >
                        <option value="">Selecciona aeropuerto origen</option>
                        {aeropuertos.map((aeropuerto) => (
                          <option key={aeropuerto.id} value={aeropuerto.id}>
                            {aeropuerto.nombre || aeropuerto.codigo || `ID ${aeropuerto.id}`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      vuelo.aeropuerto_origen?.nombre || `ID ${vuelo.aeropuerto_origen_id}`
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {editingId === vuelo.id ? (
                      <select
                        value={formData.aeropuerto_destino_id}
                        onChange={(e) => setFormData({ ...formData, aeropuerto_destino_id: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 rounded px-2 py-1 w-full"
                      >
                        <option value="">Selecciona aeropuerto destino</option>
                        {aeropuertos.map((aeropuerto) => (
                          <option key={aeropuerto.id} value={aeropuerto.id}>
                            {aeropuerto.nombre || aeropuerto.codigo || `ID ${aeropuerto.id}`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      vuelo.aeropuerto_destino?.nombre || `ID ${vuelo.aeropuerto_destino_id}`
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {editingId === vuelo.id ? (
                      <input
                        type="datetime-local"
                        value={formData.fecha_salida}
                        onChange={(e) => setFormData({ ...formData, fecha_salida: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 rounded px-3 py-1 w-full"
                      />
                    ) : (
                      new Date(vuelo.fecha_salida).toLocaleString()
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {editingId === vuelo.id ? (
                      <input
                        type="datetime-local"
                        value={formData.fecha_llegada}
                        onChange={(e) => setFormData({ ...formData, fecha_llegada: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 rounded px-3 py-1 w-full"
                      />
                    ) : (
                      new Date(vuelo.fecha_llegada).toLocaleString()
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {editingId === vuelo.id ? (
                      <input
                        type="text"
                        value={formData.imagen}
                        onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 rounded px-3 py-1 w-full"
                        placeholder="URL de imagen"
                      />
                    ) : (
                      vuelo.imagen
                        ? <a href={vuelo.imagen} target="_blank" rel="noreferrer" className="text-indigo-600 underline">Ver imagen</a>
                        : '-'
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {editingId === vuelo.id ? (
                      <input
                        type="checkbox"
                        checked={formData.destacado}
                        onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                      />
                    ) : (
                      vuelo.destacado ? 'Sí' : 'No'
                    )}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {editingId === vuelo.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(vuelo.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow mr-2"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded shadow"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(vuelo)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(vuelo.id)}
                          className="text-red-600 hover:text-red-900 font-semibold"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {/* Fila para crear nuevo vuelo */}
              <tr className="border-t border-gray-100 bg-indigo-50">
                <td className="py-3 px-4 text-gray-600 font-semibold">—</td>

                <td className="py-3 px-4">
                  <select
                    value={newVuelo.avion_id}
                    onChange={(e) => setNewVuelo({ ...newVuelo, avion_id: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 rounded px-2 py-1 w-full"
                  >
                    <option value="">Selecciona avión</option>
                    {aviones.map((avion) => (
                      <option key={avion.id} value={avion.id}>{avion.modelo || `ID ${avion.id}`}</option>
                    ))}
                  </select>
                </td>

                <td className="py-3 px-4">
                  <select
                    value={newVuelo.aeropuerto_origen_id}
                    onChange={(e) => setNewVuelo({ ...newVuelo, aeropuerto_origen_id: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 rounded px-2 py-1 w-full"
                  >
                    <option value="">Selecciona aeropuerto origen</option>
                    {aeropuertos.map((aeropuerto) => (
                      <option key={aeropuerto.id} value={aeropuerto.id}>
                        {aeropuerto.nombre || aeropuerto.codigo || `ID ${aeropuerto.id}`}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="py-3 px-4">
                  <select
                    value={newVuelo.aeropuerto_destino_id}
                    onChange={(e) => setNewVuelo({ ...newVuelo, aeropuerto_destino_id: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 rounded px-2 py-1 w-full"
                  >
                    <option value="">Selecciona aeropuerto destino</option>
                    {aeropuertos.map((aeropuerto) => (
                      <option key={aeropuerto.id} value={aeropuerto.id}>
                        {aeropuerto.nombre || aeropuerto.codigo || `ID ${aeropuerto.id}`}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="py-3 px-4">
                  <input
                    type="datetime-local"
                    value={newVuelo.fecha_salida}
                    onChange={(e) => setNewVuelo({ ...newVuelo, fecha_salida: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 rounded px-3 py-1 w-full"
                  />
                </td>

                <td className="py-3 px-4">
                  <input
                    type="datetime-local"
                    value={newVuelo.fecha_llegada}
                    onChange={(e) => setNewVuelo({ ...newVuelo, fecha_llegada: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 rounded px-3 py-1 w-full"
                  />
                </td>

                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={newVuelo.imagen}
                    onChange={(e) => setNewVuelo({ ...newVuelo, imagen: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 rounded px-3 py-1 w-full"
                    placeholder="URL de imagen"
                  />
                </td>

                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={newVuelo.destacado}
                    onChange={(e) => setNewVuelo({ ...newVuelo, destacado: e.target.checked })}
                  />
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded shadow"
                  >
                    Añadir vuelo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* —— Controles de paginación —— */}
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
          >
            Anterior
          </button>

          {[...Array(totalPages).keys()].map((n) => {
            const pageNum = n + 1;
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            } else if (
              pageNum === currentPage - 3 ||
              pageNum === currentPage + 3
            ) {
              return (
                <span key={`dots-${pageNum}`} className="px-3 py-1 text-gray-400">
                  …
                </span>
              );
            }
            return null;
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </main>
    </div>
  );
}
