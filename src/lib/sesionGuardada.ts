import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CLAVE = 'daytona_sesion';

export interface SesionGuardada {
  token: string;
  nombre: string | null;
  rol: string | null;
}

export async function guardarSesion(s: SesionGuardada): Promise<void> {
  const texto = JSON.stringify(s);
  try {
    if (Platform.OS === 'web') localStorage.setItem(CLAVE, texto);
    else await SecureStore.setItemAsync(CLAVE, texto);
  } catch {}
}

export async function borrarSesion(): Promise<void> {
  try {
    if (Platform.OS === 'web') localStorage.removeItem(CLAVE);
    else await SecureStore.deleteItemAsync(CLAVE);
  } catch {}
}

export async function leerSesion(): Promise<SesionGuardada | null> {
  try {
    const texto = Platform.OS === 'web'
      ? localStorage.getItem(CLAVE)
      : await SecureStore.getItemAsync(CLAVE);
    if (!texto) return null;

    const s = JSON.parse(texto) as SesionGuardada;
    if (!s?.token || tokenVencido(s.token)) {
      await borrarSesion();
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function tokenVencido(token: string): boolean {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return true;
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const relleno = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const datos = JSON.parse(atob(relleno));
    if (typeof datos.exp !== 'number') return false;
    return datos.exp * 1000 < Date.now() + 60_000;
  } catch {
    return true;
  }
}
