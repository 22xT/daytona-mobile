import { create } from 'zustand';
import { borrarSesion, guardarSesion } from '../sesionGuardada';

interface Sesion {
  token: string | null;
  nombre: string | null;
  rol: string | null;
}

interface AuthStore extends Sesion {
  login: (datos: Sesion, recordar?: boolean) => void;
  logout: () => void;
  estaLogueado: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  nombre: null,
  rol: null,

  login: (datos, recordar = false) => {
    set({ token: datos.token, nombre: datos.nombre, rol: datos.rol });
    if (recordar && datos.token) guardarSesion({ token: datos.token, nombre: datos.nombre, rol: datos.rol });
  },

  logout: () => {
    set({ token: null, nombre: null, rol: null });
    borrarSesion();
  },

  estaLogueado: () => !!get().token,
}));
