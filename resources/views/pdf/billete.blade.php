<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <title>Billete de avión</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            background: #f2f2f2;
            margin: 0;
            padding: 30px;
        }
        .billete {
            background: #ffffff;
            border: 2px dashed #3498db; 
            border-radius: 12px;
            max-width: 800px;
            margin: auto;
            padding: 30px;
            position: relative;
        }
        .billete::before,
        .billete::after {
            content: '';
            position: absolute;
            width: 25px;
            height: 25px;
            background: #f2f2f2;
            border-radius: 50%;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1;
        }

        .billete::before {
            left: -14px;
        }

        .billete::after {
            right: -14px;
        }

        h1, h2 {
            color: #2c3e50;
            margin-bottom: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 20px;
        }

        th, td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
        }

        th {
            background-color: #e6f0fa;
            color: #2c3e50;
            width: 40%;
        }

        .qr {
            text-align: center;
            margin-top: 30px;
        }

        .qr img {
            width: 150px;
            height: 150px;
        }

        .separador {
            border-top: 1px dashed #ccc;
            margin: 20px 0;
        }
    </style>
</head>

<body>
    <div class="billete">
        <h1>Billete de avión - PNR: {{ $billete['pnr'] }}</h1>

        <div class="separador"></div>

        <h2>Datos del vuelo</h2>
        <p><strong>Origen:</strong> {{ $vuelo['origen'] }}</p>
        <p><strong>Destino:</strong> {{ $vuelo['destino'] }}</p>
        <p><strong>Fecha salida:</strong> {{ $vuelo['fecha_salida'] }}</p>
        <p><strong>Fecha llegada:</strong> {{ $vuelo['fecha_llegada'] }}</p>

        <div class="separador"></div>

        <h2>Datos del pasajero</h2>
        <table>
            <tr>
                <th>Nombre</th>
                <td>{{ $billete['nombre_pasajero'] }}</td>
            </tr>
            <tr>
                <th>Documento</th>
                <td>{{ $billete['documento_identidad'] }}</td>
            </tr>
            <tr>
                <th>Asiento</th>
                <td>{{ $billete['asiento_numero'] }}</td>
            </tr>
        </table>

        <h2>Detalles de la reserva</h2>
        <table>
            <tr>
                <th>Maleta adicional</th>
                <td>{{ $billete['maleta_adicional'] ? 'Sí' : 'No' }}</td>
            </tr>
            <tr>
                <th>Cancelación flexible</th>
                <td>{{ $billete['cancelacion_flexible'] ? 'Sí' : 'No' }}</td>
            </tr>
            <tr>
                <th>Fecha de reserva</th>
                <td>{{ $billete['fecha_reserva'] }}</td>
            </tr>
        </table>

        @if ($base64Svg)
            <div class="qr">
                <h2>Código QR</h2>
                <img src="{{ $base64Svg }}" alt="Código QR">
            </div>
        @endif
    </div>
</body>

</html>
