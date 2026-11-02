import { moneda } from '../lib/api';
import { esAnulada, numeroComprobante } from '../lib/formato';
import { siguientePagina } from '../lib/paginacion';
import { normalizarAtributo, sugerencias, validarAtributo } from '../lib/fichaTecnica';

describe('formato', () => {
  it('moneda en formato argentino', () => {
    expect(moneda(1234.5)).toMatch(/^\$1\.234,50$/);
    expect(moneda(null)).toBe('$0,00');
    expect(moneda('no')).toBe('$0,00');
  });

  it('número de comprobante con 8 dígitos', () => {
    expect(numeroComprobante(57)).toBe('N° 00000057');
  });

  it('reconoce una venta anulada', () => {
    expect(esAnulada('Anulada')).toBe(true);
    expect(esAnulada('Activa')).toBe(false);
    expect(esAnulada(null)).toBe(false);
  });
});

describe('paginación del historial', () => {
  it('pide la página siguiente si la última vino completa', () => {
    expect(siguientePagina(new Array(20), [new Array(20)])).toBe(2);
  });

  it('corta cuando la última página vino incompleta', () => {
    expect(siguientePagina(new Array(7), [new Array(20), new Array(7)])).toBeUndefined();
  });
});

describe('ficha técnica', () => {
  it('normaliza el nombre del dato', () => {
    expect(normalizarAtributo('  medida   exterior ')).toBe('Medida exterior');
    expect(normalizarAtributo('   ')).toBe('');
  });

  it('no sugiere datos que el repuesto ya tiene ni repetidos', () => {
    const s = sugerencias(['rosca', 'Diámetro'], ['Medida']);
    expect(s).not.toContain('Medida');
    expect(s.filter((x) => x === 'Rosca')).toHaveLength(1);
    expect(s).toContain('Diámetro');
  });

  it('valida que haya dato y valor', () => {
    expect(validarAtributo('', '10 mm')).toMatch(/nombre/);
    expect(validarAtributo('Medida', '  ')).toMatch(/valor/);
    expect(validarAtributo('Medida', '10 mm')).toBeNull();
  });
});
