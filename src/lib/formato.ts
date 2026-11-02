export function fecha(valor: string | null | undefined): string {
  const d = new Date(valor ?? '');
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function hora(valor: string | null | undefined): string {
  const d = new Date(valor ?? '');
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export function numeroComprobante(id: number | string | null | undefined): string {
  const limpio = String(id ?? '').replace(/\D/g, '');
  return 'N° ' + limpio.padStart(8, '0');
}

export function esAnulada(estado: string | null | undefined): boolean {
  return String(estado ?? '').toLowerCase().includes('anul');
}
