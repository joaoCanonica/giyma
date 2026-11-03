import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const raiz = join(import.meta.dirname, '..');
const ler = (caminho: string) => readFileSync(join(raiz, caminho), 'utf8');

// O bloco "CONTEXTO DO PROJETO" fica na seção B do pacote de prompts.
function blocoDoPacote(): string {
  const pacote = ler('docs/GIYMA_PACOTE_PROMPTS_CODE.md');
  const secao = pacote.slice(pacote.indexOf('## B. BLOCO'));
  const inicio = secao.indexOf('````text\n') + '````text\n'.length;
  return secao.slice(inicio, secao.indexOf('\n````', inicio) + 1);
}

describe('fundação', () => {
  it('CLAUDE.md é o bloco de contexto sem alteração', () => {
    expect(ler('CLAUDE.md')).toBe(blocoDoPacote());
    expect(ler('docs/CONTEXTO.md')).toBe(ler('CLAUDE.md'));
  });

  it('package.json tem nome, engines, packageManager e todos os scripts', () => {
    const pkg = JSON.parse(ler('package.json')) as {
      name: string;
      engines: Record<string, string>;
      packageManager: string;
      scripts: Record<string, string>;
    };
    expect(pkg.name).toBe('giyma-site');
    expect(pkg.engines.node).toBeTruthy();
    expect(pkg.engines.pnpm).toBeTruthy();
    expect(pkg.packageManager).toMatch(/^pnpm@\d+\.\d+\.\d+$/);
    for (const s of [
      'dev',
      'build',
      'preview',
      'check',
      'test',
      'validate-config',
      'audit-compliance',
      'audit-a11y',
      'audit-lighthouse',
      'audit-seo',
      'audit-contraste',
      'media:prepare',
      'capturar',
    ]) {
      expect(pkg.scripts[s], s).toBeTruthy();
    }
  });

  it('dependências fixadas em versão exata', () => {
    const pkg = JSON.parse(ler('package.json')) as Record<string, Record<string, string>>;
    const todas = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [nome, versao] of Object.entries(todas)) {
      expect(versao, nome).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it('logos estão em media-originais/marca/', () => {
    for (const logo of ['vertical', 'horizontal', 'mark']) {
      expect(existsSync(join(raiz, `media-originais/marca/giyma-logo-${logo}.svg`))).toBe(true);
    }
  });

  it('a home usa o Documento, que decide o robots (preview nunca indexa)', () => {
    expect(ler('src/pages/index.astro')).toContain('<Documento');
    expect(ler('src/components/base/Documento.astro')).toContain(
      "interna ? 'noindex, nofollow' : robots()",
    );
  });
});
