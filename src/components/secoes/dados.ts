// Dados da home: textos da coleção "paginas" (sessão 5) + destinos das chamadas.
import { getCollection, getEntry } from 'astro:content';
import { avaliacoes } from '../../config/index.ts';
import { linkWhatsApp } from '../../lib/whatsapp.ts';

export async function home() {
  const p = await getEntry('paginas', 'home');
  if (!p) throw new Error('src/content/paginas/home.json não encontrado');
  return p.data.blocos;
}

export async function microtextos() {
  const [m] = await getCollection('microtextos');
  if (!m) throw new Error('src/content/microtextos/microtextos.json não encontrado');
  return m.data;
}

/** "geral" | "fase:40" | "tratamento:slug" → WhatsApp; "link:/x" → /x; "link:google-ficha" → ficha. */
export async function destino(chave: string): Promise<string> {
  if (chave === 'link:google-ficha') return avaliacoes.urlFicha;
  if (chave.startsWith('link:')) return chave.slice(5);
  const m = await microtextos();
  const texto = m.whatsapp[chave];
  if (!texto) throw new Error(`mensagem de WhatsApp "${chave}" não existe em microtextos`);
  return linkWhatsApp(texto);
}

export type Bloco = Awaited<ReturnType<typeof home>>[string];

/**
 * A fonte interna ("post de 05/06/2026 (aniversário…)", "frases reais enviadas pelo João…")
 * vira um crédito legível. Frases enviadas pelo João: só o nome da Ester.
 */
export function fontePublica(fonte: string): string {
  if (/João|CLAUDE\.md/.test(fonte)) return '';
  const data = /(\d{2}\/\d{2}\/\d{4})/.exec(fonte)?.[1];
  if (/^vídeo/i.test(fonte)) return data ? `Vídeo no Instagram · ${data}` : 'Vídeo no Instagram';
  if (/destaque/i.test(fonte)) return 'Instagram · destaque “Comece aqui”';
  return data ? `Instagram · ${data}` : 'Instagram';
}
