// app/_layout.tsx
// Layout raiz. Envuelve toda la app con:
//  - QueryClientProvider: el cache de TanStack Query (clase 4)
//  - ThemeProvider: los colores de Daytona para styled-components (clase 1)
//  - Stack: navegacion por pila con expo-router (clase 1)

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../lib/theme';

// Se crea una sola vez. Mantiene el cache de todas las consultas.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,           // un reintento y listo: en mostrador no hay tiempo
      staleTime: 30_000,  // 30 s: los precios no cambian cada segundo
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.navy },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="recuperar" options={{ headerShown: false }} />
          <Stack.Screen name="venta/index" options={{ title: 'Nueva venta' }} />
          <Stack.Screen name="venta/carrito" options={{ title: 'Carrito' }} />
          <Stack.Screen name="venta/confirmar" options={{ title: 'Confirmar venta' }} />
          <Stack.Screen name="venta/confirmacion" options={{ title: 'Venta registrada', headerBackVisible: false }} />
          <Stack.Screen name="ventas/index" options={{ title: 'Historial' }} />
          <Stack.Screen name="ventas/[id]" options={{ title: 'Detalle de venta' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
