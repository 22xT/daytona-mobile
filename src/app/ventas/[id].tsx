// app/ventas/[id].tsx — Detalle de una venta
// Ruta dinamica: el [id] del nombre del archivo llega como parametro
// (clase 1). Consulta el detalle con useQuery usando el id en la clave.

import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, moneda } from '../../lib/api';
import { theme } from '../../lib/theme';
import { Pantalla, Tarjeta } from '../../components/ui';
import { useSesion } from '../../lib/useSesion';

interface Renglon {
  Id: number;
  IdRepuesto: number;
  Codigo?: string;
  Descripcion: string;
  Cantidad: number;
  PrecioUnitario: number;
  Subtotal: number;
}

export default function DetalleVenta() {
  useSesion();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['venta-detalle', id],
    queryFn: () => apiFetch<Renglon[]>(`Venta/${id}/Detalle`),
    enabled: !!id,
  });

  const renglones = data ?? [];
  const total = renglones.reduce((s, r) => s + Number(r.Subtotal ?? r.Cantidad * r.PrecioUnitario), 0);
  const unidades = renglones.reduce((s, r) => s + Number(r.Cantidad), 0);

  return (
    <Pantalla>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.numero}>N° {String(id ?? '').padStart(8, '0')}</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.navy} style={{ marginTop: 40 }} />
        ) : isError ? (
          <Text style={estilos.error}>{(error as Error)?.message}</Text>
        ) : (
          <>
            <Tarjeta>
              <Text style={estilos.seccion}>{renglones.length} {renglones.length === 1 ? 'REPUESTO' : 'REPUESTOS'} · {unidades} {unidades === 1 ? 'UNIDAD' : 'UNIDADES'}</Text>
              {renglones.map((r, i) => (
                <View key={r.Id ?? i} style={[estilos.item, i === 0 && { borderTopWidth: 0 }]}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    {r.Codigo ? <Text style={estilos.itemCodigo}>{r.Codigo}</Text> : null}
                    <Text style={estilos.itemDesc}>{r.Descripcion}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={estilos.itemCant}>{r.Cantidad} × {moneda(r.PrecioUnitario)}</Text>
                    <Text style={estilos.itemSub}>{moneda(r.Subtotal ?? r.Cantidad * r.PrecioUnitario)}</Text>
                  </View>
                </View>
              ))}
            </Tarjeta>

            <View style={{ height: 12 }} />

            <Tarjeta>
              <View style={estilos.totalFila}>
                <Text style={estilos.totalLabel}>TOTAL</Text>
                <Text style={estilos.totalValor}>{moneda(total)}</Text>
              </View>
            </Tarjeta>
          </>
        )}
      </ScrollView>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 14, paddingBottom: 30 },
  numero: { fontFamily: 'monospace', fontSize: 14, fontWeight: '700', color: theme.colors.muted, letterSpacing: 1, marginBottom: 12, textAlign: 'center' },
  error: { color: theme.colors.red, textAlign: 'center', marginTop: 30 },
  seccion: { fontSize: 11, fontWeight: '700', color: theme.colors.muted, letterSpacing: 0.6, marginBottom: 6 },
  item: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.colors.border },
  itemCodigo: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', color: theme.colors.navy },
  itemDesc: { fontSize: 13, color: theme.colors.text, marginTop: 2 },
  itemCant: { fontSize: 12, color: theme.colors.muted },
  itemSub: { fontSize: 15, fontWeight: '700', color: theme.colors.navy, marginTop: 2 },
  totalFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '800', color: theme.colors.navy },
  totalValor: { fontSize: 26, fontWeight: '800', color: theme.colors.navy },
});
