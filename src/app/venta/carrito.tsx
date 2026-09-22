// app/venta/carrito.tsx — Carrito
// FlatList con los items del store de Zustand (clase 2 + 4), selector de
// tipo de cliente, botones de descuento que vienen de la API con useQuery
// (clase 4), total calculado, y el boton de confirmar.

import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch, moneda } from '../../lib/api';
import { theme } from '../../lib/theme';
import { useCarritoStore } from '../../lib/store/carrito';
import { useVentaStore, type TipoCliente } from '../../lib/store/venta';
import { Pantalla, Boton } from '../../components/ui';
import { useSesion } from '../../lib/useSesion';
import { FilaCarrito } from '../../components/FilaCarrito';

interface ParametrosVenta {
  DescuentosPublico: string;   // "5,7,10"
  DescuentoMecanico: string;   // "10"
}

function avisar(titulo: string, mensaje: string) {
  if (Platform.OS === 'web') window.alert(`${titulo}\n${mensaje}`);
  else Alert.alert(titulo, mensaje);
}

export default function Carrito() {
  useSesion();
  const router = useRouter();

  const items = useCarritoStore((s) => s.items);
  const cambiarCantidad = useCarritoStore((s) => s.cambiarCantidad);
  const quitar = useCarritoStore((s) => s.quitar);
  const vaciar = useCarritoStore((s) => s.vaciar);

  const tipoCliente = useVentaStore((s) => s.tipoCliente);
  const descuento = useVentaStore((s) => s.descuento);
  const setTipoCliente = useVentaStore((s) => s.setTipoCliente);
  const setDescuento = useVentaStore((s) => s.setDescuento);

  // Los escalones de descuento son configuracion del negocio: se leen de la
  // API y quedan en cache. Si falla, se usan los valores por defecto.
  const { data: params } = useQuery({
    queryKey: ['parametros-venta'],
    queryFn: () => apiFetch<ParametrosVenta>('Configuracion/Venta'),
    staleTime: 5 * 60_000,
  });

  const escalonesPublico = (params?.DescuentosPublico ?? '5,7,10')
    .split(',').map((x) => parseFloat(x.trim())).filter((x) => !isNaN(x) && x > 0);
  const descuentoMecanico = parseFloat(params?.DescuentoMecanico ?? '10') || 10;

  const escalones = tipoCliente === 'Mecanico' ? [descuentoMecanico] : escalonesPublico;

  const subtotal = items.reduce((s, i) => s + i.Cantidad * i.PrecioUnitario, 0);
  const montoDescuento = Math.round(subtotal * descuento) / 100;
  const total = subtotal - montoDescuento;
  const cantidadItems = items.reduce((s, i) => s + i.Cantidad, 0);

  function elegirTipo(t: TipoCliente) {
    setTipoCliente(t);
    // Al mecanico le corresponde su descuento fijo; al publico ninguno
    // salvo que lo pida. Igual que en el sistema web.
    setDescuento(t === 'Mecanico' ? descuentoMecanico : 0);
  }

  function onCambiar(id: number, cantidad: number) {
    const r = cambiarCantidad(id, cantidad);
    if (!r.ok && r.motivo) avisar('Cantidad', r.motivo);
  }

  function confirmarVaciar() {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Vaciar el carrito?')) vaciar();
    } else {
      Alert.alert('Vaciar carrito', '¿Quitar todos los ítems?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Vaciar', style: 'destructive', onPress: vaciar },
      ]);
    }
  }

  if (items.length === 0) {
    return (
      <Pantalla>
        <View style={estilos.vacio}>
          <Ionicons name="cart-outline" size={56} color={theme.colors.border} />
          <Text style={estilos.vacioTitulo}>El carrito está vacío</Text>
          <Text style={estilos.vacioTexto}>Buscá repuestos y agregalos con el botón +</Text>
          <View style={{ height: 20 }} />
          <Boton variante="secundario" onPress={() => router.back()}>Volver a buscar</Boton>
        </View>
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.IdRepuesto)}
        renderItem={({ item }) => <FilaCarrito item={item} onCambiar={onCambiar} onQuitar={quitar} />}
        ListHeaderComponent={
          <View style={estilos.cabecera}>
            <Text style={estilos.cabeceraTexto}>
              {cantidadItems} {cantidadItems === 1 ? 'unidad' : 'unidades'} · {items.length} {items.length === 1 ? 'repuesto' : 'repuestos'}
            </Text>
            <TouchableOpacity onPress={confirmarVaciar} hitSlop={8}>
              <Text style={estilos.vaciar}>Vaciar</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 12 }}
      />

      {/* Panel inferior: tipo de cliente, descuento, total, confirmar */}
      <View style={estilos.panel}>
        <View style={estilos.linea}>
          <Text style={estilos.lineaLabel}>CLIENTE</Text>
          <View style={estilos.segmentos}>
            {(['Publico', 'Mecanico'] as TipoCliente[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[estilos.segmento, tipoCliente === t && estilos.segmentoActivo]}
                onPress={() => elegirTipo(t)}
                accessibilityRole="radio"
                accessibilityState={{ selected: tipoCliente === t }}
              >
                <Text style={[estilos.segmentoTexto, tipoCliente === t && estilos.segmentoTextoActivo]}>
                  {t === 'Publico' ? 'Público' : 'Mecánico'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={estilos.linea}>
          <Text style={estilos.lineaLabel}>DESC.</Text>
          <View style={estilos.chips}>
            <TouchableOpacity
              style={[estilos.chip, descuento === 0 && estilos.chipActivo]}
              onPress={() => setDescuento(0)}
            >
              <Text style={[estilos.chipTexto, descuento === 0 && estilos.chipTextoActivo]}>Sin</Text>
            </TouchableOpacity>
            {escalones.map((e) => (
              <TouchableOpacity
                key={e}
                style={[estilos.chip, descuento === e && estilos.chipActivo]}
                onPress={() => setDescuento(e)}
              >
                <Text style={[estilos.chipTexto, descuento === e && estilos.chipTextoActivo]}>{e}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={estilos.totales}>
          {descuento > 0 ? (
            <>
              <View style={estilos.totalFila}>
                <Text style={estilos.totalLabel}>Subtotal</Text>
                <Text style={estilos.totalValor}>{moneda(subtotal)}</Text>
              </View>
              <View style={estilos.totalFila}>
                <Text style={[estilos.totalLabel, { color: theme.colors.green }]}>Descuento {descuento}%</Text>
                <Text style={[estilos.totalValor, { color: theme.colors.green }]}>−{moneda(montoDescuento)}</Text>
              </View>
            </>
          ) : null}
          <View style={[estilos.totalFila, estilos.totalFinal]}>
            <Text style={estilos.totalFinalLabel}>TOTAL</Text>
            <Text style={estilos.totalFinalValor}>{moneda(total)}</Text>
          </View>
        </View>

        <Boton onPress={() => router.push('/venta/confirmar')} accessibilityLabel="Confirmar venta">
          <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={estilos.btnTexto}>CONFIRMAR VENTA</Text>
        </Boton>
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  vacioTitulo: { fontSize: 18, fontWeight: '700', color: theme.colors.navy, marginTop: 8 },
  vacioTexto: { fontSize: 13, color: theme.colors.muted, textAlign: 'center' },

  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  cabeceraTexto: { fontSize: 13, color: theme.colors.muted },
  vaciar: { fontSize: 13, color: theme.colors.red, fontWeight: '600' },

  panel: {
    backgroundColor: theme.colors.card, borderTopWidth: 1, borderTopColor: theme.colors.border,
    padding: 14, gap: 10,
  },
  linea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lineaLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.muted, letterSpacing: 0.5, width: 56 },

  segmentos: { flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, overflow: 'hidden' },
  segmento: { flex: 1, paddingVertical: 9, alignItems: 'center', backgroundColor: theme.colors.card },
  segmentoActivo: { backgroundColor: theme.colors.navy },
  segmentoTexto: { fontSize: 13, fontWeight: '600', color: theme.colors.muted },
  segmentoTextoActivo: { color: '#fff' },

  chips: { flex: 1, flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  chipActivo: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  chipTexto: { fontSize: 13, fontWeight: '600', color: theme.colors.muted },
  chipTextoActivo: { color: '#fff' },

  totales: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10, gap: 4 },
  totalFila: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 13, color: theme.colors.muted },
  totalValor: { fontSize: 13, color: theme.colors.text, fontWeight: '600' },
  totalFinal: { marginTop: 4 },
  totalFinalLabel: { fontSize: 14, fontWeight: '800', color: theme.colors.navy, letterSpacing: 0.5 },
  totalFinalValor: { fontSize: 24, fontWeight: '800', color: theme.colors.navy },

  btnTexto: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
});
