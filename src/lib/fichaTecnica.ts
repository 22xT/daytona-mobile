export interface Atributo {
  Id: number;
  IdRepuesto: number;
  Atributo: string;
  Valor: string | null;
}

export const ATRIBUTOS_SUGERIDOS = ['Medida', 'Material', 'Posición', 'Compatibilidad', 'Rosca', 'Voltaje'];

export function normalizarAtributo(texto: string): string {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  if (!limpio) return '';
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

export function sugerencias(existentes: string[], usados: string[]): string[] {
  const vistos = new Set<string>();
  const usadosMin = new Set(usados.map((u) => u.toLowerCase()));
  const resultado: string[] = [];
  for (const nombre of [...ATRIBUTOS_SUGERIDOS, ...existentes]) {
    const n = normalizarAtributo(nombre);
    const clave = n.toLowerCase();
    if (!n || vistos.has(clave) || usadosMin.has(clave)) continue;
    vistos.add(clave);
    resultado.push(n);
  }
  return resultado;
}

export function validarAtributo(atributo: string, valor: string): string | null {
  if (!normalizarAtributo(atributo)) return 'Indicá el nombre del dato.';
  if (!valor.trim()) return 'Indicá el valor.';
  if (atributo.trim().length > 100) return 'El nombre admite hasta 100 caracteres.';
  if (valor.trim().length > 255) return 'El valor admite hasta 255 caracteres.';
  return null;
}
