#!/usr/bin/env node
// Confere src/config e src/content contra as regras do projeto.
//   preview (padrão): passa com pendências; falha só em inconsistência.
//   produção (--producao ou GIYMA_MODO=producao): falha também nas travas de dado
//   (horário ausente, WhatsApp ausente, CRF ausente).
import { pendencias } from '../src/config/index.ts';
import { carregarTudo, verificarConfig } from './lib/travas.mjs';

const producao = process.argv.includes('--producao') || process.env.GIYMA_MODO === 'producao';
const { config, conteudo, manifesto } = carregarTudo();
const { erros, travasProducao, avisos, pendentesDeTexto } = verificarConfig({
  config,
  conteudo,
  manifesto,
});
const pend = pendencias();

console.log(`validate-config · modo ${producao ? 'PRODUÇÃO' : 'preview'}`);
console.log(
  `  coleções: ${conteudo.tratamentos.length} tratamentos · ${conteudo.fases.length} fases · ${conteudo.resultados.length} resultados`,
);
console.log(`\nPendências da config (${pend.length}):`);
for (const p of pend)
  console.log(
    `  ${p.estado === 'bloqueante' ? '■' : p.estado === 'aviso' ? '▲' : '·'} ${p.caminho}: ${p.rotulo}${p.motivo ? ` (${p.motivo})` : ''}`,
  );
if (avisos.length) {
  console.log(`\nAvisos (${avisos.length}):`);
  for (const a of avisos) console.log(`  ▲ ${a}`);
}
if (process.argv.includes('--textos')) {
  console.log(`\nPendências de texto (${pendentesDeTexto.length}):`);
  for (const t of pendentesDeTexto) console.log(`  · ${t}`);
}
console.log(`\nTravas de produção (${travasProducao.length}):`);
for (const t of travasProducao) console.log(`  ${producao ? '✗' : '■'} ${t}`);
if (erros.length) {
  console.log(`\nErros (${erros.length}):`);
  for (const e of erros) console.log(`  ✗ ${e}`);
}

const falhou = erros.length > 0 || (producao && travasProducao.length > 0);
console.log(
  `\n${falhou ? '✗ reprovado' : '✓ aprovado'}${!producao && travasProducao.length ? ' (preview: travas de produção ficam como pendência)' : ''}`,
);
process.exit(falhou ? 1 : 0);
