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
