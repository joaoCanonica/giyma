# Deploy (Vercel, estático)

O site é estático (Astro, `dist/`). Os cabeçalhos ficam no `vercel.json`, e o CSP vai, por
página, no próprio HTML (`scripts/pos-build.mjs`).

## Por que build pré-compilado

O `prebuild` gera as mídias a partir de `media-originais/` (`pnpm media:prepare`) e precisa de
**ffmpeg e ffprobe**. A imagem de build da Vercel não tem esses programas. Por isso o build roda
num lugar com ffmpeg: o workflow `docs/deploy/github-actions-deploy.yml` (Ubuntu + apt; **copiar para `.github/workflows/deploy.yml` para ativar**; fica fora da pasta de workflows até os segredos estarem configurados) ou o computador de
quem publica. Depois sobe pronto com `vercel deploy --prebuilt`. Se o build rodar sem ffmpeg, ele
falha com uma mensagem clara.

## Uma vez só (João)

1. Criar o projeto na Vercel, apontando para este repositório.
   - Framework: Astro (o `vercel.json` já define build, saída e cabeçalhos).
   - Em *Git*, desligar o build automático, porque o deploy vem pelo workflow.
2. **Variáveis de ambiente** do projeto:

   | Variável | Production | Preview |
   | --- | --- | --- |
   | `SITE_URL` | `https://<domínio final>` (sem barra no fim) | a URL de preview, ou deixar vazio |
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
  `pnpm validate-config` com as variáveis de produção, e ele **reprova de propósito** enquanto
  houver trava (hoje: o horário). Depois do build vêm os testes, `audit-compliance`, `audit-seo` e
  `audit-csp`. Qualquer falha impede o deploy. Ver `docs/CONFERENCIA_FINAL.md`.
- **Indexar:** em `src/config/seo.ts`, trocar `indexar: false` para `true`, num commit próprio,
  quando o João liberar. Com isso o `robots.txt` passa a `Allow: /` com o sitemap, e as páginas
  saem com `index, follow`.

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
