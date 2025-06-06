import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Header from '@/Components/Header';

export default function Index({ estados }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '' });
  const [newEstado, setNewEstado] = useState({ nombre: '' });
  const [error, setError] = useState('');

  const startEditing = (estado) => {
    setEditingId(estado.id);
    setFormData({ nombre: estado.nombre });
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ nombre: '' });
    setError('');
  };

  const handleUpdate = (id) => {
    const nombreTrimmed = formData.nombre.trim().toLowerCase();
    const exists = estados.some(
      (e) => e.nombre.toLowerCase() === nombreTrimmed && e.id !== id
    );
    if (exists) {
      setError('Ya existe un estado con ese nombre.');
      return;
    }
    if (!nombreTrimmed) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    setError('');
    router.put(route('estados.update', id), formData);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (confirm('¿Seguro que quieres eliminar este estado?')) {
      router.delete(route('estados.destroy', id));
    }
  };

  const handleCreate = () => {
    const nombreTrimmed = newEstado.nombre.trim().toLowerCase();
    const exists = estados.some((e) => e.nombre.toLowerCase() === nombreTrimmed);
    if (exists) {
      setError('Ya existe un estado con ese nombre.');
      return;
    }
    if (!nombreTrimmed) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    setError('');
    router.post(route('estados.store'), newEstado);
    setNewEstado({ nombre: '' });
  };

  return (
    <div>
      <Header activePage="estados" />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Gestión de Estados</h1>

        {error && (
          <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>
        )}

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="text-white select-none" style={{ backgroundColor: '#004080' }}>
              <tr>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">ID</th>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">Nombre</th>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estados.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-gray-400 italic">
                    No hay estados registrados.
                  </td>
                </tr>
              )}

              {estados.map((estado) => (
                <tr
                  key={estado.id}
                  className="border-t border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                >
                  <td className="py-3 px-6 text-gray-700">{estado.id}</td>
                  <td className="py-3 px-6">
                    {editingId === estado.id ? (
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ nombre: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{estado.nombre}</span>
                    )}
                  </td>
                  <td className="py-3 px-6 space-x-3 whitespace-nowrap">
                    {editingId === estado.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(estado.id)}
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
                          onClick={() => startEditing(estado)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(estado.id)}
                          className="text-red-600 hover:text-red-900 font-semibold transition"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {/* Fila para crear nuevo estado */}
              <tr className="border-t border-gray-100 bg-indigo-50">
                <td className="py-3 px-6 text-gray-600 font-semibold">—</td>
                <td className="py-3 px-6">
                  <input
                    type="text"
                    value={newEstado.nombre}
                    onChange={(e) => setNewEstado({ nombre: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                    placeholder="Nuevo estado"
                  />
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
      </main>
    </div>
  );
}
