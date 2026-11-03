import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assinaturaProfissional, profissional } from '../src/config/profissional.ts';
import { pendencias, paginaLiberada, contato, horario, avaliacoes } from '../src/config/index.ts';
import { encontrarTermosVetados, TERMOS_VETADOS } from '../src/config/termos.ts';
import {
  aviso,
  bloqueante,
  confirmado,
  opcional,
  temValor,
  valorOu,
  ehProvisorio,
} from '../src/config/tipos.ts';
import { robots } from '../src/config/seo.ts';
import * as schemas from '../src/content/schemas.ts';
import {
  descreverEstado,
  estadoEm,
  formatarHora,
  linhasDaSemana,
  validarSemana,
  type Semana,
} from '../src/lib/horario.ts';
import { FAIXA_EM_TEXTO, linkWhatsApp, mensagens } from '../src/lib/whatsapp.ts';

const RAIZ = join(import.meta.dirname, '..');

describe('tipos', () => {
  it('confirmado exige fonte', () => {
    expect(() => confirmado('x', ' ')).toThrow(/fonte/);
    expect(confirmado('x', 'bio')).toEqual({ estado: 'confirmado', valor: 'x', fonte: 'bio' });
  });
  it('opcional, bloqueante e aviso', () => {
    expect(temValor(opcional())).toBe(false);
    expect(temValor(opcional('a'))).toBe(true);
    expect(valorOu(bloqueante('horário'), 'Horário pelo WhatsApp')).toBe('Horário pelo WhatsApp');
    expect(aviso('r', 'm').valor).toBeNull();
    expect(ehProvisorio(confirmado(1, 'f'))).toBe(false);
    expect(ehProvisorio(aviso('r', 'm', 1))).toBe(true);
  });
});

describe('config', () => {
  it('assinatura sempre completa', () => {
    expect(assinaturaProfissional()).toBe('Dra. Ester Santos · farmacêutica esteta · CRF-SC 3984');
  });
  it('pendências reais: horário e pós bloqueantes; origem do nome opcional e vazia', () => {
    const p = pendencias();
    const bloq = p.filter((x) => x.estado === 'bloqueante').map((x) => x.caminho);
    expect(bloq.sort()).toEqual(['horario.semana', 'profissional.posEstetica']);
    expect(p.some((x) => x.caminho === 'marca.origemDoNome')).toBe(true);
  });
  it('página da Ester bloqueada pela pós; o resto liberado', () => {
    expect(paginaLiberada('dra-ester-santos')).toBe(false);
    expect(paginaLiberada('toxina-botulinica')).toBe(true);
  });
  it('horário: texto de preview e fuso', () => {
    expect(horario.semana.estado).toBe('bloqueante');
    expect(horario.textoSemHorario).toBe('Horário pelo WhatsApp');
    expect(horario.fuso).toBe('America/Sao_Paulo');
  });
  it('contato: WhatsApp, mapas e como chegar vazio', () => {
    expect(contato.whatsapp.valor).toBe('5549998273904');
    expect(contato.mapas.valor.googleFicha).toContain('cid=332599069459016165');
    expect(contato.comoChegar).toEqual([]);
    expect(contato.estacionamento.valor).toBeNull();
  });
  it('avaliações: sem nota; Nathalia F. literal; sem depoimentos', () => {
    expect(avaliacoes.exibirNota).toBe(false);
    expect(avaliacoes.destaque.valor.autorExibicao).toBe('Nathalia F.');
    expect(avaliacoes.destaque.valor.texto).toBe(
      'Lugar aconchegante. Dra. Esther extremamente atenciosa e competente! Recomendo!',
    );
    expect(avaliacoes.depoimentosAutorizados).toEqual([]);
  });
  it('citações têm fonte', () => {
    for (const c of profissional.citacoes) expect(c.fonte.length).toBeGreaterThan(3);
  });
  it('preview nunca indexa', () => {
    expect(robots()).toBe('noindex, nofollow');
  });
});

describe('motor de horário', () => {
  const util = [
    { abre: '09:00', fecha: '12:00' },
    { abre: '14:00', fecha: '19:00' },
  ];
  const semana: Semana = {
    dom: [],
    seg: util,
    ter: util,
    qua: util,
    qui: util,
    sex: util,
    sab: [{ abre: '09:00', fecha: '13:00' }],
  };
  const excecoes = [{ data: '2026-11-20', intervalos: [], motivo: 'feriado' }];
  // Lages = UTC−3 (sem horário de verão).
  const em = (local: string) => estadoEm(new Date(`${local}:00-03:00`), semana, excecoes);

  it('aberto: fecha às…', () => {
    const e = em('2026-11-03T10:00');
    expect(e.aberto).toBe(true);
    expect(descreverEstado(e)).toBe('Aberto agora · fecha às 12h');
  });
  it('abre no minuto exato e fecha no minuto exato', () => {
    expect(em('2026-11-03T09:00').aberto).toBe(true);
    expect(descreverEstado(em('2026-11-03T19:00'))).toBe('Fechado · abre amanhã às 9h');
  });
  it('intervalo do almoço: abre hoje às 14h', () => {
    expect(descreverEstado(em('2026-11-03T12:30'))).toBe('Fechado · abre hoje às 14h');
  });
  it('antes de abrir: abre hoje às 9h', () => {
    expect(descreverEstado(em('2026-11-03T07:15'))).toBe('Fechado · abre hoje às 9h');
  });
  it('sábado à tarde: abre na segunda', () => {
    expect(descreverEstado(em('2026-11-07T14:00'))).toBe('Fechado · abre na segunda às 9h');
  });
  it('sexta à noite: abre amanhã (sábado)', () => {
    expect(descreverEstado(em('2026-11-06T20:00'))).toBe('Fechado · abre amanhã às 9h');
  });
  it('exceção: feriado fechado e pulado na próxima abertura', () => {
    expect(em('2026-11-20T10:00').aberto).toBe(false);
    expect(descreverEstado(em('2026-11-19T20:00'))).toBe('Fechado · abre no sábado às 9h');
  });
  it('usa o fuso, não o UTC (23h em Lages = 2h UTC do dia seguinte)', () => {
    expect(descreverEstado(estadoEm(new Date('2026-11-04T02:00:00Z'), semana, excecoes))).toBe(
      'Fechado · abre amanhã às 9h',
    );
  });
  it('semana vazia: só "Fechado"', () => {
    const vazia: Semana = { dom: [], seg: [], ter: [], qua: [], qui: [], sex: [], sab: [] };
    expect(descreverEstado(estadoEm(new Date(), vazia))).toBe('Fechado');
  });
  it('validação pega hora inválida, inversão e sobreposição', () => {
    expect(validarSemana(semana, excecoes)).toEqual([]);
    const ruim: Semana = {
      ...semana,
      seg: [{ abre: '9:00', fecha: '12:00' }],
      ter: [{ abre: '18:00', fecha: '08:00' }],
      qua: [
        { abre: '09:00', fecha: '13:00' },
        { abre: '12:00', fecha: '15:00' },
      ],
    };
    const erros = validarSemana(ruim);
    expect(erros.join()).toMatch(/hora inválida/);
    expect(erros.join()).toMatch(/precisa ser depois/);
    expect(erros.join()).toMatch(/sobrepostos/);
  });
  it('formatação', () => {
    expect(formatarHora('09:00')).toBe('9h');
    expect(formatarHora('09:30')).toBe('9h30');
    expect(linhasDaSemana(semana)[0]).toEqual({
      dia: 'seg',
      nome: 'segunda',
      texto: '9h–12h, 14h–19h',
    });
    expect(linhasDaSemana(semana)[6]?.texto).toBe('fechado');
  });
});

describe('WhatsApp', () => {
  const decodificar = (url: string) => new URL(url).searchParams.get('text') ?? '';

  it('geral', () => {
    expect(mensagens.geral()).toBe(
      'Olá! Vim pelo site da Giyma e gostaria de agendar uma avaliação com a Dra. Ester.',
    );
  });
  it('por tratamento', () => {
    expect(mensagens.tratamento('toxina botulínica')).toBe(
      'Olá! Vim pelo site da Giyma e gostaria de agendar uma avaliação sobre toxina botulínica.',
    );
    expect(() => mensagens.tratamento('  ')).toThrow();
  });
  it('por fase (todas as faixas)', () => {
    expect(mensagens.fase('40')).toBe(
      'Olá! Vim pelo site da Giyma. Tenho entre 40 e 49 anos e gostaria de entender o que faz sentido para a minha pele.',
    );
    expect(mensagens.fase('60+')).toContain('Tenho 60 ou mais anos');
    expect(Object.keys(FAIXA_EM_TEXTO)).toEqual([...schemas.FAIXAS]);
  });
  it('dúvida', () => {
    expect(mensagens.duvida('microagulhamento')).toBe(
      'Olá! Vim pelo site da Giyma e tenho uma dúvida sobre microagulhamento.',
    );
  });
  it('link wa.me com o número da config e texto codificado', () => {
    const url = linkWhatsApp(mensagens.geral());
    expect(url.startsWith('https://wa.me/5549998273904?text=')).toBe(true);
    expect(decodificar(url)).toBe(mensagens.geral());
    expect(url).not.toMatch(/ /);
  });
  it('rejeita número inválido e texto vazio', () => {
    expect(() => linkWhatsApp('oi', '9982')).toThrow(/inválido/);
    expect(() => linkWhatsApp(' ')).toThrow(/vazia/);
  });
  it('nenhuma mensagem tem termo vetado', () => {
    const todas = [
      mensagens.geral(),
      mensagens.tratamento('peeling'),
      mensagens.duvida('preço'),
      ...schemas.FAIXAS.map((f) => mensagens.fase(f)),
    ];
    for (const m of todas) expect(encontrarTermosVetados(m)).toEqual([]);
  });
});

describe('termos vetados', () => {
  it('lista igual à do CLAUDE.md (nada afrouxado)', () => {
    const claude = readFileSync(join(RAIZ, 'CLAUDE.md'), 'utf8');
    const linha = claude.split('\n').find((l) => l.includes('Termos vetados')) ?? '';
    const lista = [...linha.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect([...TERMOS_VETADOS]).toEqual(lista);
  });
  it('acha com borda de palavra e sem diferenciar caixa', () => {
    expect(encontrarTermosVetados('Aplicação de botox')).toHaveLength(1);
    expect(encontrarTermosVetados('A melhor clínica')).toHaveLength(1);
    expect(encontrarTermosVetados('clínica nº 1 de Lages')).toHaveLength(1);
    expect(encontrarTermosVetados('Resultado imediato')).toHaveLength(1);
  });
  it('não acusa frases legítimas', () => {
    expect(
      encontrarTermosVetados('Para que sua melhor versão floresça de dentro para fora.'),
    ).toEqual([]);
    expect(encontrarTermosVetados('Ela é a melhoria contínua')).toEqual([]);
    expect(encontrarTermosVetados('Microagulhamento dói? É confortável e seguro.')).toEqual([]);
  });
});

describe('coleções', () => {
  const ler = (pasta: string) =>
    readdirSync(join(RAIZ, 'src/content', pasta)).map((f) => ({
      id: f.replace('.json', ''),
      data: JSON.parse(readFileSync(join(RAIZ, 'src/content', pasta, f), 'utf8')) as unknown,
    }));

  it('tratamentos válidos; os 9 pedidos; corporal pendente', () => {
    const lista = ler('tratamentos').map(({ id, data }) => ({
      id,
      t: schemas.tratamento.parse(data),
    }));
    expect(lista.map((x) => x.id).sort()).toEqual(
      [
        'bioestimulador-de-colageno',
        'contorno-facial',
        'harmonizacao-corporal',
        'microagulhamento',
        'peeling',
        'preenchimento-labial',
        'rejuvenescimento-de-maos',
        'sulcos-e-olheiras',
        'toxina-botulinica',
      ].sort(),
    );
    const pendentes = lista.filter((x) => !schemas.publicavel.tratamento(x.t)).map((x) => x.id);
    expect(pendentes).toEqual(['harmonizacao-corporal']);
    for (const { t } of lista) {
      const tema = /sobre (.+)\.$/.exec(t.whatsappMensagem)?.[1] ?? '';
      expect(t.whatsappMensagem).toBe(mensagens.tratamento(tema));
    }
  });
  it('fases: 20 · 30 · 40 · 50 · 60+, cada uma com frase real da Ester e fonte', () => {
    const fases = ler('fases')
      .map(({ data }) => schemas.fase.parse(data))
      .sort((a, b) => a.ordem - b.ordem);
    expect(fases.map((f) => f.faixa)).toEqual([...schemas.FAIXAS]);
    for (const f of fases) {
      expect(f.frase?.texto.length).toBeGreaterThan(3);
      expect(f.frase?.fonte).toMatch(/post|vídeo|carrossel/);
      expect(f.oQueMuda).toBeTruthy();
    }
  });
  it('resultados: todos pendentes, nenhum publicável', () => {
    const rs = ler('resultados').map(({ data }) => schemas.resultado.parse(data));
    expect(rs).toHaveLength(9);
    for (const r of rs) expect(schemas.publicavel.resultado(r)).toBe(false);
  });
  it('schema de resultado recusa "autorizado" sem legenda e tempo', () => {
    const r = schemas.resultado.safeParse({
      midia: 'f03-antes-depois',
      tratamento: 'contorno-facial',
      tempoDecorrido: null,
      consentimento: 'autorizado',
      legenda: null,
      olhosTarjados: false,
    });
    expect(r.success).toBe(false);
  });
});
