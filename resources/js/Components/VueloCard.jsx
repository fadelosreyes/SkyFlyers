import React from 'react';
import PrimaryButton from './PrimaryButton';

const VueloCard = ({ vuelo }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <figure className="mb-4">
                <img
                    src={vuelo.imagen}
                    alt={`Vuelo de ${vuelo.origen} a ${vuelo.destino}`}
                    className="rounded-md w-full h-48 object-cover"
                />
            </figure>
            <h3 className="text-lg font-semibold">{vuelo.origen} → {vuelo.destino}</h3>
            <p className="text-sm text-gray-600">Fecha: {new Date(vuelo.fecha).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Duración: {vuelo.duracion}</p>
            <p className="text-xl font-bold text-indigo-600 mt-2">{vuelo.precio} €</p>
            <PrimaryButton className="mt-4">Ver vuelo</PrimaryButton>
        </div>
    );
};

export default VueloCard;
