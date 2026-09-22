// app/index.tsx — Login
// Formulario con TextInput y validacion (clase 2), boton con feedback
// (clase 2), sesion en el store de Zustand (clase 4), navegacion con el
// router (clase 1). Responsive: una columna en celular, dos en tablet.

import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Text,
  TextInput, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '../lib/api';
import { useAuthStore } from '../lib/store/auth';
import { theme } from '../lib/theme';
import { Pantalla, Tarjeta, Titulo, Subtitulo, Etiqueta, CampoIcono, Boton, TextoError, Enlace } from '../components/ui';
import { Marca } from '../components/Marca';

const ANCHO_TABLET = 820;

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { width } = useWindowDimensions();
  const dosColumnas = width >= ANCHO_TABLET;

  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [recordar, setRecordar] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const claveRef = useRef<TextInput>(null);

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
  const puedeEnviar = correoValido && clave.length > 0 && !cargando;
  const errorCorreo = correo.length > 0 && !correoValido;

  async function entrar() {
    if (!puedeEnviar) return;
    setError('');
    setCargando(true);

    try {
      const r = await fetch(API_BASE + 'Usuario/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Correo: correo.trim(), Clave: clave }),
      });

      const datos = await r.json().catch(() => null);

      if (!r.ok || !datos?.Ok || !datos?.Token) {
        setError(datos?.Mensaje || 'Usuario o contraseña incorrectos.');
        return;
      }

      login({ token: datos.Token, nombre: datos.Nombre ?? correo, rol: datos.Rol ?? null });
      // TODO: "Recordarme" requiere persistencia segura (expo-secure-store).
      // Por ahora la sesion vive mientras la app este abierta.
      router.replace('/venta');
    } catch {
      setError('No pudimos conectar con el servidor. Verificá tu conexión e intentá nuevamente.');
    } finally {
      setCargando(false);
    }
  }

  const formulario = (
    <Tarjeta style={estilos.tarjeta}>
      {!dosColumnas ? (
        <View style={{ marginBottom: 26 }}>
          <Marca />
        </View>
      ) : null}

      <Titulo>Bienvenido</Titulo>
      <Subtitulo style={{ marginBottom: 22 }}>Ingresá a tu cuenta para continuar</Subtitulo>

      <Etiqueta>Correo electrónico</Etiqueta>
      <CampoIcono
        icono="mail-outline"
        value={correo}
        onChangeText={(t) => { setCorreo(t); if (error) setError(''); }}
        error={errorCorreo}
        placeholder="nombre@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => claveRef.current?.focus()}
        accessibilityLabel="Correo electrónico"
      />
      {errorCorreo ? <TextoError style={{ marginTop: 6 }}>Ingresá un correo válido.</TextoError> : null}

      <View style={{ height: 16 }} />

      <Etiqueta>Contraseña</Etiqueta>
      <CampoIcono
        ref={claveRef}
        icono="lock-closed-outline"
        esClave
        value={clave}
        onChangeText={(t) => { setClave(t); if (error) setError(''); }}
        error={!!error}
        placeholder="Tu contraseña"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={entrar}
        accessibilityLabel="Contraseña"
      />

      <View style={estilos.filaOpciones}>
        <TouchableOpacity
          style={estilos.recordar}
          onPress={() => setRecordar((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: recordar }}
          accessibilityLabel="Recordarme"
          hitSlop={8}
        >
          <Ionicons
            name={recordar ? 'checkbox' : 'square-outline'}
            size={20}
            color={recordar ? theme.colors.accent : theme.colors.muted}
          />
          <Text style={estilos.recordarTexto}>Recordarme</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/recuperar')} hitSlop={8} accessibilityRole="link">
          <Enlace>¿Olvidaste tu contraseña?</Enlace>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={estilos.cajaError} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle-outline" size={18} color={theme.colors.red} />
          <TextoError style={{ marginTop: 0, flex: 1 }}>{error}</TextoError>
        </View>
      ) : null}

      <View style={{ height: 22 }} />

      <Boton onPress={entrar} disabled={!puedeEnviar} cargando={cargando} accessibilityLabel="Iniciar sesión">
        {cargando ? 'Ingresando…' : 'INICIAR SESIÓN'}
      </Boton>

      <Text style={estilos.pie}>Acceso exclusivo para personal de Daytona</Text>
    </Tarjeta>
  );

  // ---------- Tablet: dos zonas ----------
  if (dosColumnas) {
    return (
      <View style={estilos.split}>
        <View style={estilos.lado}>
          <View style={estilos.ladoDecor} />
          <View style={estilos.ladoContenido}>
            <Marca claro />
            <Text style={estilos.ladoTexto}>
              Catálogo, stock, ventas y proveedores en un solo lugar.
            </Text>
          </View>
        </View>
        <Pantalla style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={estilos.centro} keyboardShouldPersistTaps="handled">
            {formulario}
          </ScrollView>
        </Pantalla>
      </View>
    );
  }

  // ---------- Celular: una columna ----------
  return (
    <Pantalla>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={estilos.centro} keyboardShouldPersistTaps="handled">
          {formulario}
        </ScrollView>
      </KeyboardAvoidingView>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  centro: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  tarjeta: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  filaOpciones: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  recordar: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 32 },
  recordarTexto: { color: theme.colors.text, fontSize: theme.font.md },
  cajaError: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.colors.redSoft, borderRadius: theme.radius.sm,
    padding: 10, marginTop: 14,
  },
  pie: { textAlign: 'center', color: theme.colors.muted, fontSize: 12, marginTop: 18 },

  split: { flex: 1, flexDirection: 'row' },
  lado: { flex: 1, backgroundColor: theme.colors.navy, justifyContent: 'center', overflow: 'hidden' },
  // Franja diagonal roja muy tenue: referencia automotriz sin ruido
  ladoDecor: {
    position: 'absolute', right: -120, top: -80, width: 420, height: 900,
    backgroundColor: theme.colors.red, opacity: 0.06, transform: [{ rotate: '18deg' }],
  },
  ladoContenido: { padding: 48, gap: 20 },
  ladoTexto: { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 22, maxWidth: 360, textAlign: 'center' },
});
