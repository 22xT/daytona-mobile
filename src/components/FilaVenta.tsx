import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moneda } from '../lib/api';
import { theme } from '../lib/theme';
import { esAnulada, fecha, hora, numeroComprobante } from '../lib/formato';

export interface VentaResumen {
  Id: number;
  Fecha: string;
  Cliente: string | null;
  Total: number;
  Estado: string;
  Vendedor?: string | null;
  TotalRegistros?: number;
}

interface Props {
  venta: VentaResumen;
  onPress: (venta: VentaResumen) => void;
}

export function FilaVenta({ venta, onPress }: Props) {
  const anulada = esAnulada(venta.Estado);
  return (
    <TouchableOpacity
      testID={'venta-' + venta.Id}
      style={[estilos.fila, anulada && estilos.filaAnulada]}
      onPress={() => onPress(venta)}
      accessibilityRole="button"
      accessibilityLabel={`Venta ${venta.Id}, ${moneda(venta.Total)}`}
    >
      <View style={estilos.izq}>
        <Text style={estilos.numero}>{numeroComprobante(venta.Id)}</Text>
        <Text style={estilos.cliente} numberOfLines={1}>{venta.Cliente || 'Sin cliente'}</Text>
        <Text style={estilos.fecha}>
          {fecha(venta.Fecha)} · {hora(venta.Fecha)}{venta.Vendedor ? ' · ' + venta.Vendedor : ''}
        </Text>
      </View>
      <View style={estilos.der}>
        <Text style={[estilos.total, anulada && estilos.totalAnulada]}>{moneda(venta.Total)}</Text>
        {anulada ? (
          <View style={estilos.pillAnulada}><Text style={estilos.pillAnuladaTexto}>ANULADA</Text></View>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, padding: 14,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 12,
  },
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
