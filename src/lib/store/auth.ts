// lib/store/auth.ts
// Store de sesion con Zustand. El token vive aca y lo lee apiFetch.
// Cualquier pantalla puede saber quien esta logueado sin pasar props.

import { create } from 'zustand';

interface Sesion {
  token: string | null;
  nombre: string | null;
  rol: string | null;
}

interface AuthStore extends Sesion {
  login: (datos: Sesion) => void;
  logout: () => void;
  estaLogueado: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  nombre: null,
  rol: null,

  login: (datos) => set({ token: datos.token, nombre: datos.nombre, rol: datos.rol }),

  logout: () => set({ token: null, nombre: null, rol: null }),

  estaLogueado: () => !!get().token,
}));
