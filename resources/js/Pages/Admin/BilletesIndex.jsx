import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Header from '@/Components/Header';

export default function Index({ billetes, users, asientos }) {
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nombre_pasajero: '',
        documento_identidad: '',
        recargos: '',
        maleta_adicional: false,
        cancelacion_flexible: false,
    });
    const [searchNombre, setSearchNombre] = useState('');
    const [error, setError] = useState('');

    const startEditing = (billete) => {
        setEditingId(billete.id);
        setFormData({
            nombre_pasajero: billete.nombre_pasajero,
            documento_identidad: billete.documento_identidad,
            recargos: billete.recargos,
            maleta_adicional: billete.maleta_adicional,
            cancelacion_flexible: billete.cancelacion_flexible,
        });
        setError('');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setFormData({
            nombre_pasajero: '',
            documento_identidad: '',
            recargos: '',
            maleta_adicional: false,
            cancelacion_flexible: false,
        });
        setError('');
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('billetes.index'), { nombre_pasajero: searchNombre }, { preserveState: true, replace: true });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchNombre]);

    const handleUpdate = (id) => {
        if (!formData.nombre_pasajero.trim()) {
            setError('El nombre del pasajero es obligatorio');
            return;
        }
        router.put(route('billetes.update', id), formData);
        cancelEditing();
    };

    const handleDelete = (id) => {
        if (confirm('¿Seguro que quieres eliminar este billete?')) {
            router.delete(route('billetes.destroy', id));
        }
    };

    // Paginación
    const goToPage = (page) => {
        router.get(route('billetes.index'), { page, nombre_pasajero: searchNombre }, {
            preserveState: true,
            replace: true,
        });
    };

    const getPageRange = () => {
        const total = billetes.last_page;
        const current = billetes.current_page;
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
            <Header activePage="billetes" />
            <main className="p-6 mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Gestión de Billetes</h1>

                {error && <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>}

                <div className="mb-4 flex justify-center">
                    <input
                        type="text"
                        placeholder="Buscar por nombre pasajero"
                        value={searchNombre}
                        onChange={(e) => setSearchNombre(e.target.value)}
                        className="border rounded px-3 py-2 w-64"
                    />
                </div>

                <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                    <table className="min-w-full bg-white rounded-lg">
                        <thead className="text-white select-none" style={{ backgroundColor: '#004080' }}>
                            <tr>
                                <th className="py-3 px-6">ID</th>
                                <th className="py-3 px-6">Nombre Pasajero</th>
                                <th className="py-3 px-6">Documento</th>
                                <th className="py-3 px-6">Recargos (€)</th>
                                <th className="py-3 px-6">Maleta Adicional</th>
                                <th className="py-3 px-6">Cancelación Flexible</th>
                                <th className="py-3 px-6">Asiento</th>
                                <th className="py-3 px-6">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billetes.data.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="py-6 text-center text-gray-400 italic">
                                        No hay billetes registrados.
                                    </td>
                                </tr>
                            )}

                            {billetes.data.map((b) => {
                                const asiento = asientos.find(a => a.id === b.asiento_id);
                                return (
                                    <tr key={b.id} className="border-t hover:bg-indigo-50">
                                        <td className="py-3 px-6">{b.id}</td>
                                        <td className="py-3 px-6">
                                            {editingId === b.id ? (
                                                <input
                                                    type="text"
                                                    value={formData.nombre_pasajero}
                                                    onChange={(e) => setFormData({ ...formData, nombre_pasajero: e.target.value })}
                                                    className="border rounded px-2"
                                                />
                                            ) : (
                                                b.nombre_pasajero
                                            )}
                                        </td>
                                        <td className="py-3 px-6">
                                            {editingId === b.id ? (
                                                <input
                                                    type="text"
                                                    value={formData.documento_identidad}
                                                    onChange={(e) => setFormData({ ...formData, documento_identidad: e.target.value })}
                                                    className="border rounded px-2"
                                                />
                                            ) : (
                                                b.documento_identidad
                                            )}
                                        </td>
                                        <td className="py-3 px-6">
                                            {editingId === b.id ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.recargos}
                                                    onChange={(e) => setFormData({ ...formData, recargos: e.target.value })}
                                                    className="border rounded px-2"
                                                />
                                            ) : (
                                                `€${b.recargos}`
                                            )}
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            {editingId === b.id ? (
                                                <input
                                                    type="checkbox"
                                                    checked={formData.maleta_adicional}
                                                    onChange={(e) => setFormData({ ...formData, maleta_adicional: e.target.checked })}
                                                    className="transform scale-125"
                                                />
                                            ) : (
                                                b.maleta_adicional ? 'Sí' : 'No'
                                            )}
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            {editingId === b.id ? (
                                                <input
                                                    type="checkbox"
                                                    checked={formData.cancelacion_flexible}
                                                    onChange={(e) => setFormData({ ...formData, cancelacion_flexible: e.target.checked })}
                                                    className="transform scale-125"
                                                />
                                            ) : (
                                                b.cancelacion_flexible ? 'Sí' : 'No'
                                            )}
                                        </td>
                                        <td className="py-3 px-6">{asiento ? asiento.numero : '-'}</td>
                                        <td className="py-3 px-6 space-x-2">
                                            {editingId === b.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdate(b.id)}
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
                                                    <button onClick={() => startEditing(b)} className="text-indigo-600 font-semibold">
                                                        Editar
                                                    </button>
                                                    <button onClick={() => handleDelete(b.id)} className="text-red-600 font-semibold">
                                                        Eliminar
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <nav className="flex justify-center mt-6 space-x-2 select-none">
                    <button
                        disabled={billetes.current_page === 1}
                        onClick={() => goToPage(billetes.current_page - 1)}
                        className={`px-3 py-1 rounded border ${billetes.current_page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'
                            }`}
                    >
                        Anterior
                </button>

                    {getPageRange().map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-1 rounded border ${pageNum === billetes.current_page ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-100'
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button
                        disabled={billetes.current_page === billetes.last_page}
                        onClick={() => goToPage(billetes.current_page + 1)}
                        className={`px-3 py-1 rounded border ${billetes.current_page === billetes.last_page
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
