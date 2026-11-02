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

export function partirDataSet<T>(ds: unknown): T[] {
  if (Array.isArray(ds)) return (ds[0] as T[]) ?? [];
  const o = ds as { Table?: T[] };
  return o?.Table ?? [];
}
