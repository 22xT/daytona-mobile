export const TAMANO_PAGINA = 20;

export function siguientePagina(ultima: unknown[], paginas: unknown[][], tamano = TAMANO_PAGINA): number | undefined {
  return ultima.length < tamano ? undefined : paginas.length + 1;
}
