// components/FilaCarrito.tsx
// Un item del carrito con los botones de cantidad.

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { moneda } from '../lib/api';
import type { ItemCarrito } from '../lib/store/carrito';

interface Props {
  item: ItemCarrito;
  onCambiar: (id: number, cantidad: number) => void;
  onQuitar: (id: number) => void;
}

export function FilaCarrito({ item, onCambiar, onQuitar }: Props) {
  const enMaximo = item.Cantidad >= item.StockDisponible;

  return (
    <View style={estilos.fila}>
      <View style={estilos.info}>
        <Text style={estilos.codigo}>{item.Codigo}</Text>
        <Text style={estilos.desc} numberOfLines={2}>{item.Descripcion}</Text>
        <Text style={estilos.unitario}>{moneda(item.PrecioUnitario)} c/u</Text>
      </View>

      <View style={estilos.controles}>
        <View style={estilos.cantidad}>
          <TouchableOpacity
            style={estilos.btnCant}
            onPress={() => onCambiar(item.IdRepuesto, item.Cantidad - 1)}
            accessibilityLabel="Restar uno"
            hitSlop={6}
          >
            <Ionicons name="remove" size={18} color={theme.colors.navy} />
          </TouchableOpacity>
          <Text style={estilos.cantTexto}>{item.Cantidad}</Text>
          <TouchableOpacity
            style={[estilos.btnCant, enMaximo && estilos.btnCantOff]}
            onPress={() => onCambiar(item.IdRepuesto, item.Cantidad + 1)}
            disabled={enMaximo}
            accessibilityLabel="Sumar uno"
            hitSlop={6}
          >
            <Ionicons name="add" size={18} color={enMaximo ? theme.colors.muted : theme.colors.navy} />
          </TouchableOpacity>
        </View>
        <Text style={estilos.subtotal}>{moneda(item.Cantidad * item.PrecioUnitario)}</Text>
        <TouchableOpacity onPress={() => onQuitar(item.IdRepuesto)} hitSlop={8} accessibilityLabel="Quitar del carrito">
          <Ionicons name="trash-outline" size={20} color={theme.colors.red} />
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
  codigo: { fontFamily: 'monospace', fontWeight: '700', color: theme.colors.navy, fontSize: 12 },
  desc: { fontSize: 14, color: theme.colors.text, marginTop: 2, lineHeight: 19 },
  unitario: { fontSize: 12, color: theme.colors.muted, marginTop: 3 },
  controles: { alignItems: 'flex-end', gap: 8 },
  cantidad: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, overflow: 'hidden',
  },
  btnCant: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
  btnCantOff: { opacity: 0.4 },
  cantTexto: { minWidth: 36, textAlign: 'center', fontWeight: '700', fontSize: 15, color: theme.colors.navy },
  subtotal: { fontWeight: '800', fontSize: 16, color: theme.colors.navy },
});
