// Leitura e validação do media.manifest.json: JSON Schema + regras do projeto.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

export const RAIZ = fileURLToPath(new URL('../..', import.meta.url));
const PASTAS = ['fotos', 'videos', 'marca'];

export function carregarManifesto(raiz = RAIZ) {
  return JSON.parse(readFileSync(join(raiz, 'media.manifest.json'), 'utf8'));
}

function dentro(r, d) {
  return r.x + r.largura <= d.largura && r.y + r.altura <= d.altura;
}

/** Antes e depois só é publicável com consentimento autorizado; naoUsar nunca. */
export function publicavel(item) {
  if (item.naoUsar) return false;
  if (item.natureza === 'antes-depois') return item.consentimento === 'autorizado';
  return true;
}

/** Devolve a lista de erros (vazia = válido). */
export function validarManifesto(manifesto, raiz = RAIZ) {
  const schema = JSON.parse(readFileSync(join(raiz, 'media.manifest.schema.json'), 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: true, strictRequired: false });
  const validar = ajv.compile(schema);
  if (!validar(manifesto)) {
    return validar.errors.map((e) => `schema: ${e.instancePath || '/'} ${e.message}`);
  }

  const erros = [];
  const ids = new Set();
  const registrarId = (id, onde) => {
    if (ids.has(id)) erros.push(`id repetido: ${id} (${onde})`);
    ids.add(id);
  };

  const arquivos = new Set();
  for (const item of manifesto.itens) {
    const onde = item.id;
    registrarId(item.id, onde);
    if (arquivos.has(item.arquivo)) erros.push(`${onde}: arquivo com dois registros`);
    arquivos.add(item.arquivo);
    if (!existsSync(join(raiz, item.arquivo)))
      erros.push(`${onde}: arquivo não existe (${item.arquivo})`);

    const d = item.dimensoes;
    const temDerivado =
      item.recortes?.length || item.trechos?.length || item.stills?.length || item.derivados;
    if (item.naoUsar && temDerivado)
      erros.push(`${onde}: naoUsar não pode ter recortes, trechos, stills ou derivados`);
    if (item.audioLiberado && item.tipo !== 'video')
      erros.push(`${onde}: audioLiberado só vale para vídeo`);

    for (const r of item.recortes ?? []) {
      registrarId(r.id, onde);
      if (!dentro(r.retangulo, d)) erros.push(`${onde}/${r.id}: recorte fora da imagem`);
      if (r.proporcao !== 'livre') {
        const [a, b] = r.proporcao.split(':').map(Number);
        const real = r.retangulo.largura / r.retangulo.altura;
        if (Math.abs(real - a / b) > 0.01)
          erros.push(`${onde}/${r.id}: proporção ${real.toFixed(3)} ≠ ${r.proporcao}`);
      }
    }

    if (item.natureza === 'antes-depois') {
      const ad = item.antesDepois;
      if (item.consentimento === 'nao-precisa')
        erros.push(`${onde}: antes e depois exige consentimento (pendente ou autorizado)`);
      if (ad.antes.largura !== ad.depois.largura || ad.antes.altura !== ad.depois.altura) {
        erros.push(`${onde}: antes e depois com recortes de tamanhos diferentes`);
      }
      if (!dentro(ad.antes, d) || !dentro(ad.depois, d))
        erros.push(`${onde}: recorte de antes/depois fora da imagem`);
      if (item.consentimento === 'autorizado' && (!ad.procedimento || !ad.tempoDecorrido)) {
        erros.push(`${onde}: autorizado exige procedimento e tempo decorrido para a legenda`);
      }
      if (item.edicoes.length)
        erros.push(`${onde}: antes e depois não admite edição além do recorte`);
    } else if (item.antesDepois) {
      erros.push(`${onde}: antesDepois só em natureza antes-depois`);
    }

    for (const t of item.trechos ?? []) {
      registrarId(t.id, onde);
      if (t.inicio >= t.fim) erros.push(`${onde}/${t.id}: início ≥ fim`);
      if (d.duracao !== undefined && t.fim > d.duracao + 0.05)
        erros.push(`${onde}/${t.id}: fim além da duração`);
      for (const w of t.larguras)
        if (w > d.largura) erros.push(`${onde}/${t.id}: largura ${w} > original (upscale)`);
      for (const v of t.variantes ?? []) {
        registrarId(v.id, onde);
        if (!dentro(v.retangulo, d)) erros.push(`${onde}/${v.id}: variante fora do quadro`);
      }
      for (const c of t.capitulos ?? []) {
        registrarId(`${t.id}-${c.id}`, onde);
        if (c.inicio >= c.fim || c.inicio < t.inicio || c.fim > t.fim)
          erros.push(`${onde}/${t.id}/${c.id}: capítulo fora do trecho`);
      }
      const j = t.posterJanela;
      if (j && (j.inicio >= j.fim || j.inicio < t.inicio || j.fim > t.fim)) {
        erros.push(`${onde}/${t.id}: janela do pôster fora do trecho`);
      }
      if (typeof t.poster === 'number' && (t.poster < t.inicio || t.poster > t.fim))
        erros.push(`${onde}/${t.id}: pôster fora do trecho`);
    }

    for (const s of item.stills ?? []) {
      registrarId(s.id, onde);
      if (d.duracao !== undefined && s.em > d.duracao)
        erros.push(`${onde}/${s.id}: tempo além da duração`);
      if (!dentro(s.recorte, d)) erros.push(`${onde}/${s.id}: recorte fora do quadro`);
      if (s.larguraMaxExibicao > s.recorte.largura)
        erros.push(`${onde}/${s.id}: exibição maior que o quadro (upscale)`);
    }
  }

  // Todo original tem registro.
  for (const pasta of PASTAS) {
    const dir = join(raiz, 'media-originais', pasta);
    if (!existsSync(dir)) continue;
    for (const nome of readdirSync(dir)) {
      if (nome.startsWith('.')) continue;
      const caminho = `media-originais/${pasta}/${nome}`;
      if (!arquivos.has(caminho)) erros.push(`sem registro no manifesto: ${caminho}`);
    }
  }
  return erros;
}
