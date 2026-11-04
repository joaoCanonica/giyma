// Ids estáveis por build (mesma ordem de renderização → mesmo HTML).
let n = 0;
export function novoId(prefixo: string): string {
  n += 1;
  return `${prefixo}-${n}`;
}
