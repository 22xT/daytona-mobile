import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { theme } from '../lib/theme';

export function BadgeCarrito({ cantidad }: { cantidad: number }) {
  const escala = useRef(new Animated.Value(1)).current;
  const anterior = useRef(cantidad);

  useEffect(() => {
    if (cantidad > anterior.current) {
      Animated.sequence([
        Animated.timing(escala, { toValue: 1.5, duration: 120, useNativeDriver: true }),
        Animated.spring(escala, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
    anterior.current = cantidad;
  }, [cantidad, escala]);

  if (cantidad <= 0) return null;

  return (
    <Animated.View style={[estilos.badge, { transform: [{ scale: escala }] }]} testID="badge-carrito">
      <Text style={estilos.texto}>{cantidad}</Text>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  badge: {
    position: 'absolute', top: -6, right: -8, minWidth: 18, height: 18,
    borderRadius: 9, backgroundColor: theme.colors.red,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  texto: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
