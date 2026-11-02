import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Linking, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { Pantalla, Tarjeta, Boton } from '../../components/ui';
import { useSesion } from '../../lib/useSesion';

export default function Escanear() {
  useSesion();
  const router = useRouter();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [linterna, setLinterna] = useState(false);
  const leido = useRef(false);

  function alLeer({ data }: BarcodeScanningResult) {
    const codigo = String(data ?? '').trim();
    if (!codigo || leido.current) return;
    leido.current = true;
    router.navigate({ pathname: '/venta', params: { codigo } });
  }

  if (Platform.OS === 'web') {
    return (
      <Pantalla>
        <View style={estilos.centro}>
          <Tarjeta style={estilos.tarjeta}>
            <Ionicons name="phone-portrait-outline" size={44} color={theme.colors.navy} />
            <Text style={estilos.titulo}>Escáner en el celular</Text>
            <Text style={estilos.texto}>La lectura de códigos usa la cámara del celular. Abrí la app con Expo Go o con el APK.</Text>
            <View style={{ height: 16 }} />
            <Boton variante="secundario" onPress={() => router.back()}>Volver</Boton>
          </Tarjeta>
        </View>
      </Pantalla>
    );
  }

  if (!permiso) return <Pantalla />;

  if (!permiso.granted) {
    return (
      <Pantalla>
        <View style={estilos.centro}>
          <Tarjeta style={estilos.tarjeta}>
            <Ionicons name="camera-outline" size={44} color={theme.colors.navy} />
            <Text style={estilos.titulo}>Permiso de cámara</Text>
            <Text style={estilos.texto}>Para leer el código de barras del repuesto necesitamos usar la cámara.</Text>
            <View style={{ height: 16 }} />
            {permiso.canAskAgain ? (
              <Boton onPress={pedirPermiso}>Permitir cámara</Boton>
            ) : (
              <Boton onPress={() => Linking.openSettings()}>Abrir ajustes</Boton>
            )}
            <View style={{ height: 10 }} />
            <Boton variante="secundario" onPress={() => router.back()}>Volver</Boton>
          </Tarjeta>
        </View>
      </Pantalla>
    );
  }

  return (
    <View style={estilos.fondo}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={linterna}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'itf14', 'qr'] }}
        onBarcodeScanned={alLeer}
      />
      <View style={estilos.capa} pointerEvents="box-none">
        <Text style={estilos.ayuda}>Apuntá al código de barras del repuesto</Text>
        <View style={estilos.marco} />
        <TouchableOpacity
          style={estilos.linterna}
          onPress={() => setLinterna((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={linterna ? 'Apagar linterna' : 'Encender linterna'}
        >
          <Ionicons name={linterna ? 'flash' : 'flash-outline'} size={24} color="#fff" />
          <Text style={estilos.linternaTexto}>{linterna ? 'Apagar luz' : 'Encender luz'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', padding: 20 },
  tarjeta: { alignItems: 'center', maxWidth: 440, width: '100%', alignSelf: 'center' },
  titulo: { fontSize: 18, fontWeight: '800', color: theme.colors.navy, marginTop: 10 },
  texto: { fontSize: 14, color: theme.colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  fondo: { flex: 1, backgroundColor: '#000' },
  capa: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  ayuda: { color: '#fff', fontSize: 15, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  marco: { width: 260, height: 150, borderWidth: 3, borderColor: '#fff', borderRadius: 14 },
  linterna: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24 },
  linternaTexto: { color: '#fff', fontWeight: '700' },
});
