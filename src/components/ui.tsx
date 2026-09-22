// components/ui.tsx
// Componentes de interfaz con styled-components (clase 1). Leen el tema del
// ThemeProvider. Se extendieron para soportar iconos, mostrar/ocultar
// contraseña, estados de foco y error, y boton con carga.

import { useState, forwardRef } from 'react';
import { ActivityIndicator, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

/* ---------- Contenedores ---------- */

export const Pantalla = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.bg};
`;

export const Tarjeta = styled.View`
  background-color: ${(p) => p.theme.colors.card};
  border-radius: ${(p) => p.theme.radius.lg}px;
  padding: ${(p) => p.theme.spacing.xl}px;
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.border};
  shadow-color: #000;
  shadow-opacity: 0.06;
  shadow-radius: 12px;
  shadow-offset: 0px 4px;
  elevation: 2;
`;

/* ---------- Textos ---------- */

export const Titulo = styled.Text`
  font-size: ${(p) => p.theme.font.xxl}px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.navy};
`;

export const Subtitulo = styled.Text`
  font-size: ${(p) => p.theme.font.md}px;
  color: ${(p) => p.theme.colors.muted};
  line-height: 20px;
`;

export const Etiqueta = styled.Text`
  font-size: ${(p) => p.theme.font.sm}px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.muted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

export const TextoError = styled.Text`
  color: ${(p) => p.theme.colors.red};
  font-size: ${(p) => p.theme.font.md}px;
  margin-top: 10px;
  line-height: 19px;
`;

export const Enlace = styled.Text`
  color: ${(p) => p.theme.colors.accent};
  font-size: ${(p) => p.theme.font.md}px;
  font-weight: 600;
`;

/* ---------- Campo simple (se conserva para pantallas que ya lo usan) ---------- */

export const Campo = styled.TextInput`
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radius.md}px;
  padding: 12px 14px;
  font-size: ${(p) => p.theme.font.lg}px;
  background-color: ${(p) => p.theme.colors.card};
  color: ${(p) => p.theme.colors.text};
`;

/* ---------- Campo con icono, foco, error y ojo ---------- */

interface CampoIconoProps extends TextInputProps {
  icono: keyof typeof Ionicons.glyphMap;
  error?: boolean;
  esClave?: boolean;   // muestra el boton de ojo
}

const CampoContenedor = styled.View<{ enfocado: boolean; error: boolean }>`
  flex-direction: row;
  align-items: center;
  border-width: ${(p) => (p.enfocado || p.error ? 2 : 1)}px;
  border-color: ${(p) =>
    p.error ? p.theme.colors.red
    : p.enfocado ? p.theme.colors.accent
    : p.theme.colors.border};
  border-radius: ${(p) => p.theme.radius.md}px;
  background-color: ${(p) => p.theme.colors.card};
  padding-left: 12px;
  min-height: 50px;
`;

export const CampoIcono = forwardRef<TextInput, CampoIconoProps>(function CampoIcono(
  { icono, error = false, esClave = false, style, ...props }, ref
) {
  const [enfocado, setEnfocado] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <CampoContenedor enfocado={enfocado} error={error} style={style}>
      <Ionicons
        name={icono}
        size={20}
        color={error ? theme.colors.red : enfocado ? theme.colors.accent : theme.colors.muted}
      />
      <TextInput
        ref={ref}
        {...props}
        secureTextEntry={esClave ? !visible : props.secureTextEntry}
        onFocus={(e) => { setEnfocado(true); props.onFocus?.(e); }}
        onBlur={(e) => { setEnfocado(false); props.onBlur?.(e); }}
        placeholderTextColor={theme.colors.muted}
        style={{
          flex: 1,
          paddingVertical: 12,
          paddingHorizontal: 10,
          fontSize: theme.font.lg,
          color: theme.colors.text,
        }}
      />
      {esClave ? (
        // Ancho fijo: el icono cambia pero el layout no se mueve
        <TouchableOpacity
          onPress={() => setVisible((v) => !v)}
          style={{ width: 44, height: 48, alignItems: 'center', justifyContent: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          hitSlop={8}
        >
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.muted} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 12 }} />
      )}
    </CampoContenedor>
  );
});

/* ---------- Boton ---------- */

type Variante = 'primario' | 'secundario' | 'peligro';

const BotonBase = styled.TouchableOpacity<{ variante: Variante; deshabilitado: boolean }>`
  background-color: ${(p) =>
    p.variante === 'secundario' ? p.theme.colors.card
    : p.variante === 'peligro' ? p.theme.colors.red
    : p.theme.colors.navy};
  border-width: ${(p) => (p.variante === 'secundario' ? 1 : 0)}px;
  border-color: ${(p) => p.theme.colors.border};
  min-height: 52px;
  padding: 0 18px;
  border-radius: ${(p) => p.theme.radius.md}px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  opacity: ${(p) => (p.deshabilitado ? 0.55 : 1)};
`;

export const BotonTexto = styled.Text<{ variante?: Variante }>`
  color: ${(p) => (p.variante === 'secundario' ? p.theme.colors.navy : '#fff')};
  font-weight: 700;
  font-size: ${(p) => p.theme.font.lg}px;
  letter-spacing: 0.3px;
`;

interface BotonProps {
  onPress: () => void;
  children: React.ReactNode;
  variante?: Variante;
  disabled?: boolean;
  cargando?: boolean;
  accessibilityLabel?: string;
  style?: object;
}

export function Boton({ onPress, children, variante = 'primario', disabled = false, cargando = false, accessibilityLabel, style }: BotonProps) {
  const inactivo = disabled || cargando;
  return (
    <BotonBase
      onPress={onPress}
      disabled={inactivo}
      deshabilitado={inactivo}
      variante={variante}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      style={style}
    >
      {cargando ? (
        <ActivityIndicator color={variante === 'secundario' ? theme.colors.navy : '#fff'} style={{ marginRight: 10 }} />
      ) : null}
      {typeof children === 'string' ? <BotonTexto variante={variante}>{children}</BotonTexto> : children}
    </BotonBase>
  );
}
