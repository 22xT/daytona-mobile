import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../../lib/api';
import { theme } from '../../lib/theme';
import { useAuthStore } from '../../lib/store/auth';
import { useCarritoStore } from '../../lib/store/carrito';
import { partirDataSet, type RepuestoPropio } from '../../lib/tipos';
import { Pantalla } from '../../components/ui';
import { useSesion } from '../../lib/useSesion';
import { FilaRepuesto } from '../../components/FilaRepuesto';
import { BadgeCarrito } from '../../components/BadgeCarrito';
import { avisar, confirmar } from '../../lib/avisar';

const MIN_LETRAS = 3;

function useDebounce(valor: string, ms: number) {
  const [d, setD] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setD(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return d;
}

export default function Buscador() {
  useSesion();
  const router = useRouter();
  const { codigo } = useLocalSearchParams<{ codigo?: string }>();
  const logout = useAuthStore((s) => s.logout);

  const items = useCarritoStore((s) => s.items);
  const agregar = useCarritoStore((s) => s.agregar);
  const cantidadEnCarrito = items.reduce((s, i) => s + i.Cantidad, 0);

  const [texto, setTexto] = useState('');
  const textoBuscado = useDebounce(texto.trim(), 350);
  const buscaActiva = textoBuscado.length >= MIN_LETRAS;

  useEffect(() => {
    if (codigo) setTexto(String(codigo));
  }, [codigo]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['busqueda', textoBuscado],
    queryFn: () => apiFetch<unknown>('Busqueda?texto=' + encodeURIComponent(textoBuscado)),
    enabled: buscaActiva,
    select: (ds) => partirDataSet<RepuestoPropio>(ds),
  });

  const resultados = data ?? [];

  const enCarrito = useCallback(
    (id: number) => items.find((i) => i.IdRepuesto === id)?.Cantidad ?? 0,
    [items]
  );

  function onAgregar(r: RepuestoPropio) {
    const res = agregar({
      IdRepuesto: r.Id,
      Codigo: r.Codigo,
      Descripcion: r.Descripcion,
      PrecioUnitario: Number(r.PrecioDeVenta),
      StockDisponible: Number(r.Stock),
    });
    if (!res.ok) avisar('No se pudo agregar', res.motivo ?? '');
  }

  function onAbrir(r: RepuestoPropio) {
    router.push({
      pathname: '/repuesto/[id]',
      params: {
        id: String(r.Id),
        codigo: r.Codigo,
        descripcion: r.Descripcion,
        marca: r.MarcaFabricante ?? '',
        rubro: r.Rubro ?? '',
        stock: String(r.Stock),
        precio: String(r.PrecioDeVenta),
      },
    });
  }

  function salir() {
    confirmar('Cerrar sesión', '¿Salir del sistema?', 'Salir', () => {
      logout();
      router.replace('/');
    });
  }

  return (
    <Pantalla>
      <Stack.Screen
        options={{
          title: 'Venta',
          headerRight: () => (
            <View style={estilos.headerDerecha}>
              <TouchableOpacity onPress={() => router.push('/ventas')} hitSlop={8} accessibilityLabel="Historial">
                <Ionicons name="time-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/venta/carrito')} hitSlop={8} accessibilityLabel={`Carrito, ${cantidadEnCarrito} ítems`}>
                <Ionicons name="cart-outline" size={26} color="#fff" />
                <BadgeCarrito cantidad={cantidadEnCarrito} />
              </TouchableOpacity>
              <TouchableOpacity onPress={salir} hitSlop={8} accessibilityLabel="Cerrar sesión">
                <Ionicons name="log-out-outline" size={24} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={estilos.buscador}>
        <Ionicons name="search" size={20} color={theme.colors.muted} />
        <TextInput
          style={estilos.input}
          value={texto}
          onChangeText={setTexto}
          placeholder="Código, descripción o marca…"
          placeholderTextColor={theme.colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Buscar repuesto"
        />
        {texto.length > 0 ? (
          <TouchableOpacity onPress={() => setTexto('')} hitSlop={8} accessibilityLabel="Limpiar búsqueda">
            <Ionicons name="close-circle" size={20} color={theme.colors.muted} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={() => router.push('/venta/escanear')}
          style={estilos.escanear}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Escanear código de barras"
        >
          <Ionicons name="barcode-outline" size={22} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      <View style={estilos.estado}>
        {!buscaActiva ? (
          <Text style={estilos.estadoTexto}>Escribí al menos {MIN_LETRAS} letras o escaneá el código</Text>
        ) : isFetching ? (
          <View style={estilos.estadoFila}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
            <Text style={estilos.estadoTexto}>Buscando…</Text>
          </View>
        ) : (
          <Text style={estilos.estadoTexto}>
            {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'} · tocá un repuesto para ver su ficha
          </Text>
        )}
      </View>

      {isError ? (
        <View style={estilos.vacio}>
          <Ionicons name="cloud-offline-outline" size={44} color={theme.colors.muted} />
          <Text style={estilos.vacioTitulo}>No se pudo buscar</Text>
          <Text style={estilos.vacioTexto}>{(error as Error)?.message}</Text>
          <TouchableOpacity onPress={() => refetch()} style={estilos.reintentar}>
            <Text style={estilos.reintentarTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : !buscaActiva ? (
        <View style={estilos.vacio}>
          <Ionicons name="search-outline" size={44} color={theme.colors.border} />
          <Text style={estilos.vacioTitulo}>¿Qué busca el cliente?</Text>
          <Text style={estilos.vacioTexto}>Buscá por código, descripción o marca del fabricante, o escaneá el código de barras.</Text>
        </View>
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(r) => String(r.Id)}
          renderItem={({ item }) => (
            <FilaRepuesto item={item} enCarrito={enCarrito(item.Id)} onAgregar={onAgregar} onAbrir={onAbrir} />
          )}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={resultados.length === 0 ? { flex: 1 } : undefined}
          ListEmptyComponent={
            isLoading ? null : (
              <View style={estilos.vacio}>
                <Ionicons name="file-tray-outline" size={44} color={theme.colors.border} />
                <Text style={estilos.vacioTitulo}>Sin resultados</Text>
                <Text style={estilos.vacioTexto}>No tenemos nada así en el catálogo. Probá con otras palabras.</Text>
              </View>
            )
          }
        />
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  headerDerecha: { flexDirection: 'row', alignItems: 'center', gap: 18, marginRight: 4 },
  buscador: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: theme.colors.card, margin: 12, paddingLeft: 14, paddingRight: 6,
    borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, minHeight: 50,
  },
  input: { flex: 1, fontSize: 16, color: theme.colors.text, paddingVertical: 12 },
  escanear: { width: 38, height: 38, borderRadius: 9, backgroundColor: theme.colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  estado: { paddingHorizontal: 16, paddingBottom: 6 },
  estadoFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  estadoTexto: { fontSize: 12, color: theme.colors.muted },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  vacioTitulo: { fontSize: 16, fontWeight: '700', color: theme.colors.navy, marginTop: 6 },
  vacioTexto: { fontSize: 13, color: theme.colors.muted, textAlign: 'center', lineHeight: 19 },
  reintentar: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, backgroundColor: theme.colors.accentSoft },
  reintentarTexto: { color: theme.colors.accent, fontWeight: '700' },
});
