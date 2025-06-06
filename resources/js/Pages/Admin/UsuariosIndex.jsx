import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Header from '@/Components/Header';

export default function Usuarios({ users, roles }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role_id: '' });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role_id: '',
    password: '',
    password_confirmation: '',
  });

  const getRolNombre = (roleId) => {
    const rol = roles.find(r => String(r.id) === String(roleId));
    if (rol) {
      return rol.nombre;
    }
  };

  const startEditing = (user) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email, role_id: user.role_id });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', role_id: '' });
  };

const handleUpdate = (id) => {
  router.put(route('users.update', id), {
    ...formData,
    role_id: parseInt(formData.role_id, 10), // <- Convertimos a número
  });
  setEditingId(null);
};


  const handleDelete = (id) => {
    if (confirm('¿Seguro que quieres eliminar este usuario?')) {
      router.delete(route('users.destroy', id));
    }
  };

  const handleCreate = () => {
    router.post(route('users.store'), newUser);
    setNewUser({
      name: '',
      email: '',
      role_id: '',
      password: '',
      password_confirmation: '',
    });
  };

  return (
    <div>
      <Header activePage="usuarios" />
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Gestión de Usuarios</h1>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="text-white select-none" style={{ backgroundColor: '#004080' }}>
              <tr>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">ID</th>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">Nombre</th>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">Email</th>
<th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide min-w-[220px]">Rol</th>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400 italic">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}

              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                >
                  <td className="py-3 px-6 text-gray-700">{user.id}</td>
                  <td className="py-3 px-6">
                    {editingId === user.id ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{user.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    {editingId === user.id ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                      />
                    ) : (
                      <span className="text-gray-800">{user.email}</span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    {editingId === user.id ? (
                      <select
                        value={formData.role_id}
                        onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                      >
                        <option value="">Selecciona un rol</option>
                        {roles.map((rol) => (
                          <option key={rol.id} value={rol.id}>
                            {rol.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-800">
                        {getRolNombre(user.role_id)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 space-x-3 whitespace-nowrap">
                    {editingId === user.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(user.id)}
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
                          onClick={() => startEditing(user)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 font-semibold transition"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {/* Fila para crear nuevo usuario */}
              <tr className="border-t border-gray-100 bg-indigo-50">
                <td className="py-3 px-6 text-gray-600 font-semibold">—</td>
                <td className="py-3 px-6">
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                    placeholder="Nombre"
                  />
                </td>
                <td className="py-3 px-6">
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                    placeholder="Email"
                  />
                </td>
                <td className="py-3 px-6">
                  <select
                    value={newUser.role_id}
                    onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                  >
                    <option value="">Selecciona un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-6">
                  <input
                    type="password"
                    value={newUser.password || ''}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 mb-1 w-full transition"
                    placeholder="Contraseña"
                  />
                  <input
                    type="password"
                    value={newUser.password_confirmation || ''}
                    onChange={(e) => setNewUser({ ...newUser, password_confirmation: e.target.value })}
                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                    placeholder="Confirmar contraseña"
                  />
                  <button
                    onClick={handleCreate}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded shadow transition w-full"
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
