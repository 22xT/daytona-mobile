// app/venta/confirmar.tsx — Confirmar venta
// Resumen final y el POST a la API con useMutation de TanStack Query
// (clase 4). Al confirmar, invalida la cache del historial y vacia el
// carrito del store de Zustand.

import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch, moneda } from '../../lib/api';
import { theme } from '../../lib/theme';
import { useCarritoStore } from '../../lib/store/carrito';
import { useVentaStore } from '../../lib/store/venta';
import { Pantalla, Tarjeta, Boton, TextoError } from '../../components/ui';
import { useSesion } from '../../lib/useSesion';

interface Cliente { Id: number; Dni: string | null; Nombre: string; Apellido: string; }
interface RespuestaVenta { IdVenta: number; Total: number; Descuento: number; Entrega: number; SaldoGenerado: number; }

// Clientes internos del sistema, identificados por DNI
const DNI_CONSUMIDOR_FINAL = '00000000';
const DNI_MECANICO_MOSTRADOR = '00000001';

export default function Confirmar() {
  useSesion();
  const router = useRouter();
  const queryClient = useQueryClient();

  const items = useCarritoStore((s) => s.items);
  const vaciar = useCarritoStore((s) => s.vaciar);
  const tokenOperacion = useCarritoStore((s) => s.tokenOperacion);
  const tipoCliente = useVentaStore((s) => s.tipoCliente);
  const descuento = useVentaStore((s) => s.descuento);
  const resetVenta = useVentaStore((s) => s.reset);

  const [error, setError] = useState('');

  // El Id del cliente interno se lee de la lista una vez y queda en cache.
  const { data: clientes, isLoading: cargandoClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => apiFetch<Cliente[]>('Cliente'),
    staleTime: 10 * 60_000,
  });

  const dniBuscado = tipoCliente === 'Mecanico' ? DNI_MECANICO_MOSTRADOR : DNI_CONSUMIDOR_FINAL;
  const clienteInterno = clientes?.find((c) => c.Dni === dniBuscado);

  const subtotal = items.reduce((s, i) => s + i.Cantidad * i.PrecioUnitario, 0);
  const montoDescuento = Math.round(subtotal * descuento) / 100;
  const total = subtotal - montoDescuento;
  const cantidadItems = items.reduce((s, i) => s + i.Cantidad, 0);

  // useMutation: para operaciones que escriben. No se ejecuta sola,
  // se dispara con mutate(). Distinto de useQuery, que es para leer.
  const registrar = useMutation({
    mutationFn: () =>
      apiFetch<RespuestaVenta>('Venta', {
        method: 'POST',
        body: JSON.stringify({
          IdCliente: clienteInterno!.Id,
          TokenOperacion: tokenOperacion,
          PorcentajeDescuento: descuento,
          FormaPago: 'Contado',
          TipoCliente: tipoCliente,
          Detalle: items.map((i) => ({ IdRepuesto: i.IdRepuesto, Cantidad: i.Cantidad, PrecioUnitario: i.PrecioUnitario })),
        }),
      }),
    onSuccess: (r) => {
      // Hay una venta nueva y el stock cambio: se marcan esas caches como viejas
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['busqueda'] });
      vaciar();
      resetVenta();
      router.replace({
        pathname: '/venta/confirmacion',
        params: { id: String(r.IdVenta), total: String(r.Total), descuento: String(r.Descuento) },
      });
    },
    onError: (e: Error) => setError(e.message),
  });

  const puedeConfirmar = items.length > 0 && !!clienteInterno && !registrar.isPending;

  if (items.length === 0) {
    return (
      <Pantalla>
        <View style={estilos.centro}>
          <Text style={estilos.muted}>No hay nada para confirmar.</Text>
          <View style={{ height: 16 }} />
          <Boton variante="secundario" onPress={() => router.replace('/venta')}>Ir al buscador</Boton>
        </View>
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Tarjeta>
          <Text style={estilos.seccion}>CLIENTE</Text>
          <View style={estilos.fila}>
            <Ionicons name={tipoCliente === 'Mecanico' ? 'construct-outline' : 'person-outline'} size={20} color={theme.colors.navy} />
            <Text style={estilos.valor}>{tipoCliente === 'Mecanico' ? 'Mecánico Mostrador' : 'Consumidor Final'}</Text>
          </View>
          {cargandoClientes ? <Text style={estilos.muted}>Verificando cliente…</Text>
           : !clienteInterno ? <TextoError>No se encontró el cliente interno. Revisá que exista el DNI {dniBuscado}.</TextoError>
           : null}
        </Tarjeta>

        <View style={{ height: 12 }} />

        <Tarjeta>
          <Text style={estilos.seccion}>DETALLE · {cantidadItems} {cantidadItems === 1 ? 'UNIDAD' : 'UNIDADES'}</Text>
          {items.map((i) => (
            <View key={i.IdRepuesto} style={estilos.item}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={estilos.itemCodigo}>{i.Codigo}</Text>
                <Text style={estilos.itemDesc} numberOfLines={2}>{i.Descripcion}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={estilos.itemCant}>{i.Cantidad} × {moneda(i.PrecioUnitario)}</Text>
                <Text style={estilos.itemSub}>{moneda(i.Cantidad * i.PrecioUnitario)}</Text>
              </View>
            </View>
          ))}
        </Tarjeta>

        <View style={{ height: 12 }} />

        <Tarjeta>
          <View style={estilos.totalFila}><Text style={estilos.totalLabel}>Subtotal</Text><Text style={estilos.totalValor}>{moneda(subtotal)}</Text></View>
          {descuento > 0 ? (
            <View style={estilos.totalFila}>
              <Text style={[estilos.totalLabel, { color: theme.colors.green }]}>Descuento {descuento}%</Text>
              <Text style={[estilos.totalValor, { color: theme.colors.green }]}>−{moneda(montoDescuento)}</Text>
            </View>
          ) : null}
          <View style={estilos.totalFila}><Text style={estilos.totalLabel}>Forma de pago</Text><Text style={estilos.totalValor}>Contado</Text></View>
          <View style={[estilos.totalFila, estilos.totalFinal]}>
            <Text style={estilos.totalFinalLabel}>TOTAL</Text>
            <Text style={estilos.totalFinalValor}>{moneda(total)}</Text>
          </View>
        </Tarjeta>

        {error ? (
          <View style={estilos.cajaError}>
            <Ionicons name="alert-circle-outline" size={18} color={theme.colors.red} />
            <TextoError style={{ marginTop: 0, flex: 1 }}>{error}</TextoError>
          </View>
        ) : null}

        <View style={{ height: 20 }} />

        <Boton onPress={() => { setError(''); registrar.mutate(); }} disabled={!puedeConfirmar} cargando={registrar.isPending} accessibilityLabel="Registrar venta">
          {registrar.isPending ? 'Registrando…' : 'REGISTRAR VENTA'}
        </Boton>
        <View style={{ height: 10 }} />
        <Boton variante="secundario" onPress={() => router.back()} disabled={registrar.isPending}>Volver al carrito</Boton>

        <Text style={estilos.nota}>Al registrar se descuenta el stock y se genera el ingreso en caja.</Text>
      </ScrollView>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 14, paddingBottom: 30 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  muted: { color: theme.colors.muted, fontSize: 13, marginTop: 6 },
  seccion: { fontSize: 11, fontWeight: '700', color: theme.colors.muted, letterSpacing: 0.6, marginBottom: 10 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  valor: { fontSize: 16, fontWeight: '600', color: theme.colors.navy },
  item: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.colors.border },
  itemCodigo: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', color: theme.colors.navy },
  itemDesc: { fontSize: 13, color: theme.colors.text, marginTop: 2 },
  itemCant: { fontSize: 12, color: theme.colors.muted },
  itemSub: { fontSize: 15, fontWeight: '700', color: theme.colors.navy, marginTop: 2 },
  totalFila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { fontSize: 14, color: theme.colors.muted },
  totalValor: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  totalFinal: { borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: 6, paddingTop: 10 },
  totalFinalLabel: { fontSize: 15, fontWeight: '800', color: theme.colors.navy },
  totalFinalValor: { fontSize: 26, fontWeight: '800', color: theme.colors.navy },
  cajaError: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.redSoft, borderRadius: 8, padding: 10, marginTop: 14 },
  nota: { textAlign: 'center', color: theme.colors.muted, fontSize: 12, marginTop: 16 },
});
