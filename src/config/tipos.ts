// Estados de um dado do cliente. Nada é inventado: o que falta fica marcado.
//   confirmado → valor com fonte (post, bio, documento enviado pelo João)
//   opcional   → pode faltar; o site funciona sem (null = ainda não veio)
//   bloqueante → falta e trava produção (ou a página que depende dele)
//   aviso      → existe ou falta, mas pede atenção antes de publicar

export interface Confirmado<T> {
  readonly estado: 'confirmado';
  readonly valor: T;
  readonly fonte: string;
}
export interface Opcional<T> {
  readonly estado: 'opcional';
  readonly valor: T | null;
}
export interface Bloqueante {
  readonly estado: 'bloqueante';
  readonly valor: null;
  readonly rotulo: string;
}
export interface Aviso<T> {
  readonly estado: 'aviso';
  readonly valor: T | null;
  readonly rotulo: string;
  readonly motivo: string;
}

export type Campo<T> = Confirmado<T> | Opcional<T> | Bloqueante | Aviso<T>;

export function confirmado<T>(valor: T, fonte: string): Confirmado<T> {
  if (!fonte.trim()) throw new Error('confirmado() exige a fonte do dado');
  return { estado: 'confirmado', valor, fonte };
}

export function opcional<T>(valor: T | null = null): Opcional<T> {
  return { estado: 'opcional', valor };
}

export function bloqueante(rotulo: string): Bloqueante {
  return { estado: 'bloqueante', valor: null, rotulo };
}

export function aviso<T>(rotulo: string, motivo: string, valor: T | null = null): Aviso<T> {
  return { estado: 'aviso', valor, rotulo, motivo };
}

/** O campo tem valor utilizável? */
export function temValor<T>(
  campo: Campo<T>,
): campo is (Confirmado<T> | Opcional<T> | Aviso<T>) & { valor: T } {
  return campo.valor !== null && campo.valor !== undefined;
}

/** Valor do campo ou o substituto (ex.: "Horário pelo WhatsApp"). */
export function valorOu<T, S>(campo: Campo<T>, substituto: S): T | S {
  return temValor(campo) ? campo.valor : substituto;
}

/** Campo que precisa aparecer com o selo PROVISÓRIO em preview. */
export function ehProvisorio(campo: Campo<unknown>): boolean {
  return campo.estado !== 'confirmado';
}
