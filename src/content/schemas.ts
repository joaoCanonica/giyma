// Schemas das coleções (Zod). Usados pelo Astro (src/content.config.ts), pelos testes
// e pelo validate-config. Textos em null = copy da sessão 5 (nada é inventado aqui).
import { z } from 'astro/zod';

export const FAIXAS = ['20', '30', '40', '50', '60+'] as const;
export const faixa = z.enum(FAIXAS);

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
/** Texto de copy: null até a sessão 5. */
const copy = z.string().min(1).nullable();
const fonte = z.object({ ref: z.string().min(3), nota: z.string().min(1) });
/** Citação literal: SEMPRE com a fonte (post, destaque, vídeo). */
export const citacao = z
  .object({ texto: z.string().min(3), fonte: z.string().min(5), autor: z.string().optional() })
  .strict();
const meta = z
  .object({ title: z.string().min(10).max(60), description: z.string().min(50).max(155) })
  .strict();
/** De onde vem o texto: fala dela (literal), baseado num post, ou redação a validar com a Ester. */
const origem = z.enum(['literal', 'baseado-em-post', 'redacao-a-validar']);

export const tratamento = z
  .object({
    slug,
    nome: z.string().min(3),
    /** Nome popular (ex.: "botox"): só na FAQ, dentro de [data-nome-popular]. */
    nomePopular: z.string().min(2).nullable(),
    categoria: z.enum(['facial', 'maos', 'pele', 'corporal']),
    /** pendente = não aparece em produção. */
    status: z.enum(['confirmado', 'pendente']),
    areas: z.array(z.string().min(2)),
    /** Parágrafo-resposta: o quê + quem faz (com CRF) + onde. */
    resposta: copy,
    paraQuem: copy,
    oQueE: copy,
    comoEFeito: copy,
    /** Cuidados e riscos em linguagem simples, um parágrafo por item. */
    cuidados: z.array(z.string().min(10)).nullable(),
    duracaoSessao: z.string().min(1).nullable().optional(),
    /** Texto honesto, sem promessa (passa pelo filtro de termos vetados). */
    resultadosEsperados: copy,
    faq: z.array(
      z.object({
        pergunta: z.string().min(5),
        resposta: copy,
        fonte: z.string().min(3),
        origem: origem.optional(),
      }),
    ),
    citacoes: z.array(citacao).optional(),
    meta: meta.optional(),
    /** ids de media.manifest.json / indice.json (recortes, trechos, stills). */
    midia: z.array(z.string().min(2)),
    fases: z.array(faixa),
    whatsappMensagem: z.string().min(20),
    provas: z.array(fonte).min(1),
  })
  .strict();

export const fase = z
  .object({
    faixa,
    ordem: z.number().int().min(1),
    titulo: z.string().min(2),
    oQueMuda: copy,
    /** slugs de tratamentos. */
    focos: z.array(slug),
    /** Frase real da Ester para a fase, com fonte. */
    frase: citacao.nullable(),
    video: z
      .object({
        trecho: z.string().min(2),
        inicio: z.number().min(0),
        fim: z.number().positive(),
        observacao: z.string().optional(),
      })
      .refine((v) => v.fim > v.inicio, 'fim precisa ser depois do início')
      .nullable(),
    base: z.array(fonte).min(1),
  })
  .strict();

export const resultado = z
  .object({
    /** id do item antes-depois em media.manifest.json. */
    midia: z.string().regex(/^f\d{2}-antes-depois$/),
    tratamento: slug.nullable(),
    tempoDecorrido: z.string().min(2).nullable(),
    consentimento: z.enum(['pendente', 'autorizado']),
    legenda: copy,
    olhosTarjados: z.boolean(),
    observacao: z.string().optional(),
  })
  .strict()
  .superRefine((r, ctx) => {
    if (r.consentimento !== 'autorizado') return;
    for (const campo of ['tratamento', 'tempoDecorrido', 'legenda'] as const) {
      if (!r[campo]) {
        ctx.addIssue({
          code: 'custom',
          path: [campo],
          message: `autorizado exige ${campo} (legenda = procedimento + tempo)`,
        });
      }
    }
  });

// ---------- páginas e microtextos ----------

const item = z
  .object({
    id: z.string().optional(),
    titulo: z.string().optional(),
    texto: z.string().optional(),
    paragrafos: z.array(z.string().min(3)).optional(),
    citacao: citacao.optional(),
    fonte: z.string().optional(),
    origem: origem.optional(),
    midia: z.string().optional(),
    link: z.string().optional(),
    pendente: z.string().optional(),
  })
  .strict();

export const bloco = z
  .object({
    rotulo: z.string().optional(),
    titulo: z.string().optional(),
    paragrafos: z.array(z.string().min(3)).optional(),
    itens: z.array(item).optional(),
    citacao: citacao.optional(),
    citacoes: z.array(citacao).optional(),
    /** Chamada para o WhatsApp: texto do botão + chave da mensagem (microtextos.whatsapp). */
    cta: z
      .object({ texto: z.string().min(3), mensagem: z.string().min(3) })
      .strict()
      .optional(),
    origem: origem.optional(),
    pendente: z.string().optional(),
  })
  .strict();

export const pagina = z
  .object({
    slug: z.string().regex(/^(home|404|[a-z0-9]+(-[a-z0-9]+)*)$/),
    meta,
    blocos: z.record(z.string(), bloco),
    pendentes: z.array(z.string()).optional(),
  })
  .strict();

export const microtextos = z
  .object({
    botoes: z.record(z.string(), z.string().min(2)),
    /** Mensagens prontas do WhatsApp (vão na URL, não no HTML visível). */
    whatsapp: z.record(z.string(), z.string().min(20)),
    alt: z.record(z.string(), z.string().min(4)),
    videos: z.record(z.string(), z.string().min(10)),
    rodape: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
    navegacao: z.record(z.string(), z.string()),
    pendentes: z.array(z.string()).optional(),
  })
  .strict();

export type Pagina = z.infer<typeof pagina>;
export type Tratamento = z.infer<typeof tratamento>;
export type Fase = z.infer<typeof fase>;
export type Resultado = z.infer<typeof resultado>;

/** Regras de publicação (produção). Preview mostra tudo, com selo. */
export const publicavel = {
  tratamento: (t: Pick<Tratamento, 'status'>): boolean => t.status === 'confirmado',
  resultado: (r: Pick<Resultado, 'consentimento'>): boolean => r.consentimento === 'autorizado',
};
