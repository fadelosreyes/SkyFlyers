import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Header from '@/Components/Header';

export default function Index({ aeropuertos, filters }) {
  // filtros + paginación
  const [search, setSearch] = useState(filters.search || '');
  const [sortBy, setSortBy] = useState(filters.sortBy || 'id');
  const [sortDir, setSortDir] = useState(filters.sortDir || 'asc');

  // Estado edición y creación igual que antes
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', ciudad: '', pais: '', codigo_iata: '' });
  const [newAeropuerto, setNewAeropuerto] = useState({ nombre: '', ciudad: '', pais: '', codigo_iata: '' });
  const [error, setError] = useState('');

  // Para que el input search no lance request en cada tecla, usamos debounce con useEffect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      router.get(route('aeropuertos.index'), { search, sortBy, sortDir }, { preserveState: true, replace: true });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search, sortBy, sortDir]);

  // Cambiar orden
  const changeSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  // Edición y creación igual que antes
  const startEditing = (aeropuerto) => {
    setEditingId(aeropuerto.id);
    setFormData({
      nombre: aeropuerto.nombre,
      ciudad: aeropuerto.ciudad,
      pais: aeropuerto.pais,
      codigo_iata: aeropuerto.codigo_iata
    });
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ nombre: '', ciudad: '', pais: '', codigo_iata: '' });
    setError('');
  };

  const handleUpdate = (id) => {
    if (!formData.nombre || !formData.ciudad || !formData.pais || !formData.codigo_iata) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setError('');
    router.put(route('aeropuertos.update', id), formData);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (confirm('¿Seguro que quieres eliminar este aeropuerto?')) {
      router.delete(route('aeropuertos.destroy', id));
    }
  };

  const handleCreate = () => {
    if (!newAeropuerto.nombre || !newAeropuerto.ciudad || !newAeropuerto.pais || !newAeropuerto.codigo_iata) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setError('');
    router.post(route('aeropuertos.store'), newAeropuerto);
    setNewAeropuerto({ nombre: '', ciudad: '', pais: '', codigo_iata: '' });
  };

  // Paginación: función para ir a página indicada
  const goToPage = (url) => {
    if (url) {
      router.get(url, {}, { preserveState: true, replace: true });
    }
  };

  // Renderizar icono orden (flecha arriba o abajo)
  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div>
      <Header activePage="aeropuertos" />
      <main className="p-6 mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Gestión de Aeropuertos</h1>

        <div className="mb-4 flex justify-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, ciudad, país o código IATA..."
            className="border rounded px-3 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {error && <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>}

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="text-white select-none" style={{ backgroundColor: '#004080' }}>
              <tr>
                <th
                  className="py-3 px-4 text-left text-sm uppercase cursor-pointer"
                  onClick={() => changeSort('id')}
                >
                  ID{renderSortIcon('id')}
                </th>
                <th
                  className="py-3 px-4 text-left text-sm uppercase cursor-pointer"
                  onClick={() => changeSort('nombre')}
                >
                  Nombre{renderSortIcon('nombre')}
                </th>
                <th
                  className="py-3 px-4 text-left text-sm uppercase cursor-pointer"
                  onClick={() => changeSort('ciudad')}
                >
                  Ciudad{renderSortIcon('ciudad')}
                </th>
                <th
                  className="py-3 px-4 text-left text-sm uppercase cursor-pointer"
                  onClick={() => changeSort('pais')}
                >
                  País{renderSortIcon('pais')}
                </th>
                <th
                  className="py-3 px-4 text-left text-sm uppercase cursor-pointer"
                  onClick={() => changeSort('codigo_iata')}
                >
                  Código IATA{renderSortIcon('codigo_iata')}
                </th>
                <th className="py-3 px-4 text-left text-sm uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {aeropuertos.data.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400 italic">
                    No hay aeropuertos registrados.
                  </td>
                </tr>
              )}
              {aeropuertos.data.map((a) => (
                <tr key={a.id} className="border-t border-gray-100 hover:bg-indigo-50 transition">
                  <td className="py-2 px-4">{a.id}</td>
                  <td className="py-2 px-4">
                    {editingId === a.id ? (
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="input"
                        autoFocus
                      />
                    ) : (
                      a.nombre
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingId === a.id ? (
                      <input
                        type="text"
                        value={formData.ciudad}
                        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                        className="input"
                      />
                    ) : (
                      a.ciudad
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingId === a.id ? (
                      <input
                        type="text"
                        value={formData.pais}
                        onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                        className="input"
                      />
                    ) : (
                      a.pais
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingId === a.id ? (
                      <input
                        type="text"
                        value={formData.codigo_iata}
                        onChange={(e) => setFormData({ ...formData, codigo_iata: e.target.value })}
                        className="input"
                      />
                    ) : (
                      a.codigo_iata
                    )}
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    {editingId === a.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(a.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(a)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {/* Fila de nuevo aeropuerto */}
              <tr className="border-t border-gray-100 bg-indigo-50">
                <td className="py-2 px-4">—</td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    value={newAeropuerto.nombre}
                    onChange={(e) => setNewAeropuerto({ ...newAeropuerto, nombre: e.target.value })}
                    className="input"
                    placeholder="Nombre"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    value={newAeropuerto.ciudad}
                    onChange={(e) => setNewAeropuerto({ ...newAeropuerto, ciudad: e.target.value })}
                    className="input"
                    placeholder="Ciudad"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    value={newAeropuerto.pais}
                    onChange={(e) => setNewAeropuerto({ ...newAeropuerto, pais: e.target.value })}
                    className="input"
                    placeholder="País"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    value={newAeropuerto.codigo_iata}
                    onChange={(e) => setNewAeropuerto({ ...newAeropuerto, codigo_iata: e.target.value })}
                    className="input"
                    placeholder="IATA"
                  />
                </td>
                <td className="py-2 px-4">
                  <button
                    onClick={handleCreate}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                  >
                    Crear
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <nav className="flex justify-center mt-4 space-x-2">
          {aeropuertos.links.map((link, index) => {
            // link.label contiene texto como "Previous", número o "Next"
            // link.url es null si está deshabilitado
            const isActive = link.active;
            const isDisabled = !link.url;

            return (
              <button
                key={index}
                onClick={() => goToPage(link.url)}
                disabled={isDisabled}
                className={`px-3 py-1 rounded border ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-100'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            );
          })}
        </nav>
      </main>
    </div>
  );
}
