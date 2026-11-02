import Constants from 'expo-constants';
import { useAuthStore } from './store/auth';

const PUERTO_API = 52954;

function resolverApiBase(): string {
  const desdeEnv = process.env.EXPO_PUBLIC_API_URL;
  if (desdeEnv) return desdeEnv.endsWith('/') ? desdeEnv : desdeEnv + '/';

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:${PUERTO_API}/api/`;
  }
  return `http://localhost:${PUERTO_API}/api/`;
}

export const API_BASE = resolverApiBase();

export async function apiFetch<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opciones.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const respuesta = await fetch(API_BASE + ruta, { ...opciones, headers });

  if (respuesta.status === 401) {
    useAuthStore.getState().logout();
    throw new Error('La sesión venció. Volvé a iniciar sesión.');
  }

  if (!respuesta.ok) {
    let mensaje = 'No se pudo completar la operación.';
    try {
      const cuerpo = await respuesta.json();
      mensaje = cuerpo.Message || cuerpo.message || mensaje;
    } catch {}
    throw new Error(mensaje);
  }

  const texto = await respuesta.text();
  return (texto ? JSON.parse(texto) : null) as T;
}

export function moneda(valor: number | string | null | undefined): string {
  const n = Number(valor ?? 0);
  if (isNaN(n)) return '$0,00';
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
