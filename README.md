# Giyma · site

Site da **Giyma Saúde e Estética Avançada** (Lages/SC) · Dra. Ester Santos · farmacêutica esteta · CRF-SC 3984.
Feito pela WAXLO. Contexto, regras e proibições do projeto: [`CLAUDE.md`](CLAUDE.md).

## Requisitos

- Node 24 (LTS, ver `.nvmrc`) e pnpm 10.28 (`corepack enable`).
- ffmpeg/ffprobe (mídia, a partir da sessão 1).
- Chromium do Playwright para as capturas: `pnpm exec playwright install chromium` (ou `CHROMIUM_PATH`).

## Comandos

| Comando                           | O que faz                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm dev`                        | servidor local                                                                               |
| `pnpm build` / `pnpm preview`     | build estático em `dist/` e prévia                                                           |
| `pnpm check`                      | `astro check` + ESLint + Prettier                                                            |
| `pnpm test`                       | Vitest                                                                                       |
| `pnpm capturar`                   | capturas 390/1440 px, claro/escuro, com e sem movimento reduzido, em `docs/capturas/<data>/` |
| `pnpm media:prepare`              | derivados de mídia em `public/media/` (sessão 1)                                             |
| `pnpm validate-config`, `audit-*` | travas e auditorias (sessões 2, 3, 8 e 9; até lá saem com erro “não implementado”)           |

## Pastas

- `src/` — `config`, `components`, `layouts`, `pages`, `styles`, `scripts`, `content`, `lib`
- `scripts/` — scripts de build, auditoria e captura
- `docs/` — investigação, mapa de mídia, prompts, pendências, `dados/` e `capturas/`
- `media-originais/` — originais (recebem `assets/` e `videos/` na sessão 1)
- `public/` — arquivos públicos; `public/media/` é gerado e fica fora do git
