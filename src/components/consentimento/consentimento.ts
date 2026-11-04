// Consentimento (LGPD): "aceito" | "recusado" | null (ainda não escolheu).
// Guardado só no navegador (localStorage), sem cookie. Nada de terceiro carrega antes de "aceito".
export type Escolha = 'aceito' | 'recusado';
const CHAVE = 'giyma-consentimento';
const EVENTO = 'giyma:consentimento';

export function escolha(): Escolha | null {
  try {
    const v = localStorage.getItem(CHAVE);
    return v === 'aceito' || v === 'recusado' ? v : null;
  } catch {
    return null;
  }
}

export function definir(v: Escolha): void {
  try {
    localStorage.setItem(CHAVE, v);
  } catch {
    /* sem armazenamento: vale só nesta página */
  }
  memoria = v;
  dispatchEvent(new CustomEvent(EVENTO, { detail: v }));
}

let memoria: Escolha | null = null;
export const aceito = (): boolean => (memoria ?? escolha()) === 'aceito';

/** Roda `fn` agora se já aceitou; senão, quando aceitar. */
export function quandoAceitar(fn: () => void): void {
  if (aceito()) return fn();
  addEventListener(EVENTO, (e) => {
    if ((e as CustomEvent<Escolha>).detail === 'aceito') fn();
  });
}

/** Abre o aviso (rodapé "Preferências de privacidade", mapa interativo). */
export const abrir = (): boolean => dispatchEvent(new Event('giyma:abrir-consentimento'));
