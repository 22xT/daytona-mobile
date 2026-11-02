import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moneda } from '../lib/api';
import { theme } from '../lib/theme';

export interface MedioPago { Id: number; Codigo: string; Nombre: string; ComisionPorc: number; }
export interface PagoEnCurso { IdMedioPago: number; Codigo: string; Nombre: string; ComisionPorc: number; Monto: string; }

const ICONOS: Record<string, keyof typeof Ionicons.glyphMap> = {
  EFE: 'cash-outline', TRF: 'swap-horizontal-outline', QR: 'qr-code-outline',
  DEB: 'card-outline', CRE: 'card-outline', PRE: 'wallet-outline',
};

export const redondear = (n: number) => Math.round(n * 100) / 100;
export const aNumero = (t: string) => {
  const n = Number(String(t).replace(/\s/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

export function pagosARegistrar(pagos: PagoEnCurso[], total: number) {
  const noEfe = pagos.filter((p) => p.Codigo !== 'EFE').reduce((a, p) => a + aNumero(p.Monto), 0);
  let restaEfe = Math.max(0, total - noEfe);
  return pagos
    .map((p) => {
      let m = aNumero(p.Monto);
      if (p.Codigo === 'EFE') { const usado = Math.min(m, restaEfe); restaEfe -= usado; m = usado; }
      return { IdMedioPago: p.IdMedioPago, Monto: redondear(m) };
    })
    .filter((p) => p.Monto > 0);
}

export function estadoCobro(pagos: PagoEnCurso[], total: number) {
  const noEfe = pagos.filter((p) => p.Codigo !== 'EFE').reduce((a, p) => a + aNumero(p.Monto), 0);
  const efe = pagos.filter((p) => p.Codigo === 'EFE').reduce((a, p) => a + aNumero(p.Monto), 0);
  const pagado = noEfe + efe;
  const falta = redondear(Math.max(0, total - pagado));
  const vuelto = redondear(Math.max(0, efe - Math.max(0, total - noEfe)));
  const excedeSinEfectivo = redondear(noEfe - total) > 0;
  const comision = redondear(pagosARegistrar(pagos, total).reduce((a, p) => {
    const m = pagos.find((x) => x.IdMedioPago === p.IdMedioPago);
    return a + (m ? p.Monto * m.ComisionPorc / 100 : 0);
  }, 0));
  return { falta, vuelto, comision, excedeSinEfectivo, ok: falta === 0 && !excedeSinEfectivo && pagos.length > 0 };
}

interface Props {
  medios: MedioPago[];
  pagos: PagoEnCurso[];
  total: number;
  onChange: (p: PagoEnCurso[]) => void;
}

export function Cobro({ medios, pagos, total, onChange }: Props) {
  const { falta, vuelto, comision, excedeSinEfectivo } = estadoCobro(pagos, total);

  function agregar(m: MedioPago) {
    if (pagos.some((p) => p.IdMedioPago === m.Id)) return;
    onChange([...pagos, { IdMedioPago: m.Id, Codigo: m.Codigo, Nombre: m.Nombre, ComisionPorc: m.ComisionPorc,
                          Monto: falta > 0 ? String(falta) : '' }]);
  }

  function cambiar(id: number, monto: string) {
    onChange(pagos.map((p) => (p.IdMedioPago === id ? { ...p, Monto: monto.replace(/[^0-9.,]/g, '') } : p)));
  }

  function quitar(id: number) {
    onChange(pagos.filter((p) => p.IdMedioPago !== id));
  }

  return (
    <View>
      <View style={estilos.chips}>
        {medios.map((m) => {
          const usado = pagos.some((p) => p.IdMedioPago === m.Id);
          return (
            <TouchableOpacity key={m.Id} onPress={() => agregar(m)} disabled={usado}
              style={[estilos.chip, usado && estilos.chipUsado]}
              accessibilityRole="button" accessibilityLabel={'Agregar ' + m.Nombre}>
              <Ionicons name={ICONOS[m.Codigo] ?? 'cash-outline'} size={16} color={usado ? theme.colors.muted : theme.colors.navy} />
              <Text style={[estilos.chipTexto, usado && { color: theme.colors.muted }]}>{m.Nombre}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {pagos.length === 0 ? (
        <Text style={estilos.vacio}>Tocá el medio con el que paga el cliente.</Text>
      ) : pagos.map((p) => (
        <View key={p.IdMedioPago} style={estilos.linea}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.lineaNombre}>{p.Nombre}</Text>
            {p.ComisionPorc > 0 ? <Text style={estilos.lineaComision}>Comisión {p.ComisionPorc}%</Text> : null}
          </View>
          <Text style={estilos.signo}>$</Text>
          <TextInput value={p.Monto} onChangeText={(t) => cambiar(p.IdMedioPago, t)}
            keyboardType="decimal-pad" style={estilos.monto} placeholder="0"
            accessibilityLabel={'Importe en ' + p.Nombre} />
          <TouchableOpacity onPress={() => quitar(p.IdMedioPago)} hitSlop={8} accessibilityLabel={'Quitar ' + p.Nombre}>
            <Ionicons name="close-circle" size={22} color={theme.colors.muted} />
          </TouchableOpacity>
        </View>
      ))}

      {falta > 0 ? (
        <View style={[estilos.aviso, { backgroundColor: theme.colors.yellowSoft }]}>
          <Text style={[estilos.avisoTexto, { color: theme.colors.yellow }]}>Falta cubrir {moneda(falta)}</Text>
        </View>
      ) : null}
      {excedeSinEfectivo ? (
        <View style={[estilos.aviso, { backgroundColor: theme.colors.redSoft }]}>
          <Text style={[estilos.avisoTexto, { color: theme.colors.red }]}>Solo el efectivo puede superar el total.</Text>
        </View>
      ) : null}
      {vuelto > 0 ? (
        <View style={[estilos.aviso, { backgroundColor: theme.colors.greenSoft }]}>
          <Text style={[estilos.avisoTexto, { color: theme.colors.green }]}>Vuelto {moneda(vuelto)}</Text>
        </View>
      ) : null}
      {comision > 0 ? <Text style={estilos.comision}>Comisión estimada de los medios: {moneda(comision)}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8,
          borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  chipUsado: { backgroundColor: theme.colors.bg },
  chipTexto: { fontSize: 13, fontWeight: '600', color: theme.colors.navy },
  vacio: { color: theme.colors.muted, fontSize: 13, paddingVertical: 6 },
  linea: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8,
           borderTopWidth: 1, borderTopColor: theme.colors.border },
  lineaNombre: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  lineaComision: { fontSize: 11, color: theme.colors.muted },
  signo: { fontSize: 15, color: theme.colors.muted },
  monto: { minWidth: 110, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8,
           paddingHorizontal: 10, paddingVertical: 6, fontSize: 16, fontWeight: '700', textAlign: 'right', color: theme.colors.navy },
  aviso: { borderRadius: 8, padding: 8, marginTop: 10 },
  avisoTexto: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  comision: { fontSize: 12, color: theme.colors.muted, marginTop: 8, textAlign: 'center' },
});
