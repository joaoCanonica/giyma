# Deploy (Vercel, estático)

## Caminho simples (recomendado)

1. Na Vercel: **Add New → Project → importar `joaoCanonica/giyma`**. Não precisa mudar nada: o
   `vercel.json` já define a instalação (`pnpm@10.28.0`), o build e a pasta `dist`.
2. **Não precisa de variável de ambiente.**
   - O deploy de produção vira produção sozinho (`VERCEL_ENV=production`): indexável, sem a faixa
     "em revisão".
   - Os previews ficam com noindex.
   - A URL vem do próprio projeto (`VERCEL_PROJECT_PRODUCTION_URL`).
   - Opcionais: `SITE_URL` quando houver domínio; `PLAUSIBLE_DOMINIO` se a medição for aprovada.
3. A Vercel publica a branch **`main`**: o que estiver em `main` vai ao ar a cada push.

**Por que funciona sem ffmpeg:** os derivados de mídia estão versionados em `public/media/`. O
`media:prepare` detecta que não há ffmpeg e usa os arquivos prontos. Ao trocar uma foto ou um
vídeo, rode `pnpm media:prepare` numa máquina com ffmpeg e commite `public/media/`.

O roteiro abaixo (build pré-compilado pelo GitHub Actions) segue valendo, mas não é mais
necessário.

O site é estático (Astro, `dist/`). Os cabeçalhos ficam no `vercel.json`, e o CSP vai, por
página, no próprio HTML (`scripts/pos-build.mjs`).

## Por que build pré-compilado

O `prebuild` gera as mídias a partir de `media-originais/` (`pnpm media:prepare`) e precisa de
**ffmpeg e ffprobe**. A imagem de build da Vercel não tem esses programas. Por isso o build roda
num lugar com ffmpeg: o workflow `docs/deploy/github-actions-deploy.yml` (Ubuntu + apt; **copiar para `.github/workflows/deploy.yml` para ativar**; fica fora da pasta de workflows até os segredos estarem configurados) ou o computador de
quem publica. Depois sobe pronto com `vercel deploy --prebuilt`. Se o build rodar sem ffmpeg, ele
falha com uma mensagem clara.

## Uma vez só (João)

1. Criar o projeto na Vercel com o nome **`giyma-estetica-avancada`** (vira o endereço `giyma-estetica-avancada.vercel.app`), apontando para este repositório.
   - Framework: Astro (o `vercel.json` já define build, saída e cabeçalhos).
   - Em *Git*, desligar o build automático, porque o deploy vem pelo workflow.
2. **Variáveis de ambiente** do projeto:

   | Variável | Production | Preview |
   | --- | --- | --- |
   | `SITE_URL` | não precisa por enquanto: o padrão é `https://giyma-estetica-avancada.vercel.app`. Quando o domínio for comprado: `https://<domínio>` (sem barra no fim) | não definir |
   | `GIYMA_MODO` | `producao` | (não definir: o build fica em preview, com noindex, faixa "em revisão" e selos) |
   | `PLAUSIBLE_DOMINIO` | o domínio na Plausible, se a medição for aprovada | (não definir) |
   | `PLAUSIBLE_SCRIPT` | opcional: URL do script (Plausible ou Umami) | — |

3. No GitHub, em *Settings → Secrets → Actions*, cadastrar `VERCEL_TOKEN`, `VERCEL_ORG_ID` e
   `VERCEL_PROJECT_ID` (o `vercel link` mostra os IDs).
4. Domínio: apontar o DNS para a Vercel. HSTS com `preload`: só pedir a inclusão em
   hstspreload.org depois que o domínio e os subdomínios estiverem todos em HTTPS.

## Publicar

- **Preview:** Actions → `deploy` → Run workflow → `preview`. Sai com `noindex` no HTML, no
  `robots.txt` (`Disallow: /`) e no cabeçalho `X-Robots-Tag` de todo `*.vercel.app`.
- **Produção:** Actions → `deploy` → `production`. Antes do build, o workflow roda
  `pnpm validate-config` com as variáveis de produção, e ele **reprova de propósito** se surgir
  alguma trava (hoje está aprovado: o horário foi confirmado). Depois do build vêm os testes, `audit-compliance`, `audit-seo` e
  `audit-csp`. Qualquer falha impede o deploy. Ver `docs/CONFERENCIA_FINAL.md`.
- **Indexação:** `seo.indexar` já está `true`: em produção, o `robots.txt` sai com `Allow: /` e o
  sitemap, e as páginas com `index, follow`. Preview nunca indexa.
- **Quando o domínio for comprado:**
  1. adicionar o domínio no projeto e marcá-lo como principal (a Vercel redireciona o
     `.vercel.app` com 301);
  2. trocar `SITE_URL` em Production;
  3. publicar de novo;
  4. no Google Search Console, cadastrar o domínio novo e enviar o sitemap.

## Conferir depois do deploy

```bash
curl -sI https://<domínio>/ | grep -iE "strict-transport|referrer|permissions|x-frame|content-security"
```

```bash
curl -sI "https://<domínio>/media/img/retrato-3x4-800.webp?v=x" | grep -i cache-control
```

```bash
curl -s https://<domínio>/robots.txt
```

Depois: Rich Results Test e validator.schema.org na home, numa página de tratamento e na FAQ.
Guardar as capturas em `docs/capturas/<data>-seo/`.
