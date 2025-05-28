<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Billete de avión</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 14px;
        }

        h1,
        h2 {
            color: #2c3e50;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th,
        td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f5f5f5;
        }
    </style>
</head>

<body>
    <h1>Billete de avión - PNR: {{ $billete['pnr'] }}</h1>
    <h2>Datos del vuelo</h2>
    <p><strong>Origen:</strong> {{ $vuelo['origen'] }}</p>
    <p><strong>Destino:</strong> {{ $vuelo['destino'] }}</p>
    <p><strong>Fecha salida:</strong> {{ $vuelo['fecha_salida'] }}</p>
    <p><strong>Fecha llegada:</strong> {{ $vuelo['fecha_llegada'] }}</p>

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
            <th>Tarifa base</th>
            <td>{{ $billete['tarifa_base'] }} €</td>
        </tr>
        <tr>
            <th>Total</th>
            <td>{{ $billete['total'] }} €</td>
        </tr>
        <tr>
            <th>Maleta adicional</th>
            <td>{{ $billete['maleta_adicional'] ? 'Sí' : 'No' }}</td>
        </tr>
        <tr>
            <th>Cancelación flexible</th>
            <td>{{ $billete['cancelacion_flexible'] ? 'Sí' : 'No' }}</td>
        </tr>
        <tr>
            <th>Fecha reserva</th>
            <td>{{ $billete['fecha_reserva'] }}</td>
        </tr>
    </table>

    @if ($base64Svg)
        <h2>Código QR</h2>
        <img src="{{ $base64Svg }}" alt="Código QR" style="width:150px; height:150px;">
    @endif

</body>

</html>
