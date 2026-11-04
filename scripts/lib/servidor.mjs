// Servidor estático mínimo do dist/ para auditorias e e2e (build.format "file": /x → x.html).
// Aplica os mesmos cabeçalhos do vercel.json, para a auditoria ver o que o deploy entrega.
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, relative, resolve } from 'node:path';
import { createGzip } from 'node:zlib';

export const DIST = resolve('dist');
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.vtt': 'text/vtt',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function cabecalhosDoVercel() {
  const arq = resolve('vercel.json');
  if (!existsSync(arq)) return [];
  // Regras condicionadas ao host (noindex do *.vercel.app) não valem no servidor local.
  return (JSON.parse(readFileSync(arq, 'utf8')).headers ?? [])
    .filter((h) => !(h.has ?? []).some((c) => c.type === 'host'))
    .map((h) => ({
      re: new RegExp(`^${h.source.replace(/\(\.\*\)/g, '.*').replace(/:path\*/g, '.*')}$`),
      headers: h.headers,
    }));
}

/** Sobe o servidor numa porta livre; devolve { origem, fechar }. */
export async function servir() {
  if (!existsSync(join(DIST, 'index.html'))) throw new Error('dist/ não existe: rode pnpm build.');
  const regras = cabecalhosDoVercel();
  const servidor = createServer((req, res) => {
    const caminho = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
    const candidatos = [
      join(DIST, caminho),
      join(DIST, `${caminho}.html`),
      join(DIST, caminho, 'index.html'),
    ];
    const arq = candidatos.find((c) => c.startsWith(DIST) && existsSync(c) && statSync(c).isFile());
    const extras = {};
    for (const r of regras)
      if (r.re.test(caminho)) for (const h of r.headers) extras[h.key] = h.value;
    if (!arq) {
      res.writeHead(404, { 'content-type': TIPOS['.html'], ...extras });
      return createReadStream(join(DIST, '404.html')).pipe(res);
    }
    const tipo = TIPOS[extname(arq)] ?? 'application/octet-stream';
    // Como a Vercel: texto vai comprimido (gzip aqui; lá, brotli ou gzip).
    const comprimir =
      /text|javascript|json|xml|svg/.test(tipo) &&
      /gzip/.test(req.headers['accept-encoding'] ?? '');
    res.writeHead(200, {
      'content-type': tipo,
      ...(comprimir ? { 'content-encoding': 'gzip', vary: 'Accept-Encoding' } : {}),
      ...extras,
    });
    const fluxo = createReadStream(arq);
    if (comprimir) fluxo.pipe(createGzip()).pipe(res);
    else fluxo.pipe(res);
  });
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  return {
    origem: `http://127.0.0.1:${servidor.address().port}`,
    fechar: () => new Promise((r) => servidor.close(r)),
  };
}

/** Rotas do dist (sem .html). `todas`: inclui internas (/_*) e 404. */
export function rotas({ todas = false } = {}) {
  const lista = [];
  const andar = (d) => {
    for (const n of readdirSync(d)) {
      const c = join(d, n);
      if (statSync(c).isDirectory()) andar(c);
      else if (n.endsWith('.html'))
        lista.push(`/${relative(DIST, c)}`.replace(/\.html$/, '').replace(/^\/index$/, '/'));
    }
  };
  andar(DIST);
  const redireciona = (r) =>
    /http-equiv="refresh"/.test(
      readFileSync(join(DIST, `${r === '/' ? 'index' : r}.html`), 'utf8'),
    );
  return lista.filter((r) => todas || (!/^\/(_|404$)/.test(r) && !redireciona(r))).sort();
}
