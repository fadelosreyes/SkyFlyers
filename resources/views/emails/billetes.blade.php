<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        :root {
            --primary: #1d3557;
            --secondary: #457b9d;
            --accent: #e63946;
            --text: #f1faee;
        }
        body {
            margin: 0;
            padding: 0;
            background-color: var(--primary);
            color: var(--text);
            font-family: Arial, sans-serif;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: auto;
            background-color: var(--secondary);
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: var(--primary);
            padding: 20px;
            text-align: center;
        }
        .header img {
            max-height: 50px;
        }
        .content {
            padding: 20px;
        }
        h1 {
            margin: 0 0 10px;
            font-size: 24px;
        }
        p {
            line-height: 1.5;
            margin: 10px 0;
        }
        .billete {
            background-color: var(--primary);
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .billete h2 {
            margin-top: 0;
            font-size: 18px;
            border-bottom: 1px solid var(--accent);
            padding-bottom: 5px;
        }
        .billete ul {
            list-style: none;
            padding: 0;
        }
        .billete li {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            background-color: var(--accent);
            color: var(--text);
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 4px;
            margin-top: 20px;
            font-weight: bold;
        }
        .footer {
            background-color: var(--primary);
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #a8dadc;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <!-- Puedes enlazar al logo real de tu proyecto -->
            <img src="{{ asset('img/_12534FEB-C593-4152-9369-72787BB3F5C6_-removebg-preview 2.png') }}" alt="Skyflyers">
        </div>
        <div class="content">
            <h1>¡Gracias por tu compra!</h1>
            <p>Hola {{ Auth::user()->name }},</p>
            <p>Te enviamos a continuación los detalles de tu(s) billete(s):</p>

            @foreach($billetes as $billete)
                <div class="billete">
                    <h2>Billete #{{ $billete['id'] }} – PNR: {{ $billete['pnr'] }}</h2>
                    <ul>
                        <li><strong>Pasajero:</strong> {{ $billete['nombre_pasajero'] }}</li>
                        <li><strong>Vuelo:</strong> {{ $billete['aeropuerto_origen'] }} → {{ $billete['aeropuerto_destino'] }}</li>
                        <li><strong>Salida:</strong> {{ $billete['vuelo_fecha_salida'] }}</li>
                        <li><strong>Llegada:</strong> {{ $billete['vuelo_fecha_llegada'] }}</li>
                        <li><strong>Asiento:</strong> {{ $billete['asiento_numero'] }}</li>
                    </ul>
                </div>
            @endforeach

            <p>Adjuntamos tus billetes en formato PDF para que puedas descargarlos o imprimirlos cuando quieras.</p>
            <p>¡Te deseamos un buen viaje!</p>
        </div>
        <div class="footer">
            © {{ date('Y') }} Skyflyers. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>
