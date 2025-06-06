import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Header from '@/Components/Header';

export default function Index({ asientos, clases, estados, vuelos, filtroVueloId }) {
  // Estado para búsqueda por ID de vuelo, inicializado con filtro recibido desde backend
  const [searchVueloId, setSearchVueloId] = useState(filtroVueloId || '');

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    precio_base: '',
    vuelo_id: '',
    clase_id: '',
    estado_id: '',
  });
  const [error, setError] = useState('');

  const startEditing = (asiento) => {
    setEditingId(asiento.id);
    setFormData({ ...asiento });
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({
      numero: '',
      precio_base: '',
      vuelo_id: '',
      clase_id: '',
      estado_id: '',
    });
    setError('');
  };

  // Cuando cambia searchVueloId, hace una petición para filtrar asientos
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      router.get(
        route('asientos.index'),
        { vuelo_id: searchVueloId },
        { preserveState: true, replace: true }
      );
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchVueloId]);

  const handleUpdate = (id) => {
    router.put(route('asientos.update', id), formData);
    cancelEditing();
  };

  const handleDelete = (id) => {
    if (confirm('¿Seguro que quieres eliminar este asiento?')) {
      router.delete(route('asientos.destroy', id));
    }
  };

  const goToPage = (page) => {
    router.get(
      route('asientos.index'),
      { page, vuelo_id: searchVueloId },
      { preserveState: true, replace: true }
    );
  };

  const getPageRange = () => {
    const total = asientos.last_page;
    const current = asientos.current_page;
    const delta = 5;

    let start = current - delta;
    let end = current + delta;

    if (start < 1) {
      end += 1 - start;
      start = 1;
    }
    if (end > total) {
      start -= end - total;
      end = total;
    }
    if (start < 1) start = 1;

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div>
      <Header activePage="asientos" />
      <main className="p-6 mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Gestión de Asientos</h1>

        {error && <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>}

        <div className="mb-4 flex justify-center">
          <input
            type="number"
            placeholder="Buscar por ID de vuelo"
            value={searchVueloId}
            onChange={(e) => setSearchVueloId(e.target.value)}
            className="border rounded px-3 py-2 w-64"
          />
        </div>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="text-white select-none" style={{ backgroundColor: '#004080' }}>
              <tr>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Número</th>
                <th className="py-3 px-6">Precio</th>
                <th className="py-3 px-6">Vuelo</th>
                <th className="py-3 px-6">Clase</th>
                <th className="py-3 px-6">Estado</th>
                <th className="py-3 px-6">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asientos.data.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-400 italic">
                    No hay asientos registrados.
                  </td>
                </tr>
              )}

              {asientos.data.map((a) => (
                <tr key={a.id} className="border-t hover:bg-indigo-50">
                  <td className="py-3 px-6">{a.id}</td>
                  <td className="py-3 px-6">{a.numero}</td>
                  <td className="py-3 px-6">
                    {editingId === a.id ? (
                      <input
                        type="number"
                        value={formData.precio_base}
                        onChange={(e) => setFormData({ ...formData, precio_base: e.target.value })}
                        className="border rounded px-2"
                      />
                    ) : (
                      `€${a.precio_base}`
                    )}
                  </td>
                  <td className="py-3 px-6">{a.vuelo_id ? `Vuelo ${a.vuelo_id}` : '-'}</td>
                  <td className="py-3 px-6">{a.clase?.nombre || '-'}</td>
                  <td className="py-3 px-6">
                    {editingId === a.id ? (
                      <select
                        value={formData.estado_id}
                        onChange={(e) => setFormData({ ...formData, estado_id: e.target.value })}
                        className="border rounded px-2"
                      >
                        {estados.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      a.estado?.nombre || '-'
                    )}
                  </td>
                  <td className="py-3 px-6 space-x-2">
                    {editingId === a.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(a.id)}
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
                        <button onClick={() => startEditing(a)} className="text-indigo-600 font-semibold">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(a.id)} className="text-red-600 font-semibold">
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controles de paginación */}
        <nav className="flex justify-center mt-6 space-x-2 select-none">
          <button
            disabled={asientos.current_page === 1}
            onClick={() => goToPage(asientos.current_page - 1)}
            className={`px-3 py-1 rounded border ${
              asientos.current_page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            Anterior
          </button>

          {getPageRange().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`px-3 py-1 rounded border ${
                pageNum === asientos.current_page ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            disabled={asientos.current_page === asientos.last_page}
            onClick={() => goToPage(asientos.current_page + 1)}
            className={`px-3 py-1 rounded border ${
              asientos.current_page === asientos.last_page
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            Siguiente
          </button>
        </nav>
      </main>
    </div>
  );
}
