// lib/useSesion.ts
// Protege las pantallas: si no hay sesion, manda al login. Se usa en cada
// pantalla que requiere estar logueado. Si el token vence en medio de una
// operacion, apiFetch hace logout y este hook redirige solo.

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from './store/auth';

export function useSesion() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) router.replace('/');
  }, [token, router]);

  return !!token;
}
