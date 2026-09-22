// app/venta/index.tsx — Buscador de repuestos
// TextInput de busqueda (clase 2), FlatList con datos de la API (clase 2),
// useQuery de TanStack Query con queryKey por texto (clase 4), y el badge
// del carrito leyendo el store de Zustand (clase 4).

import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
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

const MIN_LETRAS = 3;

// Espera a que el usuario deje de escribir antes de consultar.
// Sin esto, "bomba agua" dispara nueve llamadas a la API.
function useDebounce(valor: string, ms: number) {
  const [d, setD] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setD(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return d;
}

function avisar(titulo: string, mensaje: string) {
  // Alert.alert no funciona en web (lo vio el profesor en la clase 2)
  if (Platform.OS === 'web') window.alert(`${titulo}\n${mensaje}`);
  else Alert.alert(titulo, mensaje);
}

export default function Buscador() {
  useSesion();
  const router = useRouter();
  const nombre = useAuthStore((s) => s.nombre);
  const logout = useAuthStore((s) => s.logout);

  // Suscripcion selectiva: solo re-renderiza si cambia lo que se usa
  const items = useCarritoStore((s) => s.items);
  const agregar = useCarritoStore((s) => s.agregar);
  const cantidadEnCarrito = items.reduce((s, i) => s + i.Cantidad, 0);

  const [texto, setTexto] = useState('');
  const textoBuscado = useDebounce(texto.trim(), 350);
  const buscaActiva = textoBuscado.length >= MIN_LETRAS;

  // useQuery: la clave incluye el texto, asi cada busqueda tiene su cache.
  // Volver a escribir "bomba" no vuelve a llamar a la API si sigue fresca.
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

  function salir() {
    const hacer = () => { logout(); router.replace('/'); };
    if (Platform.OS === 'web') {
      if (window.confirm('¿Cerrar sesión?')) hacer();
    } else {
      Alert.alert('Cerrar sesión', '¿Salir del sistema?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: hacer },
      ]);
    }
  }

  return (
    <Pantalla>
      {/* Cabecera con el badge del carrito y el usuario */}
      <Stack.Screen
        options={{
          title: 'Nueva venta',
          headerRight: () => (
            <View style={estilos.headerDerecha}>
              <TouchableOpacity onPress={() => router.push('/ventas')} hitSlop={8} accessibilityLabel="Historial">
                <Ionicons name="time-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/venta/carrito')} hitSlop={8} accessibilityLabel={`Carrito, ${cantidadEnCarrito} ítems`}>
                <Ionicons name="cart-outline" size={26} color="#fff" />
                {cantidadEnCarrito > 0 ? (
                  <View style={estilos.badge}>
                    <Text style={estilos.badgeTexto}>{cantidadEnCarrito}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
              <TouchableOpacity onPress={salir} hitSlop={8} accessibilityLabel="Cerrar sesión">
                <Ionicons name="log-out-outline" size={24} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Buscador */}
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
      </View>

      {/* Estado bajo el buscador */}
      <View style={estilos.estado}>
        {!buscaActiva ? (
          <Text style={estilos.estadoTexto}>Escribí al menos {MIN_LETRAS} letras</Text>
        ) : isFetching ? (
          <View style={estilos.estadoFila}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
            <Text style={estilos.estadoTexto}>Buscando…</Text>
          </View>
        ) : (
          <Text style={estilos.estadoTexto}>
            {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'}
          </Text>
        )}
      </View>

      {/* Lista */}
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
          <Text style={estilos.vacioTexto}>Buscá por código, descripción o marca del fabricante.</Text>
        </View>
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(r) => String(r.Id)}
          renderItem={({ item }) => (
            <FilaRepuesto item={item} enCarrito={enCarrito(item.Id)} onAgregar={onAgregar} />
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
  badge: {
    position: 'absolute', top: -6, right: -8, minWidth: 18, height: 18,
    borderRadius: 9, backgroundColor: theme.colors.red,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeTexto: { color: '#fff', fontSize: 11, fontWeight: '800' },

  buscador: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: theme.colors.card, margin: 12, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, minHeight: 50,
  },
  input: { flex: 1, fontSize: 16, color: theme.colors.text, paddingVertical: 12 },

  estado: { paddingHorizontal: 16, paddingBottom: 6 },
  estadoFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  estadoTexto: { fontSize: 12, color: theme.colors.muted },

  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  vacioTitulo: { fontSize: 16, fontWeight: '700', color: theme.colors.navy, marginTop: 6 },
  vacioTexto: { fontSize: 13, color: theme.colors.muted, textAlign: 'center', lineHeight: 19 },
  reintentar: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, backgroundColor: theme.colors.accentSoft },
  reintentarTexto: { color: theme.colors.accent, fontWeight: '700' },
});
