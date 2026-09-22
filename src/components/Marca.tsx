// components/Marca.tsx
// La identidad de Daytona: logo tipografico con un trazo dinamico en rojo.
// Referencia automotriz sutil, sin caer en lo "racing". Se usa en el login
// y puede reutilizarse en cabeceras.

import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../lib/theme';

interface Props {
  claro?: boolean;     // version para fondo oscuro
  compacto?: boolean;  // sin la linea "sistema de gestion"
}

export function Marca({ claro = false, compacto = false }: Props) {
  const principal = claro ? '#fff' : theme.colors.navy;
  const secundario = claro ? 'rgba(255,255,255,0.75)' : theme.colors.muted;

  return (
    <View style={estilos.contenedor} accessibilityRole="header" accessibilityLabel="Daytona Repuestos Automotor">
      <View style={estilos.fila}>
        {/* Trazo dinamico: tres lineas que se acortan, como estelas de velocidad */}
        <View style={estilos.trazos}>
          <View style={[estilos.trazo, { width: 22 }]} />
          <View style={[estilos.trazo, { width: 15 }]} />
          <View style={[estilos.trazo, { width: 8 }]} />
        </View>
        <Text style={[estilos.nombre, { color: principal }]}>DAYTONA</Text>
      </View>
      <Text style={[estilos.rubro, { color: secundario }]}>REPUESTOS AUTOMOTOR</Text>
      {!compacto ? (
        <Text style={[estilos.sistema, { color: secundario }]}>Sistema de gestión</Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { alignItems: 'center' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trazos: { gap: 4, alignItems: 'flex-end' },
  trazo: { height: 3, backgroundColor: theme.colors.red, borderRadius: 2 },
  nombre: { fontSize: 36, fontWeight: '800', letterSpacing: 3 },
  rubro: { fontSize: 11, letterSpacing: 3.5, marginTop: 2, fontWeight: '600' },
  sistema: { fontSize: 13, marginTop: 10 },
});
