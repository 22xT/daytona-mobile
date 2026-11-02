import { useCarritoStore } from '../lib/store/carrito';

const filtro = {
  IdRepuesto: 1,
  Codigo: 'FIL-0001',
  Descripcion: 'Filtro de aceite',
  PrecioUnitario: 1500,
  StockDisponible: 2,
};

beforeEach(() => {
  useCarritoStore.getState().vaciar();
});

describe('carrito', () => {
  it('agrega un repuesto con cantidad 1', () => {
    const res = useCarritoStore.getState().agregar(filtro);
    expect(res.ok).toBe(true);
    expect(useCarritoStore.getState().items).toHaveLength(1);
    expect(useCarritoStore.getState().items[0].Cantidad).toBe(1);
  });

  it('si el repuesto ya está, suma una unidad', () => {
    useCarritoStore.getState().agregar(filtro);
    useCarritoStore.getState().agregar(filtro);
    expect(useCarritoStore.getState().items).toHaveLength(1);
    expect(useCarritoStore.getState().cantidadItems()).toBe(2);
  });

  it('no deja pasar el stock disponible', () => {
    useCarritoStore.getState().agregar(filtro);
    useCarritoStore.getState().agregar(filtro);
    const res = useCarritoStore.getState().agregar(filtro);
    expect(res.ok).toBe(false);
    expect(res.motivo).toMatch(/2 en stock/);
    expect(useCarritoStore.getState().cantidadItems()).toBe(2);
  });

  it('no agrega un repuesto sin stock', () => {
    const res = useCarritoStore.getState().agregar({ ...filtro, IdRepuesto: 2, StockDisponible: 0 });
    expect(res.ok).toBe(false);
    expect(useCarritoStore.getState().items).toHaveLength(0);
  });

  it('cambiar la cantidad a 0 quita el ítem', () => {
    useCarritoStore.getState().agregar(filtro);
    useCarritoStore.getState().cambiarCantidad(1, 0);
    expect(useCarritoStore.getState().items).toHaveLength(0);
  });

  it('calcula el subtotal', () => {
    useCarritoStore.getState().agregar(filtro);
    useCarritoStore.getState().agregar({ ...filtro, IdRepuesto: 3, PrecioUnitario: 800, StockDisponible: 5 });
    useCarritoStore.getState().cambiarCantidad(3, 3);
    expect(useCarritoStore.getState().subtotal()).toBe(1500 + 2400);
  });

  it('vaciar genera un token de operación nuevo', () => {
    const antes = useCarritoStore.getState().tokenOperacion;
    useCarritoStore.getState().agregar(filtro);
    useCarritoStore.getState().vaciar();
    expect(useCarritoStore.getState().items).toHaveLength(0);
    expect(useCarritoStore.getState().tokenOperacion).not.toBe(antes);
  });
});
