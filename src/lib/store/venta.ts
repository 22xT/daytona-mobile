import { create } from 'zustand';

export type TipoCliente = 'Publico' | 'Mecanico';

interface VentaStore {
  tipoCliente: TipoCliente;
  descuento: number;

  setTipoCliente: (t: TipoCliente) => void;
  setDescuento: (d: number) => void;
  reset: () => void;
}

export const useVentaStore = create<VentaStore>((set) => ({
  tipoCliente: 'Publico',
  descuento: 0,

  setTipoCliente: (tipoCliente) => set({ tipoCliente }),
  setDescuento: (descuento) => set({ descuento }),
  reset: () => set({ tipoCliente: 'Publico', descuento: 0 }),
}));
