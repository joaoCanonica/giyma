// sitemap.xml: as páginas públicas, com URL canônica (a mesma do <link rel="canonical">).
import type { APIRoute } from 'astro';
import { paginasPublicas } from '../components/seo/paginas.ts';
import { urlAbsoluta } from '../config/index.ts';

export const GET: APIRoute = async () => {
  const urls = (await paginasPublicas())
    .map((p) => `  <url><loc>${urlAbsoluta(p.caminho)}</loc></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
