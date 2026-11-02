import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../../lib/api';
import { theme } from '../../lib/theme';
import { Pantalla } from '../../components/ui';
import { useSesion } from '../../lib/useSesion';
import { Pestanas, type Pestana } from '../../components/Pestanas';
import { FilaVenta, type VentaResumen } from '../../components/FilaVenta';
import { TAMANO_PAGINA, siguientePagina } from '../../lib/paginacion';

type Filtro = 'TODAS' | 'ACTIVAS' | 'ANULADAS';

const PESTANAS: Pestana<Filtro>[] = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'ACTIVAS', label: 'Activas' },
  { id: 'ANULADAS', label: 'Anuladas' },
];

export default function Historial() {
  useSesion();
  const router = useRouter();
  const [filtro, setFiltro] = useState<Filtro>('TODAS');

  const {
    data, isLoading, isError, error, refetch, isRefetching,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['ventas', filtro],
    queryFn: ({ pageParam }) =>
      apiFetch<VentaResumen[]>(`Venta/Pagina?pagina=${pageParam}&tamano=${TAMANO_PAGINA}&estado=${filtro}`),
    initialPageParam: 1,
    getNextPageParam: (ultima, paginas) => siguientePagina(ultima ?? [], paginas),
  });

  const ventas = data?.pages.flatMap((p) => p ?? []) ?? [];
  const totalRegistros = Number(data?.pages[0]?.[0]?.TotalRegistros ?? 0);

  function abrir(v: VentaResumen) {
    router.push({
      pathname: '/ventas/[id]',
      params: { id: String(v.Id), fecha: v.Fecha, cliente: v.Cliente ?? '', total: String(v.Total), estado: v.Estado },
    });
  }

  function cargarMas() {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }

  let contenido;
  if (isLoading) {
    contenido = <View style={estilos.centro}><ActivityIndicator size="large" color={theme.colors.navy} /></View>;
  } else if (isError) {
    contenido = (
      <View style={estilos.centro}>
        <Ionicons name="cloud-offline-outline" size={44} color={theme.colors.muted} />
        <Text style={estilos.vacioTitulo}>No se pudo cargar</Text>
        <Text style={estilos.vacioTexto}>{(error as Error)?.message}</Text>
        <TouchableOpacity onPress={() => refetch()} style={estilos.reintentar}>
          <Text style={estilos.reintentarTexto}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    contenido = (
      <FlatList
        data={ventas}
        keyExtractor={(v) => String(v.Id)}
        renderItem={({ item }) => <FilaVenta venta={item} onPress={abrir} />}
        onEndReached={cargarMas}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={isRefetching && !isFetchingNextPage} onRefresh={refetch} tintColor={theme.colors.navy} />}
        contentContainerStyle={ventas.length === 0 ? { flex: 1 } : undefined}
        ListHeaderComponent={
          ventas.length > 0 ? (
            <Text style={estilos.contador}>
              Mostrando {ventas.length} de {totalRegistros} {totalRegistros === 1 ? 'venta' : 'ventas'}
            </Text>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: 18 }} color={theme.colors.navy} />
          ) : !hasNextPage && ventas.length > 0 ? (
            <Text style={estilos.fin}>No hay más ventas</Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={estilos.centro}>
            <Ionicons name="receipt-outline" size={44} color={theme.colors.border} />
            <Text style={estilos.vacioTitulo}>
              {filtro === 'ANULADAS' ? 'No hay ventas anuladas' : 'Sin ventas todavía'}
            </Text>
          </View>
        }
      />
    );
  }

  return (
    <Pantalla>
      <Pestanas pestanas={PESTANAS} activa={filtro} onChange={setFiltro} />
      {contenido}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  vacioTitulo: { fontSize: 16, fontWeight: '700', color: theme.colors.navy, marginTop: 6 },
  vacioTexto: { fontSize: 13, color: theme.colors.muted, textAlign: 'center' },
  reintentar: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, backgroundColor: theme.colors.accentSoft },
  reintentarTexto: { color: theme.colors.accent, fontWeight: '700' },
  contador: { fontSize: 12, color: theme.colors.muted, paddingHorizontal: 16, paddingVertical: 6 },
  fin: { fontSize: 12, color: theme.colors.muted, textAlign: 'center', marginVertical: 18 },
});
