import React, { useState, useMemo } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para ordenar
  const [sortBy, setSortBy] = useState(null); // 'name', 'email', 'role'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' o 'desc'

  const getRolNombre = (roleId) => {
    const rol = roles.find(r => String(r.id) === String(roleId));
    if (rol) {
      return rol.nombre;
    }
    return '';
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
      role_id: parseInt(formData.role_id, 10),
    });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (confirm('¿Seguro que quieres eliminar este usuario?')) {
      router.delete(route('users.destroy', id));
    }
  };

  // Cambiar ordenación al clickar cabecera
  const toggleSort = (column) => {
    if (sortBy === column) {
      // Cambiar orden
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Manejar creación con validación contraseñas
  const handleCreate = () => {
  // Validar campos vacíos
  if (
    !newUser.name.trim() ||
    !newUser.email.trim() ||
    !newUser.role_id ||
    !newUser.password ||
    !newUser.password_confirmation
  ) {
    alert('Todos los campos son obligatorios.');
    return;
  }

  // Validar que las contraseñas coincidan
  if (newUser.password !== newUser.password_confirmation) {
    alert('Las contraseñas no coinciden.');
    return;
  }

  // Aquí se enviaría el formulario
  router.post(route('users.store'), newUser);

  // Limpiar formulario
  setNewUser({
    name: '',
    email: '',
    role_id: '',
    password: '',
    password_confirmation: '',
  });
};


  // Filtrado memoizado
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let filtered = users.filter(user => {
      const nombre = user.name.toLowerCase();
      const email = user.email.toLowerCase();
      const rolNombre = getRolNombre(user.role_id).toLowerCase();
      return (
        nombre.includes(term) ||
        email.includes(term) ||
        rolNombre.includes(term)
      );
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;

        if (sortBy === 'name') {
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
        } else if (sortBy === 'email') {
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
        } else if (sortBy === 'role') {
          aVal = getRolNombre(a.role_id).toLowerCase();
          bVal = getRolNombre(b.role_id).toLowerCase();
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [searchTerm, users, roles, sortBy, sortOrder]);

  // Indicador de orden para la columna
  const renderSortIndicator = (column) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div>
      <Header activePage="usuarios" />
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Gestión de Usuarios</h1>

        {/* Input de búsqueda */}
        <div className="mb-4 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="text-white select-none" style={{ backgroundColor: '#004080' }}>
              <tr>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">ID</th>
                <th
                  className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer"
                  onClick={() => toggleSort('name')}
                >
                  Nombre{renderSortIndicator('name')}
                </th>
                <th
                  className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer"
                  onClick={() => toggleSort('email')}
                >
                  Email{renderSortIndicator('email')}
                </th>
                <th
                  className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide min-w-[220px] cursor-pointer"
                  onClick={() => toggleSort('role')}
                >
                  Rol{renderSortIndicator('role')}
                </th>
                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400 italic">
                    No hay usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              )}

              {filteredUsers.map((user) => (
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
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="mt-2 border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={newUser.password_confirmation}
                    onChange={(e) => setNewUser({ ...newUser, password_confirmation: e.target.value })}
                    className="mt-2 border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                  />
                </td>
                <td className="py-3 px-6">
                  <button
                    onClick={handleCreate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition"
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
