import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Header from '@/Components/Header';

export default function Index({ roles }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '' });
  const [newRole, setNewRole] = useState({ nombre: '' });
  const [error, setError] = useState('');

  const startEditing = (role) => {
    setEditingId(role.id);
    setFormData({ nombre: role.nombre });
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ nombre: '' });
    setError('');
  };

  const handleUpdate = (id) => {
    const nombreTrimmed = formData.nombre.trim().toLowerCase();
    // Validar que no haya otro rol con el mismo nombre (excepto el que estamos editando)
    const exists = roles.some(
      (r) => r.nombre.toLowerCase() === nombreTrimmed && r.id !== id
    );
    if (exists) {
      setError('Ya existe un rol con ese nombre.');
      return;
    }
    if (!nombreTrimmed) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    setError('');
    router.put(route('roles.update', id), formData);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (confirm('¿Seguro que quieres eliminar este rol?')) {
      router.delete(route('roles.destroy', id));
    }
  };

  const handleCreate = () => {
    const nombreTrimmed = newRole.nombre.trim().toLowerCase();
    // Validar que no haya otro rol con el mismo nombre
    const exists = roles.some((r) => r.nombre.toLowerCase() === nombreTrimmed);
    if (exists) {
      setError('Ya existe un rol con ese nombre.');
      return;
    }
    if (!nombreTrimmed) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    setError('');
    router.post(route('roles.store'), newRole);
    setNewRole({ nombre: '' });
  };

  return (
    <div>
      <Header activePage="roles" />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Gestión de Roles</h1>

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
              {roles.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-gray-400 italic">
                    No hay roles registrados.
                  </td>
                </tr>
              )}

              {roles.map((role) => (
                <tr
                  key={role.id}
                  className="border-t border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                >
                  <td className="py-3 px-6 text-gray-700">{role.id}</td>
                  <td className="py-3 px-6">
                    {editingId === role.id ? (
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ nombre: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{role.nombre}</span>
                    )}
                  </td>
                  <td className="py-3 px-6 space-x-3 whitespace-nowrap">
                    {editingId === role.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(role.id)}
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
                          onClick={() => startEditing(role)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="text-red-600 hover:text-red-900 font-semibold transition"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {/* Fila para crear nuevo rol */}
              <tr className="border-t border-gray-100 bg-indigo-50">
                <td className="py-3 px-6 text-gray-600 font-semibold">—</td>
                <td className="py-3 px-6">
                  <input
                    type="text"
                    value={newRole.nombre}
                    onChange={(e) => setNewRole({ nombre: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                    placeholder="Nuevo rol"
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
