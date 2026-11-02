import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../lib/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
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
          <Stack.Screen name="venta/index" options={{ title: 'Venta' }} />
          <Stack.Screen name="venta/escanear" options={{ title: 'Escanear código' }} />
          <Stack.Screen name="venta/carrito" options={{ title: 'Carrito' }} />
          <Stack.Screen name="venta/confirmar" options={{ title: 'Confirmar venta' }} />
          <Stack.Screen name="venta/confirmacion" options={{ title: 'Venta registrada', headerBackVisible: false }} />
          <Stack.Screen name="ventas/index" options={{ title: 'Historial' }} />
          <Stack.Screen name="ventas/[id]" options={{ title: 'Comprobante' }} />
          <Stack.Screen name="repuesto/[id]" options={{ title: 'Ficha del repuesto' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
