import { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { apiFetch, moneda } from '../../lib/api';
import { theme } from '../../lib/theme';
import { Pantalla, Tarjeta, Boton } from '../../components/ui';
import { useSesion } from '../../lib/useSesion';
import { esAnulada, fecha, hora, numeroComprobante } from '../../lib/formato';
import { avisar } from '../../lib/avisar';

interface Renglon {
  Id: number;
  IdRepuesto: number;
  Codigo?: string;
  Descripcion: string;
  Cantidad: number;
  PrecioUnitario: number;
  Subtotal: number;
}

interface Pago {
  Id: number;
  Medio: string;
  Codigo: string;
  Monto: number;
}

type Parametros = { id: string; fecha?: string; cliente?: string; total?: string; estado?: string };

export default function DetalleVenta() {
  useSesion();
  const p = useLocalSearchParams<Parametros>();
  const id = p.id;
  const comprobanteRef = useRef<View>(null);
  const [compartiendo, setCompartiendo] = useState(false);

  const detalle = useQuery({
    queryKey: ['venta-detalle', id],
    queryFn: () => apiFetch<Renglon[]>(`Venta/${id}/Detalle`),
    enabled: !!id,
  });

  const pagos = useQuery({
    queryKey: ['venta-pagos', id],
    queryFn: () => apiFetch<Pago[]>(`MedioPago/Venta/${id}`),
    enabled: !!id,
  });

  const renglones = detalle.data ?? [];
  const totalRenglones = renglones.reduce((s, r) => s + Number(r.Subtotal ?? r.Cantidad * r.PrecioUnitario), 0);
  const total = p.total ? Number(p.total) : totalRenglones;
  const descuento = Math.max(0, Math.round((totalRenglones - total) * 100) / 100);
  const unidades = renglones.reduce((s, r) => s + Number(r.Cantidad), 0);
  const anulada = esAnulada(p.estado);

  async function compartir() {
    if (Platform.OS === 'web') {
      avisar('Compartir comprobante', 'Esta opción está disponible en el celular.');
      return;
    }
    try {
      setCompartiendo(true);
      if (!(await Sharing.isAvailableAsync())) {
        avisar('Compartir comprobante', 'Este dispositivo no permite compartir archivos.');
        return;
      }
      const uri = await captureRef(comprobanteRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Comprobante ' + numeroComprobante(id) });
    } catch {
      avisar('Compartir comprobante', 'No se pudo generar la imagen del comprobante.');
    } finally {
      setCompartiendo(false);
    }
  }

  return (
    <Pantalla>
      <ScrollView contentContainerStyle={estilos.contenido}>
        {detalle.isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.navy} style={{ marginTop: 40 }} />
        ) : detalle.isError ? (
          <Text style={estilos.error}>{(detalle.error as Error)?.message}</Text>
        ) : (
          <>
            <View ref={comprobanteRef} collapsable={false} style={estilos.comprobante}>
              <View style={estilos.cabecera}>
                <Text style={estilos.marca}>DAYTONA</Text>
                <Text style={estilos.marcaSub}>Repuestos Automotor</Text>
                <Text style={estilos.numero}>{numeroComprobante(id)}</Text>
                {p.fecha ? <Text style={estilos.dato}>{fecha(p.fecha)} · {hora(p.fecha)}</Text> : null}
                {p.cliente ? <Text style={estilos.dato}>Cliente: {p.cliente}</Text> : null}
                {anulada ? <View style={estilos.pillAnulada}><Text style={estilos.pillAnuladaTexto}>ANULADA</Text></View> : null}
              </View>

              <Text style={estilos.seccion}>
                {renglones.length} {renglones.length === 1 ? 'REPUESTO' : 'REPUESTOS'} · {unidades} {unidades === 1 ? 'UNIDAD' : 'UNIDADES'}
              </Text>
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

              <View style={estilos.totales}>
                {descuento > 0 ? (
                  <View style={estilos.totalFila}>
                    <Text style={estilos.totalChico}>Descuento</Text>
                    <Text style={[estilos.totalChico, { color: theme.colors.green }]}>−{moneda(descuento)}</Text>
                  </View>
                ) : null}
                <View style={estilos.totalFila}>
                  <Text style={estilos.totalLabel}>TOTAL</Text>
                  <Text style={estilos.totalValor}>{moneda(total)}</Text>
                </View>
                {(pagos.data ?? []).map((pg) => (
                  <View key={pg.Id} style={estilos.totalFila}>
                    <Text style={estilos.totalChico}>{pg.Medio}</Text>
                    <Text style={estilos.totalChico}>{moneda(pg.Monto)}</Text>
                  </View>
                ))}
              </View>
              <Text style={estilos.pie}>Comprobante no válido como factura</Text>
            </View>

            <View style={{ height: 14 }} />
            <Tarjeta style={{ padding: 14 }}>
              <Boton onPress={compartir} cargando={compartiendo} disabled={compartiendo}>
                <Ionicons name="share-social-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={estilos.btnTexto}>COMPARTIR COMPROBANTE</Text>
              </Boton>
            </Tarjeta>
          </>
        )}
      </ScrollView>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 14, paddingBottom: 30 },
  error: { color: theme.colors.red, textAlign: 'center', marginTop: 30 },
  comprobante: {
    backgroundColor: theme.colors.card, borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  cabecera: { alignItems: 'center', paddingBottom: 14, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border, borderStyle: 'dashed' },
  marca: { fontSize: 22, fontWeight: '900', color: theme.colors.navy, letterSpacing: 3 },
  marcaSub: { fontSize: 11, color: theme.colors.red, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  numero: { fontFamily: 'monospace', fontSize: 14, fontWeight: '700', color: theme.colors.text, letterSpacing: 1, marginTop: 10 },
  dato: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  pillAnulada: { marginTop: 8, backgroundColor: theme.colors.redSoft, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  pillAnuladaTexto: { fontSize: 11, fontWeight: '800', color: theme.colors.red },
  seccion: { fontSize: 11, fontWeight: '700', color: theme.colors.muted, letterSpacing: 0.6, marginBottom: 6 },
  item: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.colors.border },
  itemCodigo: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', color: theme.colors.navy },
  itemDesc: { fontSize: 13, color: theme.colors.text, marginTop: 2 },
  itemCant: { fontSize: 12, color: theme.colors.muted },
  itemSub: { fontSize: 15, fontWeight: '700', color: theme.colors.navy, marginTop: 2 },
  totales: { marginTop: 8, paddingTop: 10, borderTopWidth: 2, borderTopColor: theme.colors.navy, gap: 4 },
  totalFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalChico: { fontSize: 13, color: theme.colors.muted },
  totalLabel: { fontSize: 14, fontWeight: '800', color: theme.colors.navy },
  totalValor: { fontSize: 26, fontWeight: '800', color: theme.colors.navy },
  pie: { fontSize: 10, color: theme.colors.muted, textAlign: 'center', marginTop: 14 },
  btnTexto: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
});
