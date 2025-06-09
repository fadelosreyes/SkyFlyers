# SkyFlyers

SkyFlyers es una plataforma web avanzada para la reserva de billetes de avión, diseñada para ofrecer una experiencia de usuario rápida, sencilla y segura. Desde la búsqueda del vuelo hasta la selección de asientos, el pago y la descarga del billete en PDF con código QR, SkyFlyers integra todo lo necesario para planificar tu viaje en un solo lugar.

---

## ¿Qué ofrece SkyFlyers?

### Búsqueda de vuelos inteligente

- Permite buscar vuelos de ida o ida y vuelta.
- Filtro por fechas, aeropuerto de origen y destino.
- Selector de número de pasajeros.
- Autocompletado dinámico de aeropuertos.
- Validación de fechas con interfaz intuitiva.

### Selección de asientos interactiva

- Muestra el plano del avión y la disponibilidad de asientos en tiempo real.
- Permite seleccionar fácilmente los asientos para cada pasajero.
- Compatible con vuelos de ida y vuelta.

### Formulario de datos de pasajeros

- Recoge datos personales de manera clara y validada.
- Permite ingresar múltiples pasajeros en una misma reserva.
- Relación directa entre pasajero y asiento seleccionado.

### Pago seguro

- Integración completa con Stripe para pagos con tarjeta.
- Redirección mínima: el pago se realiza directamente desde la plataforma.
- Confirmación inmediata tras el pago exitoso.

### Generación de billetes

- Descarga automática de billetes en formato PDF.
- Cada billete incluye datos del pasajero, información del vuelo y un código QR único.
- Accesibles desde el panel del usuario.

### Recomendaciones de alojamiento

- Tras reservar, se genera automáticamente un enlace personalizado a Booking.com.
- Sugerencias de hoteles según el destino y las fechas del viaje.

### Notificaciones en tiempo real

- Recepción de notificaciones mediante tecnología push usando Pusher.
- Actualizaciones del estado del vuelo y del proceso de reserva.

### Panel de usuario

- Acceso a historial de reservas.
- Cancelación de billetes con reembolso automático (vía Stripe).
- Reimpresión o descarga de billetes.

---

## Gestión y administración

SkyFlyers no solo está diseñado para usuarios finales. También cuenta con funcionalidades avanzadas de gestión:

### Sistema de roles

- Roles diferenciados: Cliente, Empleado y Administrador.
- Control de accesos a cada sección según los permisos.

### Gestión CRUD

- Módulos para gestionar aeropuertos, vuelos, estados, asientos, aerolíneas y usuarios.
- Panel administrativo con vistas completas de todas las entidades.

### Funcionalidades internas

- Registro de permisos para empleados.
- Informe de días disponibles por empleado y generación de PDF.
- Filtros por año y tipo de concepto de permiso.

---

## Tecnologías utilizadas

- **Backend**: Laravel 10, PostgreSQL, Stripe API, Laravel Notifications
- **Frontend**: React.js con Inertia.js, Tailwind CSS, Axios
- **PDF y QR**: DomPDF, Simple QrCode
- **Tiempo real**: Pusher
- **Scraping**: Puppeteer (para sincronización de vuelos)
- **Autenticación**: Laravel Breeze con Inertia

---

## Instalación del proyecto

1. Clona el repositorio:
   ```bash
   git clone https://github.com/fadelosreyes/skyflyers.git
   cd skyflyers
