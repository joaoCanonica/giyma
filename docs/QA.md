# QA (sessão 9)

Medido em 04/11/2026 sobre o `dist/` final em dois builds:

- **preview** (padrão): noindex, faixa "em revisão";
- **produção real** (`GIYMA_MODO=producao`): horário confirmado, `seo.indexar=true` e endereço
  padrão `https://giyma-estetica-avancada.vercel.app`.

A produção passa nas travas (`validate-config` aprovado).

Todas as auditorias rodam com o servidor local de `scripts/lib/servidor.mjs`. Ele aplica os
cabeçalhos do `vercel.json` e comprime com gzip, como a Vercel.

## Como repetir

```bash
pnpm build
pnpm test                 # 56 unitários · 34 travas de config · 19 travas de SEO
pnpm audit                # compliance · seo · csp · a11y · lighthouse
node scripts/audit-dispositivos.mjs
node scripts/audit-tipografia.mjs
node scripts/medir-lcp.mjs /
PLAUSIBLE_DOMINIO=giyma-e2e.test pnpm build && pnpm test:e2e
node scripts/capturar-rotas.mjs docs/capturas/<data>/
```

## 1. Desempenho

### Lighthouse mobile

Padrão do Lighthouse 13.6: Moto G Power, 4G lento simulado, CPU 4×. A tabela vem do build
preview. Em preview o SEO é 66–69 por causa do noindex, que é proposital. **Na produção real,
SEO = 100 nas 16 rotas públicas** (`docs/qa/lighthouse-producao.json`), e as outras notas ficaram
iguais, com uma exceção: a home deu **96**, LCP 1,81 s e TBT 157 ms. A variação vem do TBT do
Lighthouse simulado; continua acima da meta.

| Rota | Perf. | A11y | BP | SEO (prod.) | LCP | CLS | TBT | JS gzip | CSS gzip | Peso total |
| --- | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| / | 98 | 100 | 100 | 100 | 1,96 s | 0 | 0 ms | 6,9 KB | 8,8 KB | 171 KB |
| /a-giyma | 100 | 100 | 100 | 100 | 0,91 s | 0 | 0 ms | 2,5 KB | 5,4 KB | 280 KB |
| /cada-fase | 100 | 100 | 100 | 100 | 0,91 s | 0 | 0 ms | 3,4 KB | 5,5 KB | 133 KB |
| /como-chegar | 100 | 100 | 100 | 100 | 0,90 s | 0 | 12 ms | 2,5 KB | 4,9 KB | 121 KB |
| /dra-ester-santos¹ | 100 | 100 | 100 | — | 0,91 s | 0 | 0 ms | 2,1 KB | 5,3 KB | 132 KB |
| /perguntas-frequentes | 100 | 100 | 100 | 100 | 0,90 s | 0 | 0 ms | 2,4 KB | 5,3 KB | 109 KB |
| /privacidade | 100 | 100 | 100 | 100 | 0,75 s | 0 | 0 ms | 2,0 KB | 4,4 KB | 98 KB |
| /resultados | 100 | 100 | 100 | 100 | 0,91 s | 0 | 0 ms | 2,2 KB | 5,3 KB | 99 KB |
| /tratamentos | 100 | 100 | 100 | 100 | 0,91 s | 0 | 0 ms | 2,0 KB | 4,5 KB | 124 KB |
| /tratamentos/* (8 páginas) | 100 | 100 | 100 | 100 | 1,05–1,06 s | 0 | 0 ms | 2,0–2,4 KB | 6,4 KB | 127–134 KB |
| /tratamentos/harmonizacao-corporal¹ | 100 | 100 | 100 | — | 0,91 s | 0 | 0 ms | 2,0 KB | 6,4 KB | 126 KB |

¹ Essas duas páginas não vão para produção enquanto houver dado bloqueante: a pós-graduação, no
caso da página da Ester, e a confirmação do procedimento, no caso da harmonização corporal.

**Metas** (CLAUDE.md §4): Performance e BP ≥ 95, A11y = 100, SEO ≥ 95, JS ≤ 35 KB gzip e
LCP < 2,0 s. **18 de 18 rotas na meta.** O pior caso é a home: LCP 1,96 s no Lighthouse, que é
pessimista, e 1,01 s no navegador com rede limitada (tabela abaixo).

### LCP com e sem a entrada

Medido com `scripts/medir-lcp.mjs`: Chromium a 412×823, latência de 150 ms, 1,6 Mbps, CPU 4×,
mediana de 5 carregamentos frios.

| Home | LCP (mediana) | Execuções | Elemento |
| --- | --: | --- | --- |
| Com a entrada (1ª visita) | **1,01 s** | 1028 · 976 · 1008 · 972 · 1016 ms | retrato (IMG) |
| Sem a entrada (volta na sessão) | **1,00 s** | 968 · 1032 · 1044 · 1000 · 964 ms | retrato (IMG) |

A entrada não piora o LCP: o retrato já está no HTML, com `fetchpriority="high"`, e a camada da
entrada não compete com ele. **Vídeo nunca é o LCP**: todos os vídeos usam `preload="none"` e só
carregam o pôster quando chegam perto da tela.

### Pesos

| O quê | Peso |
| --- | --- |
| JS por página (gzip) | 2,0–3,4 KB nas internas · 6,9 KB na home (entrada + Linha do tempo + aviso de privacidade) |
| CSS por página (gzip) | 4,4–8,8 KB |
| Fontes usadas no site | Bellefair 16,1 KB · Mulish 29,3 KB · Mulish itálico 31,5 KB · EB Garamond itálico 24,8 KB · Josefin Sans 27,9 KB. Pré-carregadas: só Bellefair e Mulish |
| Fontes só no /_estilo (provas internas) | Gilda Display 19,7 KB · Red Hat Text 29,4 KB: nenhuma página pública pede essas fontes |
| Imagens | 58 derivados AVIF/WebP, o maior com 31 KB |
| Vídeos | Só carregam ao tocar (`preload="none"`) ou, nos loops mudos, quando entram na tela. Tour 17,6 s: 2,7 MB (MP4 720p) / 2,3 MB (WebM) · fases 53,6 s: 6,2 / 4,7 MB · toxina 50,7 s: 7,7 / 6,8 MB · inverno 42,8 s: 8,0 / 6,9 MB · loop das letras 3,9 s: 745 / 636 KB |

**Cache:** `/_astro/*` tem hash no nome. `/media/*` passou a sair com `?v=<sha256 do conteúdo>`
(`src/components/base/midia.ts`). Os dois recebem `max-age=31536000, immutable`. Mídia sem `v`
(logo, imagem OG) fica em cache por 1 dia.

## 2. Acessibilidade

`pnpm audit-a11y` (axe-core 4.11 + Playwright) fez **116 checagens com 0 problemas** no preview, e
**103 com 0** na produção, que tem menos rotas. Ele cobre:

- **axe** com as regras WCAG 2.0, 2.1 e 2.2 nos níveis A e AA, mais as regras de boas práticas,
  nas 19 rotas (18 públicas e a 404) e em 3 cenários: 390 claro, 390 escuro e 1440 claro. O axe
  inclui contraste, nomes acessíveis, landmarks e ordem de títulos.
- **Reflow a 320 px e zoom de 200%** (1280 → 640 px): nenhuma rolagem horizontal.
- **Teclado do início ao fim:**
  - entrada: o Tab leva ao "Pular", o Enter encerra a abertura e o foco vai para o CTA do hero;
  - numa página sem a entrada, o 1º Tab é "Pular para o conteúdo", e o Enter leva o foco ao
    `<main>`;
  - Linha do tempo: as setas e o End trocam a fase;
  - links de WhatsApp aparecem no percurso;
  - comparador (no /_estilo, o único lugar com par hoje): as setas movem o controle e o
    `aria-valuetext` acompanha;
  - foco visível (contorno de 2 px) em todas as 69 paradas.
- **Movimento reduzido:** nenhuma animação sem fim e nenhum vídeo tocando.
- **Pausar vídeo:** todo vídeo em loop tem um botão "Pausar o vídeo" com `aria-pressed`, e a pausa
  da pessoa não é desfeita ao rolar.
- **Leitor de tela (estrutura):**
  - um `<h1>` por página;
  - landmarks únicos;
  - a faixa de preview tem rótulo;
  - os vídeos têm descrição;
  - a assinatura profissional é lida inteira (os "·" são `aria-hidden`).

  Não houve teste com VoiceOver ou TalkBack de verdade: ver §3.

**O que a auditoria encontrou e foi corrigido:**

- faltava "Pular para o conteúdo" (WCAG 2.4.1);
- os vídeos em loop não tinham pausa (2.2.2);
- o carrossel do espaço rolava sem foco de teclado;
- os vídeos com controles nativos não mostravam o contorno de foco;
- havia rolagem horizontal a 320 px em 3 páginas, porque "Rejuvenescimento" e "Microagulhamento"
  não cabiam;
- havia landmarks duplicados em /cada-fase.

## 3. Navegadores

| Navegador | Como | Resultado |
| --- | --- | --- |
| Chrome (desktop e Android) | Chromium 1243 (Playwright 1.63): todas as auditorias acima | ✓ |
| Safari iOS | **Emulado** no Chromium (iPhone 13: tela, toque, user agent) | ✓ 18 rotas: sem erro de JS, sem rolagem horizontal, com o CTA do WhatsApp, sem imagem quebrada |
| Android 390 px | Emulado (Pixel 7) | ✓ (mesmo teste) |
| Safari (WebKit) e Firefox (Gecko) reais | **Não testados.** Este ambiente não consegue baixar os navegadores do Playwright: a CDN está bloqueada | **Pendente** |

**Compatibilidade conferida no código:**

- O CSS usa `color-mix()` (Safari 16.2+, Firefox 113+), `text-wrap: balance/pretty` (que só
  melhora onde existe), `svh`, `aspect-ratio`, `clip-path` e `:has()` (só no foco do comparador).
- As View Transitions estão sob `@view-transition`.
- O JS não usa nada além de ES2020.

Para fechar o item, **o João precisa de 10 minutos num iPhone real e num Firefox**. O roteiro está
em `docs/CONFERENCIA_FINAL.md`, §8.

## 4. Acabamento ("cliente exigente")

Antes e depois de todas as rotas (390 claro, 1440 claro, 390 escuro, página inteira), em
`docs/capturas/2026-11-04-qa/antes/` e `…/depois/` (54 + 54 PNG, fora do git).
`scripts/capturar-rotas.mjs` refaz as capturas, rolando a página para carregar as imagens.

| Achado | Correção |
| --- | --- |
| Espaço antes do ponto no manifesto ("quem você é **.**") | Título montado numa string só (`Manifesto.astro`) |
| Separador "·" abrindo linha ("· CRF-SC 3984", "· LAGES") | Pós-build: o espaço antes de "·" vira não separável; a assinatura foi reescrita sem espaço solto entre os `<span>` |
| "farmacêutica / esteta" partido na assinatura | Nome, profissão e registro com `white-space: nowrap` |
| "PRÉ- / JOWLS", "CRF- / SC" partidos no hífen | Pós-build: palavra hifenizada de até 14 caracteres vira inquebrável |
| Palavra de uma letra sozinha no fim da linha ("… e / a sua saúde") | Pós-build: "a", "e", "o", "é" e "à" se ligam à palavra seguinte |
| Viúvas: "Agende sua / **avaliação.**", "Farmacêutico / **pode?**", "o rosto / **paralisado?**" | Espaço não separável nas duas últimas palavras |
| Aspas retas no texto ("Como chegar", "Agendar avaliação"…) | “ ” no texto corrido; ‘ ’ dentro de citação, que já vem entre “ ” (pt-BR) |
| Palavras longas estourando a 320 px | O título do tratamento e o índice escalam pela largura da tela (`min(…, 12,2vw)` e `min(…, 10vw)`), sem hífen |
| Pôster do vídeo de toxina com a legenda "O **botox** também serve" | Pôster no quadro de 7,05 s ("como prevenção.") |
| Imagens borradas nas capturas | Não era defeito do site: a captura não rolava a página e as imagens lazy não carregavam (script corrigido) |

**Ficou como está, de propósito** (`node scripts/audit-tipografia.mjs`):

- "Ética e / **transparência**" (390 px) e "Vamos conversar sobre / **microagulhamento?**" (390 px):
  a última palavra é longa demais para dividir a linha com outra no tamanho do título. A
  alternativa seria hifenizar, e preferi não partir palavra em título.
- O selo "PROVISÓRIO" aparece sozinho em uma linha só no preview.
- Hifenização automática segue desligada no texto corrido (alinhado à esquerda, com
  `text-wrap: pretty`): o Chrome no Linux e no Android não hifeniza português de forma
  consistente.

## 5. Segurança e deploy

- **CSP por hash, por página:** `scripts/pos-build.mjs` grava um `<meta http-equiv>` com o sha256
  de cada script inline, de cada `<style>` e de cada atributo `style` (com `'unsafe-hashes'`).
  Não há `'unsafe-inline'` nem `'unsafe-eval'`.
  - `frame-src` aceita só o Google (mapa, depois do consentimento).
  - `script-src` e `connect-src` só incluem o Plausible quando ele está configurado.
  - `frame-ancestors 'none'` vai no cabeçalho.
- `pnpm audit-csp` abre as 19 rotas, interage (abas, assistente, aviso, mapa e a entrada) e
  encontrou **0 violações**. Um teste de controle confirmou que script e estilo injetados são
  bloqueados.
- **Cabeçalhos** (`vercel.json`): HSTS de 2 anos com preload, `Referrer-Policy:
  strict-origin-when-cross-origin`, Permissions-Policy (câmera, microfone, localização, pagamento
  e afins desligados), `X-Content-Type-Options`, `X-Frame-Options: DENY`, COOP e
  `X-Robots-Tag: noindex` em todo `*.vercel.app`.
- **E2E do funil** com o CSP ligado e a medição configurada: **10 de 10**.
