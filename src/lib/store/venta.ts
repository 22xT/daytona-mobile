// lib/store/venta.ts
// Opciones de la venta en curso que no son items: tipo de cliente y
// descuento. Van en Zustand porque las elige la pantalla de carrito y las
// lee la de confirmacion. Se resetean junto con el carrito.

import { create } from 'zustand';

export type TipoCliente = 'Publico' | 'Mecanico';

interface VentaStore {
  tipoCliente: TipoCliente;
  descuento: number;          // porcentaje, 0 = sin descuento

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
