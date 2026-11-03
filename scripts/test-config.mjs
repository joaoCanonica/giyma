#!/usr/bin/env node
// Travas simuladas: prova que cada trava do CLAUDE.md, seção 9, dispara (e que o
// preview passa com as pendências reais). Sai com 1 se alguma expectativa falhar.
import assert from 'node:assert/strict';
import { carregarTudo, auditarHtml, verificarConfig } from './lib/travas.mjs';

const base = carregarTudo();
const clone = () => structuredClone(base);
let ok = 0;
const falhas = [];

function caso(nome, fn) {
  try {
    fn();
    ok++;
    console.log(`  ✓ ${nome}`);
  } catch (e) {
    falhas.push(nome);
    console.log(`  ✗ ${nome}\n    ${e.message.split('\n').join('\n    ')}`);
  }
}
const tem = (lista, re) => lista.some((x) => re.test(x));
const regras = (html, modo = 'preview') =>
  auditarHtml(html, { manifesto: base.manifesto, modo }).map((p) => p.regra);
const pagina = (corpo) =>
  `<!doctype html><html lang="pt-BR"><head><title>t</title></head><body>${corpo}</body></html>`;
const ASSINATURA =
  '<p data-assinatura-profissional><span>Dra. Ester Santos</span> · <span>farmacêutica esteta</span> · <span>CRF-SC 3984</span></p>';

console.log('Config real');
caso('preview passa: sem erros, com pendências', () => {
  const r = verificarConfig(base);
  assert.deepEqual(r.erros, []);
  assert.ok(r.avisos.length > 0);
});
caso('produção trava hoje por horário ausente (e só por ele)', () => {
  const r = verificarConfig(base);
  assert.equal(r.travasProducao.length, 1);
  assert.match(r.travasProducao[0], /horário ausente/);
});

console.log('Travas de dado');
caso('com horário confirmado, produção libera', () => {
  const c = clone();
  const dia = [{ abre: '09:00', fecha: '18:00' }];
  c.config.horario.semana = {
    estado: 'confirmado',
    fonte: 'teste',
    valor: { dom: [], seg: dia, ter: dia, qua: dia, qui: dia, sex: dia, sab: [] },
  };
  const r = verificarConfig(c);
  assert.deepEqual(r.travasProducao, []);
  assert.deepEqual(r.erros, []);
});
caso('horário inválido (fecha antes de abrir) é erro', () => {
  const c = clone();
  c.config.horario.semana = {
    estado: 'confirmado',
    fonte: 't',
    valor: {
      dom: [],
      seg: [{ abre: '18:00', fecha: '09:00' }],
      ter: [],
      qua: [],
      qui: [],
      sex: [],
      sab: [],
    },
  };
  assert.ok(tem(verificarConfig(c).erros, /fecha/));
});
caso('WhatsApp ausente trava produção', () => {
  const c = clone();
  c.config.contato.whatsapp = { estado: 'bloqueante', valor: null, rotulo: 'whatsapp' };
  assert.ok(tem(verificarConfig(c).travasProducao, /WhatsApp ausente/));
});
caso('WhatsApp com número inválido é erro', () => {
  const c = clone();
  c.config.contato.whatsapp.valor = '9982';
  assert.ok(tem(verificarConfig(c).erros, /WhatsApp/));
});
caso('CRF ausente trava produção', () => {
  const c = clone();
  c.config.profissional.registro = { estado: 'opcional', valor: null };
  assert.ok(tem(verificarConfig(c).travasProducao, /CRF ausente/));
});
caso('pós em estética ausente tira só a página da Ester', () => {
  const r = verificarConfig(base);
  assert.ok(tem(r.avisos, /dra-ester-santos/));
  assert.ok(!tem(r.travasProducao, /pós/));
});

console.log('Conteúdo');
caso('resultado "autorizado" com manifesto pendente é erro', () => {
  const c = clone();
  const r = c.conteudo.resultados.find((x) => x.id === 'f03');
  Object.assign(r.data, {
    consentimento: 'autorizado',
    tempoDecorrido: '15 dias',
    legenda: 'Preenchimento de mento, 15 dias depois.',
  });
  assert.ok(tem(verificarConfig(c).erros, /diferente do manifesto/));
});
caso('resultado autorizado sem tempo decorrido é erro de schema', () => {
  const c = clone();
  c.conteudo.resultados[0].data.consentimento = 'autorizado';
  assert.ok(tem(verificarConfig(c).erros, /tempoDecorrido/));
});
caso('termo vetado no conteúdo é erro ("resultado imediato")', () => {
  const c = clone();
  c.conteudo.tratamentos[0].data.resultadosEsperados = 'Resultado imediato e natural.';
  assert.ok(tem(verificarConfig(c).erros, /termo vetado "resultado imediato"/));
});
caso('tratamento apontando para mídia naoUsar é erro', () => {
  const c = clone();
  c.conteudo.tratamentos[0].data.midia = ['v-resultados-celular'];
  assert.ok(tem(verificarConfig(c).erros, /não é publicável/));
});
caso('foco de fase inexistente é erro', () => {
  const c = clone();
  c.conteudo.fases[0].data.focos.push('fios-de-pdo');
  assert.ok(tem(verificarConfig(c).erros, /fios-de-pdo/));
});

console.log('Textos (sessão 5)');
const pagina_ = (c, id) => c.conteudo.paginas.find((p) => p.id === id).data;
caso('textos reais: sem termo vetado nem "Dra." sem CRF', () => {
  const r = verificarConfig(base);
  assert.ok(!tem(r.erros, /termo vetado|Dra\. Ester/));
});
caso('"Botox" num texto de página é erro', () => {
  const c = clone();
  pagina_(c, 'home').blocos.manifesto.paragrafos.push('Botox com naturalidade.');
  assert.ok(tem(verificarConfig(c).erros, /termo vetado "Botox"/));
});
caso('"Dra. Ester" sem o CRF no mesmo texto é erro', () => {
  const c = clone();
  pagina_(c, 'a-giyma').blocos.abertura.paragrafos.push('A Dra. Ester te espera.');
  assert.ok(tem(verificarConfig(c).erros, /sem "farmacêutica esteta/));
});
caso('nome popular fora da FAQ é erro', () => {
  const c = clone();
  pagina_(c, 'home').blocos.manifesto.paragrafos.push('Sobre o {{nome-popular:botox}}.');
  assert.ok(tem(verificarConfig(c).erros, /nome popular fora da FAQ/));
});
caso('meta title acima de 60 caracteres é erro de schema', () => {
  const c = clone();
  pagina_(c, 'home').meta.title = 'x'.repeat(61);
  assert.ok(tem(verificarConfig(c).erros, /paginas\/home: meta.title/));
});

console.log('HTML (audit-compliance)');
caso('página limpa passa', () =>
  assert.deepEqual(regras(pagina(`${ASSINATURA}<p>Para que sua melhor versão floresça.</p>`)), []),
);
caso('"Botox" no texto trava', () =>
  assert.ok(regras(pagina('<h2>Botox em Lages</h2>')).includes('termo-vetado')),
);
caso('"botox" como nome popular, em [data-nome-popular], passa', () =>
  assert.deepEqual(
    regras(
      pagina('<p>A toxina botulínica é conhecida como <span data-nome-popular>botox</span>.</p>'),
    ),
    [],
  ),
);
caso('nome popular não libera outros termos', () =>
  assert.ok(regras(pagina('<p data-nome-popular>botox garantido</p>')).includes('termo-vetado')),
);
caso('termo vetado em alt trava', () =>
  assert.ok(
    regras(pagina('<img src="/x.avif" alt="avaliação gratuita">')).includes('termo-vetado'),
  ),
);
caso('"Dra. Ester Santos" sem CRF trava', () =>
  assert.ok(
    regras(pagina('<p>Dra. Ester Santos atende em Lages.</p>')).includes('crf-ao-lado-do-nome'),
  ),
);
caso('"Dra. Ester" sozinho trava', () =>
  assert.ok(regras(pagina('<p>Fale com a Dra. Ester.</p>')).includes('crf-ao-lado-do-nome')),
);
caso('assinatura sem "farmacêutica esteta" trava', () =>
  assert.ok(
    regras(pagina('<p data-assinatura-profissional>Dra. Ester Santos · CRF-SC 3984</p>')).includes(
      'crf-ao-lado-do-nome',
    ),
  ),
);
caso('citação literal da avaliação ("Dra. Esther") passa', () =>
  assert.deepEqual(
    regras(
      pagina('<blockquote data-citacao-literal>Dra. Esther extremamente atenciosa</blockquote>'),
    ),
    [],
  ),
);
caso('meta description com o nome e sem CRF trava', () =>
  assert.ok(
    regras(
      '<html><head><meta name="description" content="Dra. Ester Santos em Lages"></head><body></body></html>',
    ).includes('crf-ao-lado-do-nome'),
  ),
);
caso('antes e depois sem consentimento referenciado trava', () =>
  assert.ok(
    regras(pagina('<img src="/media/resultados/f03-antes-depois-par-800.avif" alt="">')).includes(
      'midia-proibida',
    ),
  ),
);
caso('original referenciado trava', () =>
  assert.ok(
    regras(pagina('<img src="/media-originais/fotos/SaveClip.App_627373272.jpg" alt="">')).includes(
      'midia-original',
    ),
  ),
);
caso('srcset com antes e depois trava', () =>
  assert.ok(
    regras(
      pagina(
        '<img srcset="/media/img/retrato-4x5-480.avif 480w, /media/resultados/f21-antes-depois-antes-480.avif 480w" alt="">',
      ),
    ).includes('midia-proibida'),
  ),
);
caso('selo PROVISÓRIO passa em preview e trava em produção', () => {
  const html = pagina('<span data-provisorio>PROVISÓRIO</span>');
  assert.deepEqual(regras(html, 'preview'), []);
  assert.ok(regras(html, 'producao').includes('provisorio-em-producao'));
});

console.log(`\n${ok} ok · ${falhas.length} falha(s)`);
process.exit(falhas.length ? 1 : 0);
