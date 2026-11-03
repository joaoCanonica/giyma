// Travas do CLAUDE.md, seção 9, como funções puras (dados entram, problemas saem).
// Usadas por validate-config, audit-compliance e test-config (cenários simulados).
//
// Produção trava SÓ em: horário ausente; WhatsApp ausente; termo vetado no HTML;
// antes e depois sem consentimento=autorizado; mídia naoUsar referenciada; CRF
// ausente ao lado do nome. Preview sempre passa com pendências (faixa e selo).

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'node-html-parser';
import * as cfg from '../../src/config/index.ts';
import {
  encontrarTermosVetados,
  TERMOS_NOME_POPULAR,
  TERMOS_VETADOS,
} from '../../src/config/termos.ts';
import * as schemas from '../../src/content/schemas.ts';
import { validarSemana } from '../../src/lib/horario.ts';
import { linkWhatsApp } from '../../src/lib/whatsapp.ts';
import { carregarManifesto, publicavel as midiaPublicavel, RAIZ } from './manifesto.mjs';

export { RAIZ };

// ---------- carga ----------

export function carregarConteudo(raiz = RAIZ) {
  const ler = (pasta) => {
    const dir = join(raiz, 'src', 'content', pasta);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .map((f) => ({
        id: f.replace(/\.json$/, ''),
        data: JSON.parse(readFileSync(join(dir, f), 'utf8')),
      }));
  };
  return { tratamentos: ler('tratamentos'), fases: ler('fases'), resultados: ler('resultados') };
}

export function carregarTudo(raiz = RAIZ) {
  return {
    config: structuredClone(cfg.config),
    conteudo: carregarConteudo(raiz),
    manifesto: carregarManifesto(raiz),
  };
}

// ---------- config + conteúdo ----------

const ehBloqueante = (c) =>
  !c || c.estado === 'bloqueante' || c.valor === null || c.valor === undefined || c.valor === '';

/** Coleta todos os textos de um objeto (para o filtro de termos), exceto as chaves indicadas. */
function textos(obj, ignorar = new Set(), caminho = '') {
  if (typeof obj === 'string') return [{ caminho, texto: obj }];
  if (Array.isArray(obj)) return obj.flatMap((x, i) => textos(x, ignorar, `${caminho}[${i}]`));
  if (obj && typeof obj === 'object') {
    return Object.entries(obj).flatMap(([k, v]) =>
      ignorar.has(k) ? [] : textos(v, ignorar, caminho ? `${caminho}.${k}` : k),
    );
  }
  return [];
}

/**
 * @returns {{ erros: string[], travasProducao: string[], avisos: string[] }}
 *   erros: inconsistência (falha em qualquer modo) · travasProducao: falta de dado que trava produção
 */
export function verificarConfig({ config, conteudo, manifesto }) {
  const erros = [];
  const travasProducao = [];
  const avisos = [];

  // Travas de dado (seção 9).
  if (ehBloqueante(config.horario.semana))
    travasProducao.push(`horário ausente (${config.horario.semana.rotulo ?? 'sem valor'})`);
  else
    erros.push(
      ...validarSemana(config.horario.semana.valor, config.horario.excecoes).map(
        (e) => `horário: ${e}`,
      ),
    );
  if (ehBloqueante(config.contato.whatsapp) || config.contato.whatsapp.estado !== 'confirmado') {
    travasProducao.push('WhatsApp ausente');
  } else {
    try {
      linkWhatsApp('teste', config.contato.whatsapp.valor);
    } catch (e) {
      erros.push(`WhatsApp: ${e.message}`);
    }
  }
  if (
    ehBloqueante(config.profissional.registro) ||
    config.profissional.registro.estado !== 'confirmado'
  ) {
    travasProducao.push('CRF ausente (registro da profissional não confirmado)');
  }

  // Páginas que dependem de dado bloqueante saem da produção (o resto funciona).
  for (const [pagina, campos] of Object.entries({
    'dra-ester-santos': [config.profissional.posEstetica],
  })) {
    if (campos.some(ehBloqueante))
      avisos.push(
        `página /${pagina} fica fora da produção até: ${campos
          .filter(ehBloqueante)
          .map((c) => c.rotulo)
          .join(', ')}`,
      );
  }

  // Schemas das coleções.
  const validar = (lista, schema, nome) =>
    lista
      .map(({ id, data }) => {
        const r = schema.safeParse(data);
        if (!r.success)
          erros.push(
            ...r.error.issues.map(
              (i) => `${nome}/${id}: ${i.path.join('.') || '(raiz)'} ${i.message}`,
            ),
          );
        return r.success ? { id, data: r.data } : null;
      })
      .filter(Boolean);
  const tratamentos = validar(conteudo.tratamentos, schemas.tratamento, 'tratamentos');
  const fases = validar(conteudo.fases, schemas.fase, 'fases');
  const resultados = validar(conteudo.resultados, schemas.resultado, 'resultados');

  // Referências cruzadas.
  const slugs = new Map(tratamentos.map((t) => [t.data.slug, t.data]));
  for (const t of tratamentos) {
    if (t.id !== t.data.slug) erros.push(`tratamentos/${t.id}: arquivo e slug diferentes`);
    const m = /^Olá! Vim pelo site da Giyma e gostaria de agendar uma avaliação sobre (.+)\.$/.exec(
      t.data.whatsappMensagem,
    );
    if (!m) erros.push(`tratamentos/${t.id}: whatsappMensagem fora do modelo`);
    if (t.data.status === 'pendente')
      avisos.push(`tratamento ${t.id} pendente: não aparece em produção`);
  }
  const faixasDeFase = new Map(fases.map((f) => [f.data.faixa, f.data]));
  for (const faixa of schemas.FAIXAS)
    if (!faixasDeFase.has(faixa)) erros.push(`fases: falta a faixa ${faixa}`);
  for (const f of fases) {
    for (const s of f.data.focos) {
      const t = slugs.get(s);
      if (!t) erros.push(`fases/${f.id}: foco "${s}" não existe em tratamentos`);
      else if (!t.fases.includes(f.data.faixa))
        erros.push(
          `fases/${f.id}: "${s}" é foco, mas o tratamento não lista a fase ${f.data.faixa}`,
        );
    }
    if (!f.data.frase) avisos.push(`fase ${f.data.faixa}: frase da Ester vazia (sessão 5)`);
  }
  for (const t of tratamentos) {
    for (const fx of t.data.fases) {
      if (!faixasDeFase.get(fx)?.focos.includes(t.data.slug))
        erros.push(`tratamentos/${t.id}: lista a fase ${fx}, mas a fase não o tem como foco`);
    }
  }

  // Mídia: ids existentes e publicáveis.
  const porId = new Map();
  for (const item of manifesto.itens) {
    porId.set(item.id, item);
    for (const sub of [...(item.recortes ?? []), ...(item.trechos ?? []), ...(item.stills ?? [])])
      porId.set(sub.id, item);
  }
  const conferirMidia = (id, onde) => {
    const item = porId.get(id);
    if (!item) erros.push(`${onde}: mídia "${id}" não existe no manifesto`);
    else if (!midiaPublicavel(item))
      erros.push(
        `${onde}: mídia "${id}" não é publicável (naoUsar ou antes e depois sem autorização)`,
      );
  };
  for (const t of tratamentos)
    t.data.midia.forEach((id) => conferirMidia(id, `tratamentos/${t.id}`));
  for (const f of fases) if (f.data.video) conferirMidia(f.data.video.trecho, `fases/${f.id}`);
  for (const v of config.valores)
    if (v.still.valor) conferirMidia(v.still.valor, `valores/${v.id}`);

  for (const r of resultados) {
    const item = manifesto.itens.find((i) => i.id === r.data.midia);
    if (!item || item.natureza !== 'antes-depois') {
      erros.push(`resultados/${r.id}: "${r.data.midia}" não é um antes e depois do manifesto`);
      continue;
    }
    if (item.consentimento !== r.data.consentimento) {
      erros.push(
        `resultados/${r.id}: consentimento "${r.data.consentimento}" diferente do manifesto ("${item.consentimento}")`,
      );
    }
    if (r.data.tratamento && !slugs.has(r.data.tratamento))
      erros.push(`resultados/${r.id}: tratamento "${r.data.tratamento}" não existe`);
    if (r.data.consentimento !== 'autorizado')
      avisos.push(`resultado ${r.id}: consentimento pendente, fora da produção`);
  }

  // Termos vetados no conteúdo (nomePopular é a exceção prevista: só aparece em [data-nome-popular]).
  const fontesDeTexto = [
    ...tratamentos.map((t) => [
      `tratamentos/${t.id}`,
      textos(t.data, new Set(['nomePopular', 'provas', 'fonte'])),
    ]),
    ...fases.map((f) => [`fases/${f.id}`, textos(f.data, new Set(['base']))]),
    ...resultados.map((r) => [`resultados/${r.id}`, textos(r.data, new Set(['observacao']))]),
    ['config.profissional.citacoes', textos(config.profissional.citacoes, new Set(['fonte']))],
    ['config.valores', textos(config.valores.map((v) => ({ nome: v.nome, frase: v.frase.valor })))],
    ['config.avaliacoes.destaque', textos({ texto: config.avaliacoes.destaque.valor.texto })],
  ];
  for (const [onde, lista] of fontesDeTexto) {
    for (const { caminho, texto } of lista) {
      for (const o of encontrarTermosVetados(texto))
        erros.push(`${onde}.${caminho}: termo vetado "${o.termo}" em "${o.trecho}"`);
    }
  }

  if (config.avaliacoes.exibirNota)
    erros.push('avaliacoes.exibirNota=true com menos de 30 avaliações');

  return { erros, travasProducao, avisos };
}

// ---------- HTML do dist ----------

const ATRIBUTOS_TEXTO = ['alt', 'title', 'aria-label', 'placeholder'];
const ATRIBUTOS_MIDIA = ['src', 'srcset', 'href', 'poster', 'data-src', 'data-srcset', 'content'];
const NOME = /Dra\.?\s*Esth?er(\s+Santos)?/iu;

function ancestral(no, seletorAttr) {
  for (let n = no; n; n = n.parentNode) {
    if (n.getAttribute && n.getAttribute(seletorAttr) !== undefined) return n;
  }
  return null;
}

function textoNormal(s) {
  return s
    .normalize('NFC')
    .replace(/\u00a0/g, ' ')
    .replace(/&nbsp;/g, ' ');
}

/** Ids de mídia que nunca podem aparecer publicados. */
export function idsProibidos(manifesto) {
  return manifesto.itens.filter((i) => !midiaPublicavel(i)).map((i) => i.id);
}

/**
 * @returns {{ regra: string, detalhe: string }[]}
 */
export function auditarHtml(html, { manifesto, modo = 'preview', existe = () => true } = {}) {
  const raiz = parse(html, {
    comment: false,
    blockTextElements: { script: false, style: false, noscript: true, pre: true },
  });
  const problemas = [];
  const proibidos = idsProibidos(manifesto);

  // 1. Termos vetados (texto visível e atributos de texto).
  const textosDoc = [];
  const andar = (n) => {
    if (n.nodeType === 3) textosDoc.push(n);
    for (const c of n.childNodes ?? []) andar(c);
  };
  andar(raiz);
  for (const t of textosDoc) {
    const texto = textoNormal(t.text);
    const popular = ancestral(t.parentNode, 'data-nome-popular');
    const termos = popular
      ? TERMOS_VETADOS.filter((x) => !TERMOS_NOME_POPULAR.includes(x))
      : TERMOS_VETADOS;
    for (const o of encontrarTermosVetados(texto, termos))
      problemas.push({ regra: 'termo-vetado', detalhe: `"${o.termo}" em "${o.trecho}"` });
  }
  for (const el of raiz.querySelectorAll('*')) {
    for (const a of ATRIBUTOS_TEXTO) {
      const v = el.getAttribute(a);
      if (v)
        for (const o of encontrarTermosVetados(textoNormal(v)))
          problemas.push({
            regra: 'termo-vetado',
            detalhe: `"${o.termo}" no atributo ${a}: "${o.trecho}"`,
          });
    }
    if (el.tagName === 'META') {
      const v = el.getAttribute('content');
      if (v) {
        for (const o of encontrarTermosVetados(textoNormal(v)))
          problemas.push({
            regra: 'termo-vetado',
            detalhe: `"${o.termo}" em <meta>: "${o.trecho}"`,
          });
        if (NOME.test(v) && !v.includes('CRF-SC 3984'))
          problemas.push({
            regra: 'crf-ao-lado-do-nome',
            detalhe: `<meta> cita "${v.match(NOME)[0]}" sem CRF-SC 3984`,
          });
      }
    }
  }

  // 2. "Dra. Ester (Santos)" sempre dentro de <AssinaturaProfissional> com o CRF.
  for (const t of textosDoc) {
    const texto = textoNormal(t.text);
    const m = NOME.exec(texto);
    if (!m) continue;
    if (ancestral(t.parentNode, 'data-citacao-literal')) continue;
    const bloco = ancestral(t.parentNode, 'data-assinatura-profissional');
    const conteudo = bloco ? textoNormal(bloco.text) : '';
    if (!bloco || !conteudo.includes('CRF-SC 3984') || !/farmacêutica esteta/i.test(conteudo)) {
      problemas.push({
        regra: 'crf-ao-lado-do-nome',
        detalhe: `"${m[0]}" fora de <AssinaturaProfissional> com "farmacêutica esteta · CRF-SC 3984"`,
      });
    }
  }
  for (const el of raiz.querySelectorAll('*')) {
    for (const a of ATRIBUTOS_TEXTO) {
      const v = el.getAttribute(a);
      if (v && NOME.test(v) && !v.includes('CRF-SC 3984'))
        problemas.push({
          regra: 'crf-ao-lado-do-nome',
          detalhe: `atributo ${a} cita o nome sem CRF: "${v}"`,
        });
    }
  }

  // 3. Mídia: nada de original, naoUsar ou antes e depois sem autorização; tudo existe.
  for (const el of raiz.querySelectorAll('*')) {
    for (const a of ATRIBUTOS_MIDIA) {
      const v = el.getAttribute(a);
      if (!v) continue;
      const urls = a.endsWith('srcset') ? v.split(',').map((s) => s.trim().split(/\s+/)[0]) : [v];
      for (const u of urls) {
        if (/media-originais|SaveClip|snapinsta|Captura de tela/i.test(u)) {
          problemas.push({ regra: 'midia-original', detalhe: `${a}="${u}" aponta para original` });
          continue;
        }
        if (!u.startsWith('/media/')) continue;
        const nome = u.split('/').pop() ?? '';
        const id = proibidos.find((p) => nome.startsWith(p));
        if (id)
          problemas.push({
            regra: 'midia-proibida',
            detalhe: `${a}="${u}" (${id}: naoUsar ou antes e depois sem consentimento=autorizado)`,
          });
        else if (!existe(u))
          problemas.push({ regra: 'midia-inexistente', detalhe: `${a}="${u}" não existe no dist` });
      }
    }
  }

  // 4. Marcas de preview não podem sair em produção.
  if (modo === 'producao' && raiz.querySelector('[data-provisorio], [data-preview-banner]')) {
    problemas.push({
      regra: 'provisorio-em-producao',
      detalhe: 'selo PROVISÓRIO ou faixa de revisão no HTML de produção',
    });
  }

  return problemas;
}
