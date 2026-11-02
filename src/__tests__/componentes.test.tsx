import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Pestanas } from '../components/Pestanas';
import { FilaRepuesto } from '../components/FilaRepuesto';
import { Cobro, type MedioPago } from '../components/Cobro';
import type { RepuestoPropio } from '../lib/tipos';

const repuesto: RepuestoPropio = {
  Id: 10,
  Codigo: 'BOM-0010',
  Descripcion: 'Bomba de agua',
  CodigoFabricante: null,
  MarcaFabricante: 'SKF',
  Rubro: 'Motor',
  Stock: 3,
  StockMinimo: 1,
  PrecioCompra: null,
  PrecioDeVenta: 25000,
  EstadoStock: 'OK',
  ProveedoresDisponibles: 0,
  MejorCosto: null,
  MejorProveedor: null,
};

describe('Pestanas', () => {
  const pestanas = [
    { id: 'TODAS' as const, label: 'Todas' },
    { id: 'ANULADAS' as const, label: 'Anuladas' },
  ];

  it('muestra todas las pestañas', async () => {
    const { getByText } = await render(<Pestanas pestanas={pestanas} activa="TODAS" onChange={() => {}} />);
    expect(getByText('Todas')).toBeTruthy();
    expect(getByText('Anuladas')).toBeTruthy();
  });

  it('avisa qué pestaña se tocó', async () => {
    const onChange = jest.fn();
    const { getByTestId } = await render(<Pestanas pestanas={pestanas} activa="TODAS" onChange={onChange} />);
    await fireEvent.press(getByTestId('pestana-ANULADAS'));
    expect(onChange).toHaveBeenCalledWith('ANULADAS');
  });
});

describe('FilaRepuesto', () => {
  it('muestra código, stock y precio', async () => {
    const { getByText } = await render(<FilaRepuesto item={repuesto} enCarrito={0} onAgregar={() => {}} />);
    expect(getByText('BOM-0010')).toBeTruthy();
    expect(getByText('3 en stock')).toBeTruthy();
    expect(getByText(/25\.000,00/)).toBeTruthy();
  });

  it('al tocar + agrega el repuesto', async () => {
    const onAgregar = jest.fn();
    const { getByTestId } = await render(<FilaRepuesto item={repuesto} enCarrito={0} onAgregar={onAgregar} />);
    await fireEvent.press(getByTestId('agregar-10'));
    expect(onAgregar).toHaveBeenCalledWith(repuesto);
  });

  it('no deja agregar si ya está todo el stock en el carrito', async () => {
    const onAgregar = jest.fn();
    const { getByTestId, getByText } = await render(<FilaRepuesto item={repuesto} enCarrito={3} onAgregar={onAgregar} />);
    expect(getByText('3 en carrito')).toBeTruthy();
    await fireEvent.press(getByTestId('agregar-10'));
    expect(onAgregar).not.toHaveBeenCalled();
  });

  it('al tocar el repuesto abre la ficha', async () => {
    const onAbrir = jest.fn();
    const { getByTestId } = await render(<FilaRepuesto item={repuesto} enCarrito={0} onAgregar={() => {}} onAbrir={onAbrir} />);
    await fireEvent.press(getByTestId('repuesto-10'));
    expect(onAbrir).toHaveBeenCalledWith(repuesto);
  });
});

describe('Cobro', () => {
  const medios: MedioPago[] = [
    { Id: 1, Codigo: 'EFE', Nombre: 'Efectivo', ComisionPorc: 0 },
    { Id: 3, Codigo: 'QR', Nombre: 'QR', ComisionPorc: 1 },
  ];

  it('sin pagos pide elegir un medio', async () => {
    const { getByText } = await render(<Cobro medios={medios} pagos={[]} total={1000} onChange={() => {}} />);
    expect(getByText(/Tocá el medio/)).toBeTruthy();
  });

  it('al elegir un medio propone lo que falta', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(<Cobro medios={medios} pagos={[]} total={1000} onChange={onChange} />);
    await fireEvent.press(getByLabelText('Agregar QR'));
    expect(onChange).toHaveBeenCalledWith([
      { IdMedioPago: 3, Codigo: 'QR', Nombre: 'QR', ComisionPorc: 1, Monto: '1000' },
    ]);
  });

  it('muestra el vuelto cuando el efectivo supera el total', async () => {
    const pagos = [{ IdMedioPago: 1, Codigo: 'EFE', Nombre: 'Efectivo', ComisionPorc: 0, Monto: '1500' }];
    const { getByText } = await render(<Cobro medios={medios} pagos={pagos} total={1000} onChange={() => {}} />);
    expect(getByText(/Vuelto/)).toBeTruthy();
  });
});
