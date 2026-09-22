// lib/tipos.ts
// Formas de lo que devuelve la API, para que TypeScript ayude.

export interface RepuestoPropio {
  Id: number;
  Codigo: string;
  Descripcion: string;
  CodigoFabricante: string | null;
  MarcaFabricante: string | null;
  Rubro: string;
  Stock: number;
  StockMinimo: number;
  PrecioCompra: number | null;
  PrecioDeVenta: number;
  EstadoStock: 'OK' | 'Critico' | 'SinStock';
  ProveedoresDisponibles: number;
  MejorCosto: number | null;
  MejorProveedor: string | null;
}

// La API devuelve un DataSet: puede venir como array de tablas o como
// objeto con Table / Table1 segun la version. Se contemplan las dos.
export function partirDataSet<T>(ds: unknown): T[] {
  if (Array.isArray(ds)) return (ds[0] as T[]) ?? [];
  const o = ds as { Table?: T[] };
  return o?.Table ?? [];
}
