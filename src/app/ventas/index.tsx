// app/ventas/index.tsx — Historial de ventas
// FlatList con useQuery (clase 2 + 4). Tocar una venta navega al detalle
// con parametro de ruta (clase 1). Pull-to-refresh con refetch.

import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch, moneda } from '../../lib/api';
import { theme } from '../../lib/theme';
import { Pantalla } from '../../components/ui';
import { useSesion } from '../../lib/useSesion';

interface Venta {
  Id: number;
  Fecha: string;
  Cliente: string;
  Total: number;
  Estado: string;         // 'Activa' | 'Anulada'
  Vendedor?: string;
  PorcentajeDescuento?: number;
}

function fecha(v: string) {
  const d = new Date(v);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
function hora(v: string) {
  const d = new Date(v);
  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export default function Historial() {
  useSesion();
  const router = useRouter();

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['ventas'],
    queryFn: () => apiFetch<Venta[]>('Venta'),
    // Las mas nuevas primero
    select: (lista) => [...(lista ?? [])].sort((a, b) => b.Id - a.Id),
  });

  const ventas = data ?? [];

  if (isLoading) {
    return (
      <Pantalla>
        <View style={estilos.centro}><ActivityIndicator size="large" color={theme.colors.navy} /></View>
      </Pantalla>
    );
  }

  if (isError) {
    return (
      <Pantalla>
        <View style={estilos.centro}>
          <Ionicons name="cloud-offline-outline" size={44} color={theme.colors.muted} />
          <Text style={estilos.vacioTitulo}>No se pudo cargar</Text>
          <Text style={estilos.vacioTexto}>{(error as Error)?.message}</Text>
          <TouchableOpacity onPress={() => refetch()} style={estilos.reintentar}>
            <Text style={estilos.reintentarTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <FlatList
        data={ventas}
        keyExtractor={(v) => String(v.Id)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.navy} />}
        contentContainerStyle={ventas.length === 0 ? { flex: 1 } : undefined}
        ListEmptyComponent={
          <View style={estilos.centro}>
            <Ionicons name="receipt-outline" size={44} color={theme.colors.border} />
            <Text style={estilos.vacioTitulo}>Sin ventas todavía</Text>
          </View>
        }
        renderItem={({ item }) => {
          const anulada = String(item.Estado).toLowerCase().includes('anul');
          return (
            <TouchableOpacity
              style={[estilos.fila, anulada && estilos.filaAnulada]}
              onPress={() => router.push({ pathname: '/ventas/[id]', params: { id: String(item.Id) } })}
              accessibilityRole="button"
              accessibilityLabel={`Venta ${item.Id}, ${moneda(item.Total)}`}
            >
              <View style={estilos.izq}>
                <Text style={estilos.numero}>N° {String(item.Id).padStart(8, '0')}</Text>
                <Text style={estilos.cliente} numberOfLines={1}>{item.Cliente}</Text>
                <Text style={estilos.fecha}>{fecha(item.Fecha)} · {hora(item.Fecha)}</Text>
              </View>
              <View style={estilos.der}>
                <Text style={[estilos.total, anulada && estilos.totalAnulada]}>{moneda(item.Total)}</Text>
                {anulada ? (
                  <View style={estilos.pillAnulada}><Text style={estilos.pillAnuladaTexto}>ANULADA</Text></View>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  vacioTitulo: { fontSize: 16, fontWeight: '700', color: theme.colors.navy, marginTop: 6 },
  vacioTexto: { fontSize: 13, color: theme.colors.muted, textAlign: 'center' },
  reintentar: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, backgroundColor: theme.colors.accentSoft },
  reintentarTexto: { color: theme.colors.accent, fontWeight: '700' },

  fila: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 12 },
  filaAnulada: { opacity: 0.6 },
  izq: { flex: 1, minWidth: 0 },
  numero: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', color: theme.colors.navy, letterSpacing: 0.5 },
  cliente: { fontSize: 14, color: theme.colors.text, marginTop: 3 },
  fecha: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  der: { alignItems: 'flex-end', gap: 4 },
  total: { fontSize: 17, fontWeight: '800', color: theme.colors.navy },
  totalAnulada: { textDecorationLine: 'line-through', color: theme.colors.muted },
  pillAnulada: { backgroundColor: theme.colors.redSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  pillAnuladaTexto: { fontSize: 10, fontWeight: '700', color: theme.colors.red },
});
