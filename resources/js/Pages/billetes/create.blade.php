@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Crear Billetes para {{ $numPasajeros }} pasajero(s)</h2>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <form action="{{ route('billetes.store') }}" method="POST">
        @csrf

        <input type="hidden" name="user_id" value="{{ auth()->user()->id }}">

        <!-- Datos fijos del billete -->
        <input type="hidden" name="asiento_id" value="{{ $asientoId }}">
        <input type="hidden" name="estado_id" value="{{ $estadoId }}">
        <input type="hidden" name="recargos" value="{{ $recargos ?? 0 }}">
        <input type="hidden" name="tarifa_base" value="{{ $tarifaBase }}">
        <input type="hidden" name="total" value="{{ $total }}">
        <input type="hidden" name="fecha_reserva" value="{{ $fechaReserva }}">
        <input type="hidden" name="fecha_emision" value="{{ $fechaEmision }}">

        @for ($i = 0; $i < $numPasajeros; $i++)
            <fieldset style="border:1px solid #ddd; padding:1em; margin-bottom:1em;">
                <legend>Pasajero {{ $i + 1 }}</legend>

                <div class="mb-3">
                    <label for="nombre_pasajero_{{ $i }}" class="form-label">Nombre completo</label>
                    <input type="text" name="nombre_pasajero[]" id="nombre_pasajero_{{ $i }}" class="form-control" required>
                    @error('nombre_pasajero.'.$i)
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>

                <div class="mb-3">
                    <label for="documento_identidad_{{ $i }}" class="form-label">Documento de identidad</label>
                    <input type="text" name="documento_identidad[]" id="documento_identidad_{{ $i }}" class="form-control" required>
                    @error('documento_identidad.'.$i)
                        <small class="text-danger">{{ $message }}</small>
                    @enderror
                </div>
            </fieldset>
        @endfor

        <button type="submit" class="btn btn-primary">Confirmar compra</button>
    </form>
</div>
@endsection
