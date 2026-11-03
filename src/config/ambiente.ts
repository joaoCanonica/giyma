// Modo do build: "preview" (padrão) ou "producao". Lido do ambiente no build (Node).
export type Modo = 'preview' | 'producao';

function lerEnv(chave: string): string | undefined {
  return typeof process !== 'undefined' ? process.env[chave] : undefined;
}

export function modoAtual(): Modo {
  return lerEnv('GIYMA_MODO') === 'producao' ? 'producao' : 'preview';
}

export const ehPreview = (): boolean => modoAtual() === 'preview';
export { lerEnv };
