// app/venta/confirmacion.tsx — Venta registrada
// Recibe los datos por parametros de ruta (clase 1: compartir datos entre
// pantallas). Sin boton de volver: la venta ya esta hecha.

import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { moneda } from '../../lib/api';
import { theme } from '../../lib/theme';
import { Pantalla, Tarjeta, Boton } from '../../components/ui';

export default function Confirmacion() {
  const router = useRouter();
  const { id, total, descuento } = useLocalSearchParams<{ id: string; total: string; descuento: string }>();

  const numero = String(id ?? '').padStart(8, '0');
  const tieneDescuento = Number(descuento) > 0;

  return (
    <Pantalla>
      <View style={estilos.centro}>
        <Tarjeta style={estilos.tarjeta}>
          <View style={estilos.icono}>
            <Ionicons name="checkmark" size={44} color="#fff" />
          </View>
          <Text style={estilos.titulo}>Venta registrada</Text>
          <Text style={estilos.numero}>N° {numero}</Text>

          <View style={estilos.total}>
            <Text style={estilos.totalLabel}>TOTAL</Text>
            <Text style={estilos.totalValor}>{moneda(Number(total))}</Text>
            {tieneDescuento ? (
              <Text style={estilos.descuento}>con {moneda(Number(descuento))} de descuento</Text>
            ) : null}
          </View>

          <Text style={estilos.nota}>El stock se actualizó y el ingreso quedó en caja.</Text>

          <View style={{ height: 24 }} />

          <Boton onPress={() => router.replace('/venta')}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={estilos.btnTexto}>VENTA</Text>
          </Boton>
          <View style={{ height: 10 }} />
          <Boton variante="secundario" onPress={() => router.replace('/ventas')}>Ver historial</Boton>
        </Tarjeta>
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', padding: 20 },
  tarjeta: { alignItems: 'center', maxWidth: 440, width: '100%', alignSelf: 'center' },
  icono: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  titulo: { fontSize: 22, fontWeight: '800', color: theme.colors.navy },
  numero: { fontFamily: 'monospace', fontSize: 15, color: theme.colors.muted, marginTop: 4, letterSpacing: 1 },
  total: { alignItems: 'center', marginTop: 22, paddingVertical: 16, paddingHorizontal: 30, backgroundColor: theme.colors.bg, borderRadius: 12, alignSelf: 'stretch' },
  totalLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.muted, letterSpacing: 0.6 },
  totalValor: { fontSize: 32, fontWeight: '800', color: theme.colors.navy, marginTop: 2 },
  descuento: { fontSize: 12, color: theme.colors.green, marginTop: 4 },
  nota: { fontSize: 12, color: theme.colors.muted, textAlign: 'center', marginTop: 16 },
  btnTexto: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
});
