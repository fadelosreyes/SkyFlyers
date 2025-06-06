import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import Header from '@/Components/Header';

export default function Index() {
  const { aerolineas, paises, filters } = usePage().props;

  // Estados para búsqueda y ordenación
  const [search, setSearch] = useState(filters.search || '');
  const [sortField, setSortField] = useState(filters.sortField || 'id');
  const [sortDirection, setSortDirection] = useState(filters.sortDirection || 'asc');

  // CRUD local
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', codigo_iata: '', pais_id: '' });
  const [newAerolinea, setNewAerolinea] = useState({ nombre: '', codigo_iata: '', pais_id: '' });
  const [error, setError] = useState('');

  // -------------- Sincronización con backend --------------
  useEffect(() => {
    // Al cambiar búsqueda/orden, reseteamos a página 1 automáticamente
    router.get(
      route('aerolineas.index'),
      {
        search,
        sortField,
        sortDirection,
        page: 1,
      },
      {
        preserveState: true,
        replace: true,
      }
    );
  }, [search, sortField, sortDirection]);

  // Función para cambiar página
  const changePage = (page) => {
    router.get(
      route('aerolineas.index'),
      {
        search,
        sortField,
        sortDirection,
        page,
      },
      {
        preserveState: true,
        replace: true,
      }
    );
  };

  // --------------- Funciones CRUD en frontend ---------------
  const startEditing = (a) => {
    setEditingId(a.id);
    setFormData({
      nombre: a.nombre,
      codigo_iata: a.codigo_iata,
      pais_id: a.pais_id,
    });
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ nombre: '', codigo_iata: '', pais_id: '' });
    setError('');
  };

  const existsIata = (codigo, excludeId = null) =>
    aerolineas.data.some(
      (x) => x.codigo_iata.toUpperCase() === codigo.toUpperCase() && x.id !== excludeId
    );

  const handleUpdate = (id) => {
    const nombreTrim = formData.nombre.trim();
    const iataTrim   = formData.codigo_iata.trim().toUpperCase();

    if (!nombreTrim) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    if (iataTrim.length !== 2) {
      setError('El código IATA debe tener exactamente 2 caracteres.');
      return;
    }
    if (!formData.pais_id) {
      setError('Debes seleccionar un país.');
      return;
    }
    if (existsIata(iataTrim, id)) {
      setError('Ya existe una aerolínea con ese código IATA.');
      return;
    }

    setError('');
    router.put(route('aerolineas.update', id), {
      nombre: nombreTrim,
      codigo_iata: iataTrim,
      pais_id: formData.pais_id,
    });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (confirm('¿Seguro que quieres eliminar esta aerolínea?')) {
      router.delete(route('aerolineas.destroy', id));
    }
  };

  const handleCreate = () => {
    const nombreTrim = newAerolinea.nombre.trim();
    const iataTrim   = newAerolinea.codigo_iata.trim().toUpperCase();

    if (!nombreTrim) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    if (iataTrim.length !== 2) {
      setError('El código IATA debe tener exactamente 2 caracteres.');
      return;
    }
    if (!newAerolinea.pais_id) {
      setError('Debes seleccionar un país.');
      return;
    }
    if (existsIata(iataTrim)) {
      setError('Ya existe una aerolínea con ese código IATA.');
      return;
    }

    setError('');
    router.post(route('aerolineas.store'), {
      nombre: nombreTrim,
      codigo_iata: iataTrim,
      pais_id: newAerolinea.pais_id,
    });
    setNewAerolinea({ nombre: '', codigo_iata: '', pais_id: '' });
  };

  const changeSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortArrow = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div>
      <Header activePage="aerolineas" />
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Gestión de Aerolíneas
        </h1>

        {error && (
          <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>
        )}

        {/* Buscador */}
        <div className="mb-4 flex justify-center">
          <input
            type="text"
            placeholder="Buscar aerolínea por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="text-white select-none" style={{ backgroundColor: '#004080' }}>
              <tr>
                <th
                  onClick={() => changeSort('id')}
                  className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer"
                >
                  ID{renderSortArrow('id')}
                </th>
                <th
                  onClick={() => changeSort('nombre')}
                  className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer"
                >
                  Nombre{renderSortArrow('nombre')}
                </th>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">
                  Código IATA
                </th>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">
                  País
                </th>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {aerolineas.data.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400 italic">
                    No hay aerolíneas registradas.
                  </td>
                </tr>
              )}

              {aerolineas.data.map((aerolinea) => (
                <tr
                  key={aerolinea.id}
                  className="border-t border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                >
                  <td className="py-3 px-6 text-gray-700">{aerolinea.id}</td>
                  <td className="py-3 px-6">
                    {editingId === aerolinea.id ? (
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{aerolinea.nombre}</span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    {editingId === aerolinea.id ? (
                      <input
                        type="text"
                        value={formData.codigo_iata}
                        onChange={(e) =>
                          setFormData({ ...formData, codigo_iata: e.target.value.toUpperCase() })
                        }
                        maxLength={2}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-20 transition"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{aerolinea.codigo_iata}</span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    {editingId === aerolinea.id ? (
                      <select
                        value={formData.pais_id}
                        onChange={(e) => setFormData({ ...formData, pais_id: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                      >
                        <option value="">Selecciona un país</option>
                        {paises.map((pais) => (
                          <option key={pais.id} value={pais.id}>
                            {pais.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-800 font-medium">
                        {aerolinea.pais?.nombre || '–'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 space-x-3 whitespace-nowrap">
                    {editingId === aerolinea.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(aerolinea.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow transition"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded shadow transition"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(aerolinea)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold transition mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(aerolinea.id)}
                          className="text-red-600 hover:text-red-900 font-semibold transition"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {/* Fila para crear nueva aerolínea */}
              <tr className="border-t border-gray-100 bg-indigo-50">
                <td className="py-3 px-6 text-gray-600 font-semibold">—</td>
                <td className="py-3 px-6">
                  <input
                    type="text"
                    value={newAerolinea.nombre}
                    onChange={(e) => setNewAerolinea({ ...newAerolinea, nombre: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                    placeholder="Nombre de la aerolínea"
                  />
                </td>
                <td className="py-3 px-6">
                  <input
                    type="text"
                    value={newAerolinea.codigo_iata}
                    onChange={(e) =>
                      setNewAerolinea({ ...newAerolinea, codigo_iata: e.target.value.toUpperCase() })
                    }
                    maxLength={2}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-20 transition"
                    placeholder="Código IATA"
                  />
                </td>
                <td className="py-3 px-6">
                  <select
                    value={newAerolinea.pais_id}
                    onChange={(e) => setNewAerolinea({ ...newAerolinea, pais_id: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                  >
                    <option value="">Selecciona un país</option>
                    {paises.map((pais) => (
                      <option key={pais.id} value={pais.id}>
                        {pais.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-6">
                  <button
                    onClick={handleCreate}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded shadow transition"
                  >
                    Crear
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ==== Controles de paginación ==== */}
        <div className="mt-4 flex justify-center items-center space-x-4 text-gray-700 select-none">
          <button
            onClick={() => changePage(aerolineas.current_page - 1)}
            disabled={aerolineas.current_page === 1}
            className={`px-4 py-2 rounded border ${
              aerolineas.current_page === 1
                ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                : 'text-gray-700 border-gray-500 hover:bg-gray-100'
            }`}
          >
            Anterior
          </button>

          <span>
            Página {aerolineas.current_page} de {aerolineas.last_page}
          </span>

          <button
            onClick={() => changePage(aerolineas.current_page + 1)}
            disabled={aerolineas.current_page === aerolineas.last_page}
            className={`px-4 py-2 rounded border ${
              aerolineas.current_page === aerolineas.last_page
                ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                : 'text-gray-700 border-gray-500 hover:bg-gray-100'
            }`}
          >
            Siguiente
          </button>
        </div>
      </main>
    </div>
  );
}
