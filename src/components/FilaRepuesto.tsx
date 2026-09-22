// components/FilaRepuesto.tsx
// Una fila del buscador. Codigo, descripcion, stock con color segun
// estado, precio, y el boton para agregar al carrito.

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { moneda } from '../lib/api';
import type { RepuestoPropio } from '../lib/tipos';

interface Props {
  item: RepuestoPropio;
  enCarrito: number;          // cuantas unidades ya estan en el carrito
  onAgregar: (item: RepuestoPropio) => void;
}

const estadoStock = {
  OK:       { color: theme.colors.green,  fondo: theme.colors.greenSoft,  icono: 'checkmark-circle' as const },
  Critico:  { color: theme.colors.yellow, fondo: theme.colors.yellowSoft, icono: 'alert-circle' as const },
  SinStock: { color: theme.colors.red,    fondo: theme.colors.redSoft,    icono: 'close-circle' as const },
};

export function FilaRepuesto({ item, enCarrito, onAgregar }: Props) {
  const e = estadoStock[item.EstadoStock] ?? estadoStock.SinStock;
  const sinStock = item.Stock <= 0;
  const disponible = item.Stock - enCarrito;

  return (
    <View style={estilos.fila}>
      <View style={estilos.info}>
        <View style={estilos.linea1}>
          <Text style={estilos.codigo}>{item.Codigo}</Text>
          {item.MarcaFabricante ? <Text style={estilos.marca}>{item.MarcaFabricante}</Text> : null}
        </View>
        <Text style={estilos.desc} numberOfLines={2}>{item.Descripcion}</Text>
        <View style={estilos.linea3}>
          <View style={[estilos.pill, { backgroundColor: e.fondo }]}>
            <Ionicons name={e.icono} size={13} color={e.color} />
            <Text style={[estilos.pillTexto, { color: e.color }]}>
              {sinStock ? 'Sin stock' : `${item.Stock} en stock`}
            </Text>
          </View>
          {enCarrito > 0 ? (
            <Text style={estilos.enCarrito}>{enCarrito} en carrito</Text>
          ) : null}
        </View>
      </View>

      <View style={estilos.derecha}>
        <Text style={estilos.precio}>{moneda(item.PrecioDeVenta)}</Text>
        <TouchableOpacity
          style={[estilos.btnAgregar, (sinStock || disponible <= 0) && estilos.btnDeshabilitado]}
          onPress={() => onAgregar(item)}
          disabled={sinStock || disponible <= 0}
          accessibilityRole="button"
          accessibilityLabel={`Agregar ${item.Descripcion} al carrito`}
          hitSlop={6}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.colors.card, padding: 14,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  info: { flex: 1, minWidth: 0 },
  linea1: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  codigo: { fontFamily: 'monospace', fontWeight: '700', color: theme.colors.navy, fontSize: 13, letterSpacing: 0.5 },
  marca: {
    fontSize: 10, fontWeight: '700', color: theme.colors.muted,
    backgroundColor: theme.colors.bg, paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: 4, textTransform: 'uppercase',
  },
  desc: { fontSize: 14, color: theme.colors.text, lineHeight: 19 },
  linea3: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTexto: { fontSize: 12, fontWeight: '700' },
  enCarrito: { fontSize: 12, color: theme.colors.accent, fontWeight: '600' },
  derecha: { alignItems: 'flex-end', gap: 8 },
  precio: { fontSize: 17, fontWeight: '800', color: theme.colors.navy },
  btnAgregar: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: theme.colors.green, alignItems: 'center', justifyContent: 'center',
  },
  btnDeshabilitado: { backgroundColor: theme.colors.border },
});
