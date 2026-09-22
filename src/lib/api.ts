// lib/api.ts
// UNICO lugar donde vive la direccion del backend, igual que config.js
// en el frontend web. Para probar desde el celular por red local se cambia
// solo esta linea por la IP de la PC: http://192.168.x.x:52954/api/

import { useAuthStore } from './store/auth';

export const API_BASE = 'http://localhost:52954/api/';

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

  // Sesion vencida: se limpia y la pantalla decide que hacer
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
