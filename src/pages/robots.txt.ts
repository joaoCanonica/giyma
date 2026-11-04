// robots.txt: enquanto o site não indexa (seo.indexar=false ou preview), bloqueia tudo.
// Quando indexar: libera tudo (inclusive os robôs das IAs) e aponta o sitemap.
import type { APIRoute } from 'astro';
import { indexavel, urlAbsoluta } from '../config/index.ts';

export const GET: APIRoute = () => {
  const corpo = indexavel()
    ? `User-agent: *\nAllow: /\n\nSitemap: ${urlAbsoluta('/sitemap.xml')}\n`
    : `# Site em revisão: fora dos buscadores até a publicação.\nUser-agent: *\nDisallow: /\n`;
  return new Response(corpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
