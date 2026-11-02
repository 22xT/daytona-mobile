import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../lib/theme';

export interface Pestana<T extends string> {
  id: T;
  label: string;
}

interface Props<T extends string> {
  pestanas: Pestana<T>[];
  activa: T;
  onChange: (id: T) => void;
}

export function Pestanas<T extends string>({ pestanas, activa, onChange }: Props<T>) {
  return (
    <View style={estilos.barra} accessibilityRole="tablist">
      {pestanas.map((p) => {
        const esActiva = p.id === activa;
        return (
          <TouchableOpacity
            key={p.id}
            testID={'pestana-' + p.id}
            onPress={() => onChange(p.id)}
            style={[estilos.pestana, esActiva && estilos.pestanaActiva]}
            accessibilityRole="tab"
            accessibilityState={{ selected: esActiva }}
          >
            <Text style={[estilos.texto, esActiva && estilos.textoActivo]}>{p.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row', margin: 12, marginBottom: 6, padding: 4, gap: 4,
    backgroundColor: theme.colors.card, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border,
  },
  pestana: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  pestanaActiva: { backgroundColor: theme.colors.navy },
  texto: { fontSize: 13, fontWeight: '700', color: theme.colors.muted },
  textoActivo: { color: '#fff' },
});
