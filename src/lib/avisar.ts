import { Alert, Platform } from 'react-native';

export function avisar(titulo: string, mensaje: string) {
  if (Platform.OS === 'web') window.alert(`${titulo}\n${mensaje}`);
  else Alert.alert(titulo, mensaje);
}

export function confirmar(titulo: string, mensaje: string, textoAccion: string, accion: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n${mensaje}`)) accion();
    return;
  }
  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoAccion, style: 'destructive', onPress: accion },
  ]);
}
