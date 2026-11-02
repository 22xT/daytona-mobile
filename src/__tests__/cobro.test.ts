import { estadoCobro, pagosARegistrar, aNumero, type PagoEnCurso } from '../components/Cobro';

const efectivo = (monto: string): PagoEnCurso => ({ IdMedioPago: 1, Codigo: 'EFE', Nombre: 'Efectivo', ComisionPorc: 0, Monto: monto });
const debito = (monto: string): PagoEnCurso => ({ IdMedioPago: 4, Codigo: 'DEB', Nombre: 'Débito', ComisionPorc: 2, Monto: monto });

describe('cobro', () => {
  it('convierte importes con coma', () => {
    expect(aNumero('1500,50')).toBe(1500.5);
    expect(aNumero('abc')).toBe(0);
  });

  it('con el total exacto en efectivo se puede registrar', () => {
    const e = estadoCobro([efectivo('1000')], 1000);
    expect(e.ok).toBe(true);
    expect(e.falta).toBe(0);
    expect(e.vuelto).toBe(0);
  });

  it('avisa cuánto falta', () => {
    const e = estadoCobro([efectivo('600')], 1000);
    expect(e.ok).toBe(false);
    expect(e.falta).toBe(400);
  });

  it('el efectivo de más se toma como vuelto', () => {
    const e = estadoCobro([efectivo('2000')], 1500);
    expect(e.ok).toBe(true);
    expect(e.vuelto).toBe(500);
    expect(pagosARegistrar([efectivo('2000')], 1500)).toEqual([{ IdMedioPago: 1, Monto: 1500 }]);
  });

  it('la tarjeta no puede superar el total', () => {
    const e = estadoCobro([debito('1200')], 1000);
    expect(e.ok).toBe(false);
    expect(e.excedeSinEfectivo).toBe(true);
  });

  it('pago mixto con comisión', () => {
    const pagos = [debito('500'), efectivo('600')];
    const e = estadoCobro(pagos, 1000);
    expect(e.ok).toBe(true);
    expect(e.vuelto).toBe(100);
    expect(e.comision).toBe(10);
    expect(pagosARegistrar(pagos, 1000)).toEqual([
      { IdMedioPago: 4, Monto: 500 },
      { IdMedioPago: 1, Monto: 500 },
    ]);
  });

  it('sin medios de pago no se puede registrar', () => {
    expect(estadoCobro([], 1000).ok).toBe(false);
  });
});
