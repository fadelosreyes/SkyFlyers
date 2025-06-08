// resources/js/Pages/Destinos.jsx
import React from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/Components/Header';

export default function Destinos() {
  const destinos = [
    {
        title: 'GET YOUR GUIDE',
        subtitle: 'Recuerdos inolvidables de tu próximo viaje',
        image: '/img/destinos/city.jpg'

    },
    {
        title: 'Costa rica',
        subtitle: 'Descubre la Pura Vida',
        image: '/img/destinos/destinos_v2.jpg'
    },
    {
        title: 'Gran Canaria',
        subtitle: 'Una isla, miles de emociones #MuchoPorVivir',
        image: '/img/destinos/destinos.jpg'
    },
    {
        title: 'República Dominicana',
        subtitle: 'Siente la magia del Caribe',
        image: '/img/destinos/360x150_pod.jpg'
    },
    {
        title: 'Panama',
        subtitle: 'Despierta tu espíritu aventurero',
        image: '/img/destinos/destinos_v2_panama.jpg'
    },
    {
        title: 'Santa Cruz de Tenerife',
        subtitle: 'Descubre el corazón de Tenerife',
        image: '/img/destinos/Tenerife_Dest_pod3.jpg'
    },
    {
        title: 'Jordania',
        subtitle: 'Viaje maravilloso a la Tierra Santa',
        image: '/img/destinos/Jordania_Dest_360x150_pod_v2.jpg'
    },
    {
        title: 'MAanchester',
        subtitle: 'Imposible perdértelo',
        image: '/img/destinos/Manchester_destinos2_18410.jpg'
    },
    {
        title: 'Cataluña',
        subtitle: 'Vive el Grand Tour: un viaje, muchos caminos',
        image: '/img/destinos/Catalunya_Destinos_360x150_pod.jpg'
    },
    {
        title: 'Caribe',
        subtitle: 'Descubre una región única en el mundo',
        image: '/img/destinos/CaribeMexicano_destinos.jpg'
    },
    {
        title: 'Filadelfia',
        subtitle: 'Tu aventura americana empieza aquí!',
        image: '/img/destinos/Philadelphia_Dest360x150_pod.jpg'
    },
    {
        title: 'Euskadi - Basque Country',
        subtitle: 'Una ruta de caminos infinintos',
        image: '/img/destinos/Euskadu_Dest_360x150_pod4_V2.png' },
    {
        title: 'Portugal',
        subtitle: 'Vive momentos únicos',
        image: '/img/destinos/Dest_Portugal_pod4.jpg'
    },
    {
        title: 'Puerto Rico',
        subtitle: 'El corazón y el alma del Caribe',
        image: '/img/destinos/puerto-rico.jpg'
    },
    {
        title: 'Chihuahua',
        subtitle: 'Descubre Chihuahua, el México que no conoces',
        image: '/img/destinos/Chihuahua_dest_pod4.jpg'
    },
    {
        title: 'Catar',
        subtitle: 'Donde se unen la autenticidad y la modernidad',
        image: '/img/destinos/destinosQatarUK.jpg'
    },
    {
        title: 'Colorado',
        subtitle: 'Descubrimientos inesperados y aventuras únicas',
        image: '/img/destinos/destinos_es.jpg'
    },
    {
        title: 'Sudáfrica',
        subtitle: 'Un país lleno de historias',
        image: '/img/destinos/dest_South_Africa_360x150_pod.jpg'
    },
  ];

  return (
    <>
      <Head title="Destinos Recomendados" />
      <Header activePage="destinos" />

      <div
        className="w-full h-[30vh] bg-cover bg-center"
        style={{ backgroundImage: "url('/img/destinos/herobanner_desktop.png')" }}
      />

      <div className="mt-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600">
          ¿Estás planeando un viaje?
        </h1>
      </div>

      <div className="max-w-4xl mx-auto text-center py-12 px-4">
        <p className="text-xl text-gray-700 leading-relaxed">
          Nadie sabe más sobre un país o región que los expertos de las cámaras de turismo del lugar de destino. Por eso, nos hemos asociado con las cámaras de turismo oficiales de los destinos más recomendados de este año, para que puedas planear bien el viaje perfecto. A continuación encontrarás enlaces a toda la inspiración y las ideas que necesitarás sobre los mejores lugares a los que viajar, actividades que realizar, sitios que ver y mucho más...
          <span className="block mt-2 font-semibold">
            ¡Que disfrutes de la planificación de tu viaje!
          </span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinos.map((d, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden shadow-lg transform hover:shadow-2xl hover:-translate-y-1 transition cursor-default"
            >
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url('${d.image}')` }}
              />
              <div className="p-4 bg-white">
                <h2 className="text-xl font-semibold text-gray-800">{d.title}</h2>
                <p className="text-gray-600 mt-1">{d.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
