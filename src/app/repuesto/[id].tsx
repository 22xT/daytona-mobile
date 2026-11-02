import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch, moneda } from '../../lib/api';
import { theme } from '../../lib/theme';
import { Pantalla, Tarjeta, Boton } from '../../components/ui';
import { useSesion } from '../../lib/useSesion';
import { confirmar } from '../../lib/avisar';
import { type Atributo, normalizarAtributo, sugerencias, validarAtributo } from '../../lib/fichaTecnica';

type Parametros = {
  id: string; codigo?: string; descripcion?: string; marca?: string; rubro?: string; stock?: string; precio?: string;
};

export default function FichaRepuesto() {
  useSesion();
  const p = useLocalSearchParams<Parametros>();
  const id = p.id;
  const queryClient = useQueryClient();

  const [atributo, setAtributo] = useState('');
  const [valor, setValor] = useState('');
  const [editando, setEditando] = useState<string | null>(null);
  const [error, setError] = useState('');

  const atributos = useQuery({
    queryKey: ['atributos', id],
    queryFn: () => apiFetch<Atributo[]>(`Repuesto/${id}/Atributos`),
    enabled: !!id,
  });

  const nombres = useQuery({
    queryKey: ['atributos-nombres'],
    queryFn: () => apiFetch<{ Atributo: string }[]>('Repuesto/Atributos/Nombres'),
    staleTime: 5 * 60_000,
  });

  const lista = atributos.data ?? [];
  const chips = sugerencias((nombres.data ?? []).map((n) => n.Atributo), lista.map((a) => a.Atributo));

  function limpiar() {
    setAtributo('');
    setValor('');
    setEditando(null);
    setError('');
  }

  const guardar = useMutation({
    mutationFn: () =>
      apiFetch<Atributo[]>(`Repuesto/${id}/Atributos`, {
        method: 'PUT',
        body: JSON.stringify({ Atributo: normalizarAtributo(atributo), Valor: valor.trim() }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atributos', id] });
      queryClient.invalidateQueries({ queryKey: ['atributos-nombres'] });
      limpiar();
    },
    onError: (e: Error) => setError(e.message),
  });

  const borrar = useMutation({
    mutationFn: (nombre: string) =>
      apiFetch(`Repuesto/${id}/Atributos?atributo=${encodeURIComponent(nombre)}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atributos', id] });
      limpiar();
    },
    onError: (e: Error) => setError(e.message),
  });

  function enviar() {
    const problema = validarAtributo(atributo, valor);
    if (problema) {
      setError(problema);
      return;
    }
    setError('');
    guardar.mutate();
  }

  function editar(a: Atributo) {
    setAtributo(a.Atributo);
    setValor(a.Valor ?? '');
    setEditando(a.Atributo);
    setError('');
  }

  function pedirBorrado(a: Atributo) {
    confirmar('Borrar dato', `¿Borrar "${a.Atributo}" de la ficha?`, 'Borrar', () => borrar.mutate(a.Atributo));
  }

  return (
    <Pantalla>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <Tarjeta>
            <View style={estilos.encabezado}>
              <Text style={estilos.codigo}>{p.codigo}</Text>
              {p.marca ? <Text style={estilos.marca}>{p.marca}</Text> : null}
            </View>
            <Text style={estilos.descripcion}>{p.descripcion}</Text>
            <View style={estilos.datos}>
              {p.rubro ? <Dato etiqueta="Rubro" valor={p.rubro} /> : null}
              {p.stock ? <Dato etiqueta="Stock" valor={p.stock} /> : null}
              {p.precio ? <Dato etiqueta="Precio" valor={moneda(Number(p.precio))} /> : null}
            </View>
          </Tarjeta>

          <View style={{ height: 12 }} />

          <Tarjeta>
            <Text style={estilos.seccion}>FICHA TÉCNICA</Text>
            {atributos.isLoading ? (
              <ActivityIndicator color={theme.colors.navy} style={{ marginVertical: 16 }} />
            ) : atributos.isError ? (
              <Text style={estilos.error}>{(atributos.error as Error)?.message}</Text>
            ) : lista.length === 0 ? (
              <Text style={estilos.vacio}>Todavía no tiene datos técnicos. Cargá el primero abajo.</Text>
            ) : (
              lista.map((a, i) => (
                <View key={a.Id} style={[estilos.fila, i === 0 && { borderTopWidth: 0 }]} testID={'atributo-' + a.Atributo}>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => editar(a)} accessibilityRole="button" accessibilityLabel={`Editar ${a.Atributo}`}>
                    <Text style={estilos.etiqueta}>{a.Atributo}</Text>
                    <Text style={estilos.valor}>{a.Valor}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => pedirBorrado(a)} hitSlop={8} accessibilityLabel={`Borrar ${a.Atributo}`}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.red} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </Tarjeta>

          <View style={{ height: 12 }} />

          <Tarjeta>
            <Text style={estilos.seccion}>{editando ? 'EDITAR DATO' : 'AGREGAR DATO'}</Text>
            {!editando && chips.length > 0 ? (
              <View style={estilos.chips}>
                {chips.slice(0, 8).map((c) => (
                  <TouchableOpacity key={c} onPress={() => setAtributo(c)} style={[estilos.chip, atributo === c && estilos.chipActivo]}>
                    <Text style={[estilos.chipTexto, atributo === c && { color: '#fff' }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            <Text style={estilos.label}>Dato</Text>
            <TextInput
              style={[estilos.input, !!editando && estilos.inputBloqueado]}
              value={atributo}
              onChangeText={setAtributo}
              editable={!editando}
              placeholder="Ej.: Medida"
              placeholderTextColor={theme.colors.muted}
              maxLength={100}
              accessibilityLabel="Nombre del dato"
            />
            <Text style={estilos.label}>Valor</Text>
            <TextInput
              style={estilos.input}
              value={valor}
              onChangeText={setValor}
              placeholder="Ej.: 205/55 R16"
              placeholderTextColor={theme.colors.muted}
              maxLength={255}
              accessibilityLabel="Valor del dato"
              onSubmitEditing={enviar}
            />
            {error ? <Text style={estilos.error}>{error}</Text> : null}
            <View style={{ height: 12 }} />
            <Boton onPress={enviar} cargando={guardar.isPending} disabled={guardar.isPending || borrar.isPending}>
              {editando ? 'Guardar cambio' : 'Agregar a la ficha'}
            </Boton>
            {editando ? (
              <>
                <View style={{ height: 8 }} />
                <Boton variante="secundario" onPress={limpiar}>Cancelar</Boton>
              </>
            ) : null}
          </Tarjeta>
        </ScrollView>
      </KeyboardAvoidingView>
    </Pantalla>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.dato}>
      <Text style={estilos.datoEtiqueta}>{etiqueta}</Text>
      <Text style={estilos.datoValor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 14, paddingBottom: 40 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codigo: { fontFamily: 'monospace', fontWeight: '800', color: theme.colors.navy, fontSize: 15, letterSpacing: 0.5 },
  marca: { fontSize: 10, fontWeight: '700', color: theme.colors.muted, backgroundColor: theme.colors.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, textTransform: 'uppercase' },
  descripcion: { fontSize: 16, color: theme.colors.text, marginTop: 6, lineHeight: 22 },
  datos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  dato: { backgroundColor: theme.colors.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  datoEtiqueta: { fontSize: 10, fontWeight: '700', color: theme.colors.muted, textTransform: 'uppercase' },
  datoValor: { fontSize: 14, fontWeight: '700', color: theme.colors.navy },
  seccion: { fontSize: 11, fontWeight: '700', color: theme.colors.muted, letterSpacing: 0.6, marginBottom: 8 },
  vacio: { fontSize: 13, color: theme.colors.muted, paddingVertical: 6 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.colors.border },
  etiqueta: { fontSize: 12, fontWeight: '700', color: theme.colors.muted },
  valor: { fontSize: 15, color: theme.colors.text, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  chipActivo: { backgroundColor: theme.colors.navy, borderColor: theme.colors.navy },
  chipTexto: { fontSize: 12, fontWeight: '600', color: theme.colors.navy },
  label: { fontSize: 12, fontWeight: '700', color: theme.colors.text, marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: theme.colors.text, backgroundColor: theme.colors.card },
  inputBloqueado: { backgroundColor: theme.colors.bg, color: theme.colors.muted },
  error: { color: theme.colors.red, fontSize: 13, marginTop: 8 },
});
