import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Header from '@/Components/Header';

export default function Index({ paises, filters }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', codigo_iso: '' });
  const [newPais, setNewPais] = useState({ nombre: '', codigo_iso: '' });
  const [error, setError] = useState('');

  // Estados controlados sincronizados con filters (que vienen del backend)
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [sortField, setSortField] = useState(filters.sortField || 'nombre');
  const [sortOrder, setSortOrder] = useState(filters.sortOrder || 'asc');

  // Cuando cambie searchTerm, hacer fetch nuevo con debounce (opcional, aquí simple)
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(route('paises.index'), {
        search: searchTerm,
        sortField,
        sortOrder,
        page: 1,
      }, { preserveState: true, replace: true });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, sortField, sortOrder]);

  // Cambiar ordenación al pulsar cabecera y hacer fetch con parámetros nuevos
  const handleSort = (field) => {
    let newOrder = 'asc';
    if (sortField === field) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    setSortField(field);
    setSortOrder(newOrder);
    router.get(route('paises.index'), {
      search: searchTerm,
      sortField: field,
      sortOrder: newOrder,
      page: 1,
    }, { preserveState: true, replace: true });
  };

  // Cambiar página
  const changePage = (page) => {
    router.get(route('paises.index'), {
      search: searchTerm,
      sortField,
      sortOrder,
      page,
    }, { preserveState: true, replace: true });
  };

  // ... el resto de funciones handleUpdate, handleDelete, handleCreate igual

  // Mostrar flechas ordenación
  const renderSortArrow = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div>
      <Header activePage="paises" />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Gestión de Países</h1>

        {error && (
          <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>
        )}

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o código ISO..."
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="text-white select-none" style={{ backgroundColor: '#004080' }}>
              <tr>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">ID</th>
                <th
                  onClick={() => handleSort('nombre')}
                  className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer select-none"
                  title="Ordenar por Nombre"
                >
                  Nombre{renderSortArrow('nombre')}
                </th>
                <th
                  onClick={() => handleSort('codigo_iso')}
                  className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer select-none"
                  title="Ordenar por Código ISO"
                >
                  Código ISO{renderSortArrow('codigo_iso')}
                </th>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paises.data.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-400 italic">
                    No hay países registrados.
                  </td>
                </tr>
              )}

              {paises.data.map((pais) => (
                <tr
                  key={pais.id}
                  className="border-t border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                >
                  <td className="py-3 px-6 text-gray-700">{pais.id}</td>
                  <td className="py-3 px-6">
                    {editingId === pais.id ? (
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{pais.nombre}</span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    {editingId === pais.id ? (
                      <input
                        type="text"
                        value={formData.codigo_iso}
                        onChange={(e) => setFormData({ ...formData, codigo_iso: e.target.value })}
                        maxLength={2}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full uppercase transition"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium uppercase">{pais.codigo_iso}</span>
                    )}
                  </td>
                  <td className="py-3 px-6 space-x-3 whitespace-nowrap">
                    {editingId === pais.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(pais.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow transition"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded shadow transition"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(pais)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(pais.id)}
                          className="text-red-600 hover:text-red-900 font-semibold transition"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {/* Fila para crear nuevo país */}
              <tr className="border-t border-gray-100 bg-indigo-50">
                <td className="py-3 px-6 text-gray-600 font-semibold">—</td>
                <td className="py-3 px-6">
                  <input
                    type="text"
                    value={newPais.nombre}
                    onChange={(e) => setNewPais({ ...newPais, nombre: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                    placeholder="Nuevo país"
                  />
                </td>
                <td className="py-3 px-6">
                  <input
                    type="text"
                    value={newPais.codigo_iso}
                    onChange={(e) => setNewPais({ ...newPais, codigo_iso: e.target.value.toUpperCase() })}
                    maxLength={2}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full uppercase transition"
                    placeholder="Código ISO"
                  />
                </td>
                <td className="py-3 px-6">
                  <button
                    onClick={handleCreate}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1 rounded shadow transition"
                  >
                    Añadir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <nav
          className="mt-4 flex justify-center items-center gap-3 text-gray-700 select-none"
          aria-label="Paginación de países"
        >
          <button
            onClick={() => changePage(paises.prev_page_url ? paises.current_page - 1 : paises.current_page)}
            disabled={!paises.prev_page_url}
            className={`px-3 py-1 rounded ${
              paises.prev_page_url ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Anterior
          </button>
          <span>
            Página {paises.current_page} de {paises.last_page}
          </span>
          <button
            onClick={() => changePage(paises.next_page_url ? paises.current_page + 1 : paises.current_page)}
            disabled={!paises.next_page_url}
            className={`px-3 py-1 rounded ${
              paises.next_page_url ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Siguiente
          </button>
        </nav>
      </main>
    </div>
  );

  // Funciones para editar, eliminar, crear
  function startEditing(pais) {
    setEditingId(pais.id);
    setFormData({ nombre: pais.nombre, codigo_iso: pais.codigo_iso });
    setError('');
  }

  async function handleUpdate(id) {
    try {
      await router.put(route('paises.update', id), formData);
      setEditingId(null);
    } catch (err) {
      setError('Error al actualizar el país');
    }
  }

  async function handleDelete(id) {
    if (window.confirm('¿Estás seguro de eliminar este país?')) {
      try {
        await router.delete(route('paises.destroy', id));
        if (editingId === id) setEditingId(null);
      } catch {
        setError('Error al eliminar el país');
      }
    }
  }

  async function handleCreate() {
    if (!newPais.nombre.trim() || !newPais.codigo_iso.trim()) {
      setError('Nombre y código ISO son obligatorios');
      return;
    }
    try {
      await router.post(route('paises.store'), newPais);
      setNewPais({ nombre: '', codigo_iso: '' });
      setError('');
    } catch {
      setError('Error al crear el país');
    }
  }
}
