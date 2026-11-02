import { create } from 'zustand';

export interface ItemCarrito {
  IdRepuesto: number;
  Codigo: string;
  Descripcion: string;
  PrecioUnitario: number;
  Cantidad: number;
  StockDisponible: number;
}

function nuevoToken(): string {
  const c = (globalThis as any).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

interface CarritoStore {
  items: ItemCarrito[];
  tokenOperacion: string;

  agregar: (item: Omit<ItemCarrito, 'Cantidad'>) => { ok: boolean; motivo?: string };
  quitar: (idRepuesto: number) => void;
  cambiarCantidad: (idRepuesto: number, cantidad: number) => { ok: boolean; motivo?: string };
  vaciar: () => void;

  cantidadItems: () => number;
  subtotal: () => number;
}

export const useCarritoStore = create<CarritoStore>((set, get) => ({
  items: [],
  tokenOperacion: nuevoToken(),

  agregar: (item) => {
    const existente = get().items.find((i) => i.IdRepuesto === item.IdRepuesto);

    if (existente) {
      if (existente.Cantidad + 1 > existente.StockDisponible)
        return { ok: false, motivo: `Solo hay ${existente.StockDisponible} en stock.` };
      set({
        items: get().items.map((i) =>
          i.IdRepuesto === item.IdRepuesto ? { ...i, Cantidad: i.Cantidad + 1 } : i
        ),
      });
      return { ok: true };
    }

    if (item.StockDisponible <= 0)
      return { ok: false, motivo: 'Sin stock.' };

    set({ items: [...get().items, { ...item, Cantidad: 1 }] });
    return { ok: true };
  },

  quitar: (idRepuesto) =>
    set({ items: get().items.filter((i) => i.IdRepuesto !== idRepuesto) }),

  cambiarCantidad: (idRepuesto, cantidad) => {
    const item = get().items.find((i) => i.IdRepuesto === idRepuesto);
    if (!item) return { ok: false };

    if (cantidad <= 0) {
      get().quitar(idRepuesto);
      return { ok: true };
    }
    if (cantidad > item.StockDisponible)
      return { ok: false, motivo: `Solo hay ${item.StockDisponible} en stock.` };

    set({
      items: get().items.map((i) => (i.IdRepuesto === idRepuesto ? { ...i, Cantidad: cantidad } : i)),
    });
    return { ok: true };
  },

  vaciar: () => set({ items: [], tokenOperacion: nuevoToken() }),

  cantidadItems: () => get().items.reduce((s, i) => s + i.Cantidad, 0),
  subtotal: () => get().items.reduce((s, i) => s + i.Cantidad * i.PrecioUnitario, 0),
}));
