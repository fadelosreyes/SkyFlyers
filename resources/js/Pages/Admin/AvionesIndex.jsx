import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import Header from '@/Components/Header';

export default function Index() {
    const { aviones, aerolineas, filters } = usePage().props;

    // Estados de búsqueda/orden
    const [search, setSearch] = useState(filters.search || '');
    const [sortField, setSortField] = useState(filters.sortField || 'id');
    const [sortDirection, setSortDirection] = useState(filters.sortDirection || 'asc');

    // Estados para CRUD
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        modelo: '',
        codigo_icao: '',
        matricula: '',
        aerolinea_id: '',
        filas_primera: '',
        asientos_por_fila_primera: '',
        filas_business: '',
        asientos_por_fila_business: '',
        filas_turista: '',
        asientos_por_fila_turista: '',
    });
    const [newAvion, setNewAvion] = useState({
        modelo: '',
        codigo_icao: '',
        matricula: '',
        aerolinea_id: '',
        filas_primera: '',
        asientos_por_fila_primera: '',
        filas_business: '',
        asientos_por_fila_business: '',
        filas_turista: '',
        asientos_por_fila_turista: '',
    });
    const [error, setError] = useState('');

    // Cuando cambie search/orden, recargar página 1 con parámetros
    useEffect(() => {
        router.get(
            route('aviones.index'),
            {
                search,
                sortField,
                sortDirection,
                page: 1,
            },
            { preserveState: true, replace: true }
        );
    }, [search, sortField, sortDirection]);

    // Función para cambiar página
    const changePage = (page) => {
        router.get(
            route('aviones.index'),
            {
                search,
                sortField,
                sortDirection,
                page,
            },
            { preserveState: true, replace: true }
        );
    };

    // Iniciar edición de un avión
    const startEditing = (a) => {
        setEditingId(a.id);
        setFormData({
            modelo: a.modelo,
            codigo_icao: a.codigo_icao,
            matricula: a.matricula,
            aerolinea_id: a.aerolinea_id,
            filas_primera: a.filas_primera || '',
            asientos_por_fila_primera: a.asientos_por_fila_primera || '',
            filas_business: a.filas_business || '',
            asientos_por_fila_business: a.asientos_por_fila_business || '',
            filas_turista: a.filas_turista || '',
            asientos_por_fila_turista: a.asientos_por_fila_turista || '',
        });
        setError('');
    };

    // Cancelar edición
    const cancelEditing = () => {
        setEditingId(null);
        setFormData({
            modelo: '',
            codigo_icao: '',
            matricula: '',
            aerolinea_id: '',
            filas_primera: '',
            asientos_por_fila_primera: '',
            filas_business: '',
            asientos_por_fila_business: '',
            filas_turista: '',
            asientos_por_fila_turista: '',
        });
        setError('');
    };

    // Verificar código ICAO duplicado
    const existsIcao = (codigo, excludeId = null) =>
        aviones.data.some(
            (x) => x.codigo_icao.toUpperCase() === codigo.toUpperCase() && x.id !== excludeId
        );

    // Verificar matrícula duplicada
    const existsMatricula = (mat, excludeId = null) =>
        aviones.data.some(
            (x) => x.matricula.toLowerCase() === mat.toLowerCase() && x.id !== excludeId
        );

    // Guardar edición de avión
    const handleUpdate = (id) => {
        const modeloTrim = formData.modelo.trim();
        const icaoTrim = formData.codigo_icao.trim().toUpperCase();
        const matTrim = formData.matricula.trim();

        if (!modeloTrim) {
            setError('El modelo no puede estar vacío.');
            return;
        }
        if (icaoTrim.length !== 4) {
            setError('El código ICAO debe tener exactamente 4 caracteres.');
            return;
        }
        if (!matTrim) {
            setError('La matrícula no puede estar vacía.');
            return;
        }
        if (!formData.aerolinea_id) {
            setError('Debes seleccionar una aerolínea.');
            return;
        }
        if (existsIcao(icaoTrim, id)) {
            setError('Ya existe un avión con ese código ICAO.');
            return;
        }
        if (existsMatricula(matTrim, id)) {
            setError('Ya existe un avión con esa matrícula.');
            return;
        }

        setError('');
        router.put(route('aviones.update', id), {
            modelo: modeloTrim,
            codigo_icao: icaoTrim,
            matricula: matTrim,
            aerolinea_id: formData.aerolinea_id,
            filas_primera: formData.filas_primera || null,
            asientos_por_fila_primera: formData.asientos_por_fila_primera || null,
            filas_business: formData.filas_business || null,
            asientos_por_fila_business: formData.asientos_por_fila_business || null,
            filas_turista: formData.filas_turista || null,
            asientos_por_fila_turista: formData.asientos_por_fila_turista || null,
        });
        setEditingId(null);
    };

    // Eliminar avión
    const handleDelete = (id) => {
        if (confirm('¿Seguro que quieres eliminar este avión?')) {
            router.delete(route('aviones.destroy', id));
        }
    };

    // Crear nuevo avión
    const handleCreate = () => {
        const modeloTrim = newAvion.modelo.trim();
        const icaoTrim = newAvion.codigo_icao.trim().toUpperCase();
        const matTrim = newAvion.matricula.trim();

        if (!modeloTrim) {
            setError('El modelo no puede estar vacío.');
            return;
        }
        if (icaoTrim.length !== 4) {
            setError('El código ICAO debe tener exactamente 4 caracteres.');
            return;
        }
        if (!matTrim) {
            setError('La matrícula no puede estar vacía.');
            return;
        }
        if (!newAvion.aerolinea_id) {
            setError('Debes seleccionar una aerolínea.');
            return;
        }
        if (existsIcao(icaoTrim)) {
            setError('Ya existe un avión con ese código ICAO.');
            return;
        }
        if (existsMatricula(matTrim)) {
            setError('Ya existe un avión con esa matrícula.');
            return;
        }

        setError('');
        router.post(route('aviones.store'), {
            modelo: modeloTrim,
            codigo_icao: icaoTrim,
            matricula: matTrim,
            aerolinea_id: newAvion.aerolinea_id,
            filas_primera: newAvion.filas_primera || null,
            asientos_por_fila_primera: newAvion.asientos_por_fila_primera || null,
            filas_business: newAvion.filas_business || null,
            asientos_por_fila_business: newAvion.asientos_por_fila_business || null,
            filas_turista: newAvion.filas_turista || null,
            asientos_por_fila_turista: newAvion.asientos_por_fila_turista || null,
        });
        setNewAvion({
            modelo: '',
            codigo_icao: '',
            matricula: '',
            aerolinea_id: '',
            filas_primera: '',
            asientos_por_fila_primera: '',
            filas_business: '',
            asientos_por_fila_business: '',
            filas_turista: '',
            asientos_por_fila_turista: '',
        });
    };

    // Cambiar ordenación
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
            <Header activePage="aviones" />
            <main className="p-6  mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Gestión de Aviones
                </h1>

                {error && <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>}

                {/* Buscador */}
                <div className="mb-4 flex justify-center">
                    <input
                        type="text"
                        placeholder="Buscar por modelo o matrícula..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-md border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* --- CONTENEDOR DE LA TABLA SIN SCROLL HORIZONTAL, BORDES REDONDOS --- */}
                <div className="shadow-lg border border-gray-200 rounded-2xl w-full overflow-hidden">
                    <table className="w-full table-auto bg-white">
                        <thead className="text-white select-none bg-indigo-900 rounded-t-2xl">
                            <tr>
                                <th
                                    onClick={() => changeSort('id')}
                                    className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer"
                                >
                                    ID{renderSortArrow('id')}
                                </th>
                                <th
                                    onClick={() => changeSort('modelo')}
                                    className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide cursor-pointer"
                                >
                                    Modelo{renderSortArrow('modelo')}
                                </th>
                                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">
                                    Código ICAO
                                </th>
                                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">
                                    Matrícula
                                </th>
                                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">
                                    Aerolínea
                                </th>
                                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">
                                    Filas / Asientos Primera
                                </th>
                                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">
                                    Filas / Asientos Business
                                </th>
                                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">
                                    Filas / Asientos Turista
                                </th>
                                <th className="py-3 px-6 text-left font-semibold text-sm uppercase tracking-wide">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {aviones.data.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="py-6 text-center text-gray-400 italic">
                                        No hay aviones registrados.
                                    </td>
                                </tr>
                            )}

                            {aviones.data.map((a) => (
                                <tr
                                    key={a.id}
                                    className="border-t border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                                >
                                    <td className="py-3 px-6 text-gray-700">{a.id}</td>

                                    {/* Modelo */}
                                    <td className="py-3 px-6">
                                        {editingId === a.id ? (
                                            <input
                                                type="text"
                                                value={formData.modelo}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, modelo: e.target.value })
                                                }
                                                className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="text-gray-800 font-medium">{a.modelo}</span>
                                        )}
                                    </td>

                                    {/* Código ICAO */}
                                    <td className="py-3 px-6">
                                        {editingId === a.id ? (
                                            <input
                                                type="text"
                                                value={formData.codigo_icao}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        codigo_icao: e.target.value.toUpperCase(),
                                                    })
                                                }
                                                maxLength={4}
                                                className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-24 transition"
                                            />
                                        ) : (
                                            <span className="text-gray-800 font-medium">{a.codigo_icao}</span>
                                        )}
                                    </td>

                                    {/* Matrícula */}
                                    <td className="py-3 px-6">
                                        {editingId === a.id ? (
                                            <input
                                                type="text"
                                                value={formData.matricula}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, matricula: e.target.value })
                                                }
                                                className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                                            />
                                        ) : (
                                            <span className="text-gray-800 font-medium">{a.matricula}</span>
                                        )}
                                    </td>

                                    {/* Aerolínea */}
                                    <td className="py-3 px-6">
                                        {editingId === a.id ? (
                                            <select
                                                value={formData.aerolinea_id}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, aerolinea_id: e.target.value })
                                                }
                                                className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                                            >
                                                <option value="">Selecciona una aerolínea</option>
                                                {aerolineas.map((ar) => (
                                                    <option key={ar.id} value={ar.id}>
                                                        {ar.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-gray-800 font-medium">
                                                {a.aerolinea?.nombre || '–'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Primera */}
                                    <td className="py-3 px-6">
                                        {editingId === a.id ? (
                                            <div className="flex space-x-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="F"
                                                    value={formData.filas_primera}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, filas_primera: e.target.value })
                                                    }
                                                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-2 py-1 w-16 transition"
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="A/F"
                                                    value={formData.asientos_por_fila_primera}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            asientos_por_fila_primera: e.target.value,
                                                        })
                                                    }
                                                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-2 py-1 w-16 transition"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-gray-800">
                                                {a.filas_primera != null
                                                    ? `${a.filas_primera}/${a.asientos_por_fila_primera}`
                                                    : '–'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Business */}
                                    <td className="py-3 px-6">
                                        {editingId === a.id ? (
                                            <div className="flex space-x-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="F"
                                                    value={formData.filas_business}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, filas_business: e.target.value })
                                                    }
                                                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-2 py-1 w-16 transition"
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="A/F"
                                                    value={formData.asientos_por_fila_business}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            asientos_por_fila_business: e.target.value,
                                                        })
                                                    }
                                                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-2 py-1 w-16 transition"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-gray-800">
                                                {a.filas_business != null
                                                    ? `${a.filas_business}/${a.asientos_por_fila_business}`
                                                    : '–'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Turista */}
                                    <td className="py-3 px-6">
                                        {editingId === a.id ? (
                                            <div className="flex space-x-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="F"
                                                    value={formData.filas_turista}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, filas_turista: e.target.value })
                                                    }
                                                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-2 py-1 w-16 transition"
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="A/F"
                                                    value={formData.asientos_por_fila_turista}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            asientos_por_fila_turista: e.target.value,
                                                        })
                                                    }
                                                    className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-2 py-1 w-16 transition"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-gray-800">
                                                {a.filas_turista != null
                                                    ? `${a.filas_turista}/${a.asientos_por_fila_turista}`
                                                    : '–'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td className="py-3 px-6 space-x-3 whitespace-nowrap">
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
                                                <button
                                                    onClick={() => startEditing(a)}
                                                    className="text-indigo-600 hover:text-indigo-900 font-semibold transition mr-4"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(a.id)}
                                                    className="text-red-600 hover:text-red-900 font-semibold transition"
                                                >
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {/* Fila para crear nuevo avión */}
                            <tr className="border-t border-gray-100 bg-indigo-50">
                                <td className="py-3 px-6 text-gray-600 font-semibold">—</td>

                                {/* Modelo */}
                                <td className="py-3 px-6">
                                    <input
                                        type="text"
                                        value={newAvion.modelo}
                                        onChange={(e) => setNewAvion({ ...newAvion, modelo: e.target.value })}
                                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                                        placeholder="Modelo"
                                    />
                                </td>

                                {/* Código ICAO */}
                                <td className="py-3 px-6">
                                    <input
                                        type="text"
                                        value={newAvion.codigo_icao}
                                        onChange={(e) =>
                                            setNewAvion({ ...newAvion, codigo_icao: e.target.value.toUpperCase() })
                                        }
                                        maxLength={4}
                                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-24 transition"
                                        placeholder="ICAO"
                                    />
                                </td>

                                {/* Matrícula */}
                                <td className="py-3 px-6">
                                    <input
                                        type="text"
                                        value={newAvion.matricula}
                                        onChange={(e) =>
                                            setNewAvion({ ...newAvion, matricula: e.target.value })
                                        }
                                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                                        placeholder="Matrícula"
                                    />
                                </td>

                                {/* Aerolínea */}
                                <td className="py-3 px-6">
                                    <select
                                        value={newAvion.aerolinea_id}
                                        onChange={(e) =>
                                            setNewAvion({ ...newAvion, aerolinea_id: e.target.value })
                                        }
                                        className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-3 py-1 w-full transition"
                                    >
                                        <option value="">Selecciona aerolínea</option>
                                        {aerolineas.map((ar) => (
                                            <option key={ar.id} value={ar.id}>
                                                {ar.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                {/* Primera */}
                                <td className="py-3 px-6">
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="F"
                                            value={newAvion.filas_primera}
                                            onChange={(e) =>
                                                setNewAvion({ ...newAvion, filas_primera: e.target.value })
                                            }
                                            className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-2 py-1 w-16 transition"
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="A/F"
                                            value={newAvion.asientos_por_fila_primera}
                                            onChange={(e) =>
                                                setNewAvion({
                                                    ...newAvion,
                                                    asientos_por_fila_primera: e.target.value,
                                                })
                                            }
                                            className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-2 py-1 w-16 transition"
                                        />
                                    </div>
                                </td>

                                {/* Business */}
                                <td className="py-3 px-6">
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="F"
                                            value={newAvion.filas_business}
                                            onChange={(e) =>
                                                setNewAvion({ ...newAvion, filas_business: e.target.value })
                                            }
                                            className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-2 py-1 w-16 transition"
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="A/F"
                                            value={newAvion.asientos_por_fila_business}
                                            onChange={(e) =>
                                                setNewAvion({
                                                    ...newAvion,
                                                    asientos_por_fila_business: e.target.value,
                                                })
                                            }
                                            className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-2 py-1 w-16 transition"
                                        />
                                    </div>
                                </td>

                                {/* Turista */}
                                <td className="py-3 px-6">
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="F"
                                            value={newAvion.filas_turista}
                                            onChange={(e) =>
                                                setNewAvion({ ...newAvion, filas_turista: e.target.value })
                                            }
                                            className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-2 py-1 w-16 transition"
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="A/F"
                                            value={newAvion.asientos_por_fila_turista}
                                            onChange={(e) =>
                                                setNewAvion({
                                                    ...newAvion,
                                                    asientos_por_fila_turista: e.target.value,
                                                })
                                            }
                                            className="border border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded px-2 py-1 w-16 transition"
                                        />
                                    </div>
                                </td>

                                {/* Crear */}
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

                {/* === Controles de Paginación === */}
                <div className="mt-4 flex justify-center items-center space-x-4 text-gray-700 select-none">
                    <button
                        onClick={() => changePage(aviones.current_page - 1)}
                        disabled={aviones.current_page === 1}
                        className={`px-4 py-2 rounded border ${aviones.current_page === 1
                                ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                                : 'text-gray-700 border-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        Anterior
                    </button>

                    <span>
                        Página {aviones.current_page} de {aviones.last_page}
                    </span>

                    <button
                        onClick={() => changePage(aviones.current_page + 1)}
                        disabled={aviones.current_page === aviones.last_page}
                        className={`px-4 py-2 rounded border ${aviones.current_page === aviones.last_page
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
