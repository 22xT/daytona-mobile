// lib/api.ts
// La direccion del backend se deduce sola: Metro sabe desde que host esta
// sirviendo la app (localhost en web, la IP de la PC en el celular), y la
// API vive en esa misma maquina en el puerto 52954. Asi funciona en web y
// en el celular sin tocar nada, y si cambia el WiFi se adapta solo.

import Constants from 'expo-constants';
import { useAuthStore } from './store/auth';

const PUERTO_API = 52954;

function resolverApiBase(): string {
  // hostUri viene como "192.168.0.70:8081" o "localhost:8081"
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:${PUERTO_API}/api/`;
  }
  // Sin Metro (build de produccion): valor fijo, cambiar al publicar
  return 'http://localhost:52954/api/';
}

export const API_BASE = resolverApiBase();

// Envuelve fetch agregando el token de sesion. Todas las llamadas a la
// API salvo el login pasan por aca.
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
    } catch { /* sin cuerpo */ }
    throw new Error(mensaje);
  }

  const texto = await respuesta.text();
  return (texto ? JSON.parse(texto) : null) as T;
}

// Formato argentino: $1.234,56
export function moneda(valor: number | string | null | undefined): string {
  const n = Number(valor ?? 0);
  if (isNaN(n)) return '$0,00';
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
