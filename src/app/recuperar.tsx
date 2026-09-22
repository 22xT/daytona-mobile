// app/recuperar.tsx — Recuperar contraseña
// Usa el endpoint SolicitudReset que YA EXISTE en el backend (es el mismo
// que usa el login web). La solicitud queda registrada y un Administrador
// la procesa desde el sistema. No hay OTP ni envio de mail automatico:
// eso queda como TODO cuando exista en el backend.

import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '../lib/api';
import { theme } from '../lib/theme';
import { Pantalla, Tarjeta, Titulo, Subtitulo, Etiqueta, CampoIcono, Boton, TextoError } from '../components/ui';
import { Marca } from '../components/Marca';

export default function Recuperar() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());

  async function enviar() {
    if (!correoValido || cargando) return;
    setError('');
    setCargando(true);

    try {
      const r = await fetch(API_BASE + 'SolicitudReset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Correo: correo.trim(), Mensaje: 'Solicitud desde la app móvil' }),
      });

      if (!r.ok) {
        const t = await r.text().catch(() => '');
        setError(t || 'No pudimos registrar la solicitud. Intentá nuevamente.');
        return;
      }
      setEnviado(true);
    } catch {
      setError('No pudimos conectar con el servidor. Verificá tu conexión e intentá nuevamente.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <Pantalla>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={estilos.centro} keyboardShouldPersistTaps="handled">
          <Tarjeta style={estilos.tarjeta}>
            <View style={{ marginBottom: 24 }}><Marca compacto /></View>

            {enviado ? (
              <View style={estilos.exito} accessibilityLiveRegion="polite">
                <Ionicons name="checkmark-circle" size={44} color={theme.colors.green} />
                <Titulo style={{ textAlign: 'center', marginTop: 10 }}>Solicitud enviada</Titulo>
                <Subtitulo style={{ textAlign: 'center', marginTop: 8 }}>
                  Un administrador va a restablecer tu acceso y avisarte por este mismo correo.
                </Subtitulo>
                <View style={{ height: 22 }} />
                <Boton onPress={() => router.replace('/')}>Volver al inicio</Boton>
              </View>
            ) : (
              <>
                <Titulo>Recuperar contraseña</Titulo>
                <Subtitulo style={{ marginBottom: 22 }}>Ingresá el correo asociado a tu cuenta.</Subtitulo>

                <Etiqueta>Correo electrónico</Etiqueta>
                <CampoIcono
                  icono="mail-outline"
                  value={correo}
                  onChangeText={(t) => { setCorreo(t); if (error) setError(''); }}
                  error={correo.length > 0 && !correoValido}
                  placeholder="nombre@empresa.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={enviar}
                  accessibilityLabel="Correo electrónico"
                />

                {error ? <TextoError>{error}</TextoError> : null}

                <View style={{ height: 22 }} />

                <Boton onPress={enviar} disabled={!correoValido} cargando={cargando}>
                  {cargando ? 'Enviando…' : 'Enviar instrucciones'}
                </Boton>

                <View style={{ height: 12 }} />

                <Boton variante="secundario" onPress={() => router.back()}>Volver</Boton>
              </>
            )}
          </Tarjeta>

          {/* TODO: cuando el backend tenga OTP y cambio de clave desde la app,
              agregar aca los pasos "Código de 6 dígitos" y "Nueva contraseña".
              Hoy el reset lo procesa un Administrador desde el sistema web. */}
        </ScrollView>
      </KeyboardAvoidingView>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  centro: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  tarjeta: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  exito: { alignItems: 'center', paddingVertical: 8 },
});
