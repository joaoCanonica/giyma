# Giyma · Dra. Ester Santos: pacote de prompts para o Claude Code (Opus)

Versão 1 · 03/11/2026 · WAXLO

Base: `GIYMA_INVESTIGACAO_CLIENTE.md` (investigação e regras), `GIYMA_MAPA_MIDIA.md` (cada arquivo avaliado e textos transcritos), `GIYMA_AVALIACOES_GOOGLE.json` (avaliação e concorrência), logos em `assets/` (`giyma-logo-vertical.svg`, `giyma-logo-horizontal.svg`, `giyma-logo-mark.svg`). Repositório: `github.com/joaoCanonica/giyma`.

---

## Como usar (ordem exata)

1. **Antes da sessão 0**, coloque na raiz do repositório: `GIYMA_INVESTIGACAO_CLIENTE.md`, `GIYMA_MAPA_MIDIA.md`, `GIYMA_PACOTE_PROMPTS_CODE.md`, `GIYMA_AVALIACOES_GOOGLE.json`. Em `assets/`: os três SVG do logo (o PNG de comparação é só para você; pode ficar fora do repositório).
2. Abra o Claude Code (Opus) **na pasta do repositório**.
3. **Sessão 0:** cole o bloco da seção B e, logo abaixo, o Prompt 0. **Sem anexos.**
4. **Sessões 1 a 9:** uma sessão nova para cada uma, colando **só o prompt**. Não junte prompts. Cada sessão termina em commit.
5. Mídia nova (ensaio, antes e depois autorizados, vídeos sem legenda) → suba no repositório e rode o **Prompt L**. Dado novo (horário, pós-graduação, procedimentos corporais, CNPJ, domínio) → **Prompt D**.
6. Depois das sessões **1, 3, 4, 6A, 6C e 9**, me traga o relatório e as capturas (390 e 1440 px, claro e escuro). Eu audito antes de você seguir.
7. Ordem: 0 Fundação · 1 Mídia · 2 Config · 3 Design system · 4 Entrada e hero · 5 Textos · 6A Home · 6B Tratamentos · 6C Ester, Giyma, Fases, Resultados, FAQ, Como chegar · 7 Funil e LGPD · 8 SEO e GEO · 9 QA, conferência e deploy.

---

## A. Dados fixos (a sessão 2 transforma em config)

| Campo | Valor | Estado |
|---|---|---|
| Marca | **Giyma Saúde e Estética Avançada** (logo: "GIYMA · SAÚDE E ESTÉTICA AVANÇADA") | CONFIRMADO pelo logo. O nome da ficha no Google é "Giyma \| Saúde e Estética Avançada" |
| Profissional | **Dra. Ester Santos · farmacêutica esteta · CRF-SC 3984** (sempre juntos) | CONFIRMADO (bio) |
| Formação | Farmácia, Universidade Federal de Santa Catarina, 1999 | CONFIRMADO (posts e destaque) |
| Trajetória | farmacêutica, professora universitária, vigilância sanitária, análises laboratoriais; na estética desde que o CFF abriu a área (2015) | CONFIRMADO (texto dela) |
| Pós-graduação em estética | — | **PENDENTE** (aparece só quando chegar) |
| Endereço | Rua Rui Barbosa, 277, Centro, Lages/SC, CEP 88501-170 | CONFIRMADO |
| Coordenadas | -27.819478, -50.3300233 · plus code 5MJ9+6X | VISTO (Google) |
| WhatsApp (funil único) | (49) 99827-3904 · wa.me/5549998273904 | CONFIRMADO |
| Instagram | @dra_estersantos | CONFIRMADO |
| Horário | — | **PENDENTE (bloqueia produção)** |
| Inauguração | 15/09/2023 | CONFIRMADO (post) |
| Google | 5,0 · 1 avaliação (Nathalia F.) · conferido 02/11/2026 | VISTO. **Não exibir nota** até haver volume |
| Procedimentos (com prova) | toxina botulínica; preenchimento com ácido hialurônico (lábios, mento, mandíbula, malar, zigomático, bigode chinês, olheiras, marionete, pré-jowls); bioestimulador de colágeno (rosto e mãos); microagulhamento; peeling | VISTO nos posts. Corporais: **PENDENTE** |
| Valores (dela) | Segurança e cuidado · Naturalidade com propósito · Ética e transparência · Acolhimento humanizado | CONFIRMADO (post de 21/10/2026) |
| Nome "Giyma" | hipótese: Gi + Ma (filhas Gi e Mari) | **PENDENTE**: só entra se a Ester confirmar |
| CNPJ / responsável técnico / domínio | — | PENDENTE |

**Decisões do João (02 e 03/11/2026):** os clientes são muito exigentes e não toleram erro nem coisa simples; o site precisa estar entre os melhores que já fizemos. Tudo o que está no repositório e o texto enviado por ele estão autorizados.

---

## B. BLOCO "CONTEXTO DO PROJETO" (colar só na sessão 0)

````text
CONTEXTO DO PROJETO — Giyma Saúde e Estética Avançada · Dra. Ester Santos (site premium)
Idioma de tudo (código, comentários curtos, textos, relatórios): português do Brasil.

1. QUEM E O QUÊ
- Cliente: Giyma Saúde e Estética Avançada, Rua Rui Barbosa, 277, Centro, Lages/SC. Profissional: Dra. Ester Santos, farmacêutica esteta (CRF-SC 3984), formada pela UFSC em 1999. Antes da estética foi professora universitária e trabalhou na vigilância sanitária e em análises laboratoriais. Inaugurou a Giyma em 15/09/2023.
- A história dela é o centro do site: "Hoje eu celebro 50 anos de vida, mas o meu 'renascimento' aconteceu aos 38… decidi que não teria medo das marcas do tempo… O que começou como uma jornada como paciente tornou-se a minha missão de vida." Ela viveu o que oferece.
- Público: mulheres de 35 a 65+, de Lages e região, exigentes, com medo de "ficar artificial".
- Tese: beleza natural em cada fase da vida, com ciência (25+ anos de farmácia) e acolhimento. Valores (dela): Segurança e cuidado · Naturalidade com propósito · Ética e transparência · Acolhimento humanizado.
- Voz (frases reais): "Cada pessoa é única." · "Estética não é futilidade. É autocuidado, é autoestima." · "Não é sobre mudar quem você é. É sobre alinhar o seu exterior com a força que existe no seu interior." · "A SEGURANÇA é inegociável." · "Sua pele conta a sua história." · "O segredo não está em uma fórmula mágica, e sim no respeito à individualidade do seu rosto." · "Para que sua melhor versão floresça de dentro para fora."
- OBJETIVO (nesta ordem): (1) a visitante confia na Ester e agenda a avaliação no WhatsApp; (2) Google e IAs passam a indicar a Giyma (hoje ela é invisível: 1 avaliação, ficha incompleta, ausente no Modo IA); (3) mostrar o espaço (é bonito e real).
- Meta do João (CEO da WAXLO): cliente muito exigente; zero erro, zero "coisa simples", zero "cara de IA". O site precisa parecer feito à mão por um estúdio caro.
- Regra do projeto: o site primeiro. A conferência de normas (CFF, Anvisa, CDC, LGPD, direito de imagem) é UMA passada no final (sessão 9), mas as proibições da seção 8 valem desde já. O que o João mandou está autorizado. Não corte conteúdo por falta de papel: sinalize em docs/PENDENCIAS.md.
- Dado do cliente (horário, preço, pós, anos, nomes, números, procedimentos) NUNCA é inventado. Faltou: campo pendente.

2. FONTES DE VERDADE NO REPOSITÓRIO
- GIYMA_INVESTIGACAO_CLIENTE.md (história, procedimentos com prova, regras, SEO/GEO), GIYMA_MAPA_MIDIA.md (cada arquivo, trechos de vídeo com tempo, textos transcritos das artes), GIYMA_AVALIACOES_GOOGLE.json, assets/giyma-logo-*.svg.

3. FUNIL
- Ação principal única: "Agendar avaliação" no WhatsApp 5549998273904, com mensagem pronta por contexto (procedimento, fase da vida, dúvida). Sem formulário com backend.
- Texto honesto: "Você conversa com a equipe e agenda sua avaliação." Nunca "garantido", nunca preço, nunca promoção.
- Secundários: Instagram (@dra_estersantos) e Como chegar.

4. STACK
- Astro (estável atual; conferir e fixar), TypeScript strict, estático, ilhas mínimas, pnpm, Node LTS, engines e packageManager fixados.
- Movimento: CSS + IntersectionObserver + Web Animations API; scroll-driven e View Transitions só como melhoria progressiva sob @supports. Sem GSAP, Lenis, Motion, Swiper, jQuery. Nunca sequestrar o scroll.
- Orçamento (medir): JS ≤ 35 KB gzip por página; LCP < 2,0 s em 4G mobile; CLS ≈ 0; INP < 200 ms; Lighthouse mobile ≥ 95 (Performance/BP/SEO) e 100 (Acessibilidade). Vídeo nunca é o LCP.
- Fontes self-hosted (subset latino).

5. IDENTIDADE
- Marca: assets/giyma-logo-vertical.svg, giyma-logo-horizontal.svg e giyma-logo-mark.svg (cor única, currentColor). O monograma é um arco sobre um quadrado aberto com duas folhas nascendo de uma haste: uma planta brotando num lugar seguro.
- Assinatura: "O FLORESCER". As duas folhas do monograma se abrem a partir da haste central. Usos:
  (a) ENTRADA: o monograma se desenha e as folhas se abrem; a abertura das folhas revela o hero (Prompt 4);
  (b) REVELAÇÃO de imagens: duas curvas que se afastam do centro (clip-path com elipses), uma vez, ao entrar na tela;
  (c) DIVISORES: a haste (linha vertical fina) com duas folhas mínimas que se abrem ao entrar na tela;
  (d) FOCO/HOVER: um leve brilho dourado na borda, nunca degradê.
  É evento, não progresso do scroll. O ARCO do logo fica no logo: NÃO vira moldura de foto, botão, máscara de imagem nem forma da interface (arco como assinatura é proibido; já usamos).
- Navegação temática: "A LINHA DO TEMPO DA PELE": seletor de fases (20 · 30 · 40 · 50 · 60+). Cada fase mostra o que muda na pele, o que costuma fazer sentido e um convite para avaliação. É um seletor (abas acessíveis), NÃO uma linha que se desenha ao rolar (proibido; já usamos).
- PROIBIDO repetir (usado em outros sites nossos): vinho + coluna de pontos, linha da vida, curva dourada, oval verde, arco como assinatura, navy + areia, "A Contraforma", "A Fresta", "O Degradê"; fontes Cormorant, Bodoni Moda (e família Bodoni), Marcellus, Instrument Serif, Hanken Grotesk, Fraunces, Lato, Figtree, Jost, Gloock, Urbanist, Spectral, Newsreader, Albert Sans, Libre Caslon, Schibsted Grotesk.
- Paleta (tokens claro e escuro; calibrar com as fotos e o vídeo do tour; validar AA por script):
  Cacau ≈ #231A16 (escuro principal, o marrom das artes e do ensaio);
  Petróleo ≈ #1E3348 (a parede da recepção; superfície escura secundária);
  Pérola ≈ #F3F1EE (claro principal, FRIO, nunca areia);
  Névoa ≈ #D9DCE0 (superfície clara secundária, o cinza das artes);
  Ouro velho ≈ #B8975F (o dourado do logo; CHAPADO: monograma, fios, números; nunca bloco, nunca degradê metálico);
  Terracota ≈ #A0522D (raríssimo: o tom da roupa do ensaio, só em detalhe editorial).
- Tipografia (testar e decidir na sessão 3; licença OFL; self-host): títulos em Bellefair ou Gilda Display; acentos em itálico em EB Garamond Italic (o Instagram dela usa serifa itálica); texto e interface em Mulish ou Red Hat Text; rótulos em versaletes espaçados com Josefin Sans (a mesma família do logo). Números em tabular.
- Fotografia real acima de tudo: a Ester, o espaço, as mãos trabalhando. Antes e depois só autorizados, técnicos, sem moldura do Instagram.

6. ANTI "CARA DE IA"
Proibido: grade de cartões brancos arredondados; ícone em círculo; pílulas por toda parte; ícones de seringa, lábio, gota ou folha de biblioteca; hero centralizado com degradê; brilhos e partículas; "spa" genérico (pedras, orquídea de banco); foto de banco ou gerada por IA; seções todas iguais; contador de "pacientes atendidas" inventado.
Usar: retrato grande da Ester; recortes editoriais; texto grande e calmo; muito respiro; alternância cacau / pérola / petróleo; a Linha do tempo como peça central; números reais (1999, 2015, 2023, CRF-SC 3984) como elementos gráficos.

7. MÍDIA
- Originais em media-originais/ (git mv de assets/ e videos/). Derivados no build em public/media/ (fora do git): AVIF/WebP com srcset, LQIP, pôster por vídeo, MP4 H.264 + WebM, loops mudos.
- Manifesto media.manifest.json: id, arquivo, tipo, post de origem, texto transcrito, uso, trechos (in/out em s), consentimento (pendente | autorizado | nao-precisa), audioLiberado, problemas, edicoes, naoUsar.
- Edição permitida: cor/exposição/balanço de branco GLOBAIS, recorte, corte de trechos. Proibido: IA generativa, apagar texto queimado por IA, retoque de pele, super-resolução em rosto. ANTES E DEPOIS: zero edição além de recorte idêntico nos dois lados.
- Vídeos tocam mudos; som só em audioLiberado.

8. REGRAS DE PUBLICIDADE (farmacêutica esteta: CFF Res. 658/2018 e 724/2022; Anvisa; CDC)
- Sempre "Dra. Ester Santos · farmacêutica esteta · CRF-SC 3984" juntos (nunca "Dra." sozinho sugerindo médica).
- NÃO prometer resultado ("resultado imediato", "rejuvenesce X anos", "garantido", "sem riscos").
- NÃO divulgar preço, promoção, combo, bônus, vale, sorteio, "avaliação gratuita".
- NÃO usar marca comercial de medicamento como chamada (Botox, Dysport, Sculptra etc.): escrever "toxina botulínica", "bioestimulador de colágeno". Na FAQ pode dizer que "botox" é o nome popular.
- Antes e depois: só com consentimento=autorizado no manifesto, legenda com procedimento + tempo decorrido, mesma luz e ângulo, olhos tarjados se a paciente pedir.
- Depoimentos: só autorizados; o da Google com primeiro nome + inicial e link.
- Termos vetados (src/config/termos.ts): "o melhor", "a melhor", "número 1", "nº 1", "garantido", "garantia de resultado", "resultado imediato", "sem riscos", "sem dor", "avaliação gratuita", "grátis", "promoção", "desconto", "Botox", "Dysport", "Sculptra", "rejuvenesça", "transformação garantida". O Code NUNCA afrouxa listas nem travas sem ordem expressa.

9. CONFIG E TRAVAS
- Fonte única em src/config/ tipada com confirmado(), opcional(), bloqueante(), aviso(). Preview sempre funciona (faixa "em revisão", selo PROVISÓRIO, noindex).
- Produção trava só em: horário ausente; WhatsApp ausente; termo vetado no HTML; antes e depois sem consentimento=autorizado; mídia naoUsar referenciada; CRF ausente ao lado do nome.

10. CONDUTA DO CODE
- Um prompt = uma sessão = um commit, mensagem curta em português.
- Plano curto antes de tarefa grande. Capturas e métricas no lugar de "ficou ótimo". Se não conseguir, diga.
- Capturas em 390 e 1440 px, claro e escuro, e com prefers-reduced-motion.
- Relatório no fim: o que mudou · o que falhou · o que depende do João · números medidos.
````

---

## PROMPT 0 — Fundação

````text
[COLE AQUI O BLOCO "CONTEXTO DO PROJETO" INTEIRO, ANTES DESTE TEXTO]

Tarefa: criar a fundação do projeto Astro no repositório giyma e gravar o contexto como CLAUDE.md.
Escopo: estrutura e configuração. NÃO escreva páginas, textos ou componentes visuais. NÃO apague mídia.
Leia primeiro: git ls-files; GIYMA_MAPA_MIDIA.md (resumo e identidade).

Passos:
1. Salve o bloco de contexto, sem alterar, como CLAUDE.md na raiz e como docs/CONTEXTO.md.
2. Crie docs/ e mova para lá (git mv): GIYMA_INVESTIGACAO_CLIENTE.md, GIYMA_MAPA_MIDIA.md, GIYMA_PACOTE_PROMPTS_CODE.md; GIYMA_AVALIACOES_GOOGLE.json → docs/dados/avaliacoes-google.json. Se faltar algum, anote em docs/PENDENCIAS.md e siga.
3. Verifique: node, pnpm, git, ffmpeg, ffprobe, sharp (via pnpm), Chromium do Playwright. Instale o seguro via pnpm. Nada global sem me dizer.
4. Astro (estável atual, TS strict, estático, sem framework de UI) na raiz, preservando assets/ e videos/. package.json: name "giyma-site", engines, packageManager, scripts: dev, build, preview, check, test, validate-config, audit-compliance, audit-a11y, audit-lighthouse, audit-seo, audit-contraste, media:prepare, capturar.
5. Estrutura: src/{config,components,layouts,pages,styles,scripts,content,lib}, scripts/, docs/{capturas,dados}, media-originais/, public/. .gitignore: node_modules, dist, .astro, public/media, docs/capturas/**/*.png, .env*.
6. tsconfig strict, ESLint + Prettier mínimos, .editorconfig, .nvmrc, Vitest.
7. scripts/capturar.mjs: sobe o preview e captura rotas em 390 e 1440 px, claro e escuro (data-theme no <html>) e com prefers-reduced-motion, em docs/capturas/<data>/.
8. Página temporária "/" com <h1>Giyma</h1> e noindex. README.md curto.

Critério de aceite: pnpm install, build, check e test verdes; pnpm capturar funciona; CLAUDE.md idêntico ao bloco; commit "fundação".
````

---

## PROMPT 1 — Mídia: catálogo, recortes, trechos, derivados

````text
Leia CLAUDE.md e docs/GIYMA_MAPA_MIDIA.md. Esta sessão só trata mídia. NADA vai para páginas.

Tarefa: mover originais, gerar manifesto, recortar o aproveitável, cortar trechos e loops, gerar derivados.
Escopo: media-originais/, media.manifest.json (+ JSON Schema), scripts/prepare-media.mjs, scripts/extract-stills.mjs, docs/MIDIA_CATALOGO.md. Originais intactos (só git mv).

Passos:
1. git mv: assets/*.jpg|png → media-originais/fotos/; videos/*.mp4 e assets/*.mp4 → media-originais/videos/; assets/giyma-logo-*.svg → media-originais/marca/.
2. Manifesto: um registro por arquivo, com grupo, post de origem, texto transcrito (do mapa) e uso. Marque:
   - naoUsar: o print do logo (Captura de tela…png); snapinsta-1793717183596.mp4 (360p, tela de celular); a colagem de feedback 526288937 (print de WhatsApp: só vira citação se autorizada).
   - consentimento: "pendente" para TODO antes e depois (00, 03, 05, 06, 18–22). Nenhum aparece em produção até virar "autorizado" (Prompt D).
   - SaveClip…627373272… = retrato da Ester (hero provisório). Crédito do fotógrafo: pendente.
3. RECORTES (derivados, nunca originais):
   - Retrato 627373272: recorte que remova a assinatura "ESTER SANTOS · Farmacêutica Esteta", em 4:5 e 3:4, e uma versão 16:9 para desktop (se o recorte não couber, relate; não preencha com IA).
   - Antes e depois (00, 03, 05, 06, 18, 19, 20, 21, 22): extraia o QUADRO INTERNO de cada lado (sem moldura, sem texto, sem logo), o mesmo recorte e a mesma escala nos dois lados, em pares lado a lado. Registre as coordenadas. Gere folhas de contato em docs/capturas/pares/.
4. VÍDEOS — trechos (confira quadro a quadro e ajuste ±0,5 s):
   - loop-letras: 1793711483206, 7,0–10,5 s (letras douradas na parede petróleo). Mudo, ≤ 1 MB, 720×1280 e 540×960; versão recortada 16:9 para o desktop se a área permitir.
   - tour-completo: 1793717791575 inteiro (seção "A Giyma").
   - tour-capitulos: do mesmo vídeo, capítulos com tempo: Fachada 0–3 · Entrada 4–5 · Copa 6–8 · Porta "Dra. Ester Santos" 9–12 · Consultório 13–15 · Planejamento (modelo anatômico) 16–20 · Procedimento 21–24 · Recepção 27–32.
   - fases: 1793717753324 inteiro (Linha do tempo da pele).
   - faq-toxina: 1793717271460 inteiro.
   - inverno: 1793717726093 inteiro.
   - amo-giyma: 1793711809036 (360p) só como reserva, uso pequeno.
   Para cada um: pôster AVIF do quadro mais nítido, MP4 H.264 + WebM, faststart.
5. STILLS limpos dos vídeos (scripts/extract-stills.mjs), sem upscale: fachada (0,5 s), entrada com logo (4 s), xícaras GIYMA (7 s), placa da porta (11 s), poltrona/consultório (13–14 s), modelo anatômico com a marcação (19 s), Ester com produto (25 s), letras douradas (27–28 s), Ester na recepção (30 s); e do 1793711483206 o close das letras (9,8 s). Natureza "quadro de vídeo"; tamanho máximo de exibição registrado.
6. scripts/prepare-media.mjs (predev/prebuild, idempotente, cache por hash): AVIF/WebP 480/800/1200/1600 (nunca acima do original), LQIP, vídeos acima.
7. docs/MIDIA_CATALOGO.md: tabela (arquivo, uso, recorte/trecho, pesos, consentimento, problemas) e a lista do que pedir ao João (ensaio original, antes e depois autorizados, tour sem legenda).

Critério de aceite: media:prepare roda do zero e é idempotente; manifesto válido no schema; nenhum antes e depois publicável sem consentimento; loop-letras ≤ 1 MB; build verde; commit "midia".
````

---

## PROMPT 2 — Config, conteúdo estruturado e travas

````text
Leia CLAUDE.md, docs/MIDIA_CATALOGO.md e docs/dados/avaliacoes-google.json.

Tarefa: config tipada, coleções de conteúdo, motor de horário, WhatsApp e travas.
Escopo: src/config/**, src/content/** (schemas), src/lib/{horario,whatsapp}.ts, scripts/{validate-config,audit-compliance,test-config}.mjs, docs/PENDENCIAS.md, componentes PreviewBanner e Provisorio (estilo mínimo). Sem copy final.

Passos:
1. tipos.ts: confirmado(v, fonte), opcional(v), bloqueante(rotulo), aviso(rotulo, motivo).
2. marca.ts: nome "Giyma Saúde e Estética Avançada", logos, origemDoNome = opcional() (hipótese Gi + Ma: NÃO publicar até confirmar).
3. profissional.ts: nome "Ester Santos", tratamento "Dra.", profissão "farmacêutica esteta", registro "CRF-SC 3984" (confirmado, fonte bio), formacao [{curso "Farmácia", instituicao "Universidade Federal de Santa Catarina", ano 1999}], posEstetica = bloqueante() só para a página da Ester (o resto do site funciona), trajetoria (professora universitária, vigilância sanitária, análises laboratoriais), marcos (1999, 2015 abertura da estética ao farmacêutico, ~38 anos início como paciente, 15/09/2023 Giyma, 2026 50 anos), citações literais com fonte (post).
4. contato.ts: whatsapp 5549998273904; instagram; endereço completo; geo; plusCode; links Google Maps (cid 332599069459016165), Waze, Apple Mapas; comoChegar[] (vazio); estacionamento = opcional().
5. horario.ts: semana = bloqueante("horário não informado") — o site mostra "Horário pelo WhatsApp" em preview; excecoes[]; fuso America/Sao_Paulo. src/lib/horario.ts pronto e testado para quando o dado chegar (aberto agora, fecha às…, abre…).
6. Coleção "tratamentos" (Zod): slug, nome, nomePopular (ex.: "botox"), categoria (facial | maos | pele | corporal), status (confirmado | pendente), paraQuem, oQueE, comoEFeito, cuidados, duracaoSessao (opcional), resultadosEsperados (texto honesto, sem promessa), faq[], midia[], fases[] (20|30|40|50|60+), whatsappMensagem. Crie os registros: toxina-botulinica; preenchimento-labial; contorno-facial (mento, mandíbula, malar, zigomático); sulcos-e-olheiras (bigode chinês, olheiras, marionete, pré-jowls); bioestimulador-de-colageno; rejuvenescimento-de-maos; microagulhamento; peeling; harmonizacao-corporal (status pendente: não aparece em produção).
7. Coleção "fases": 20, 30, 40, 50, 60+ com: titulo, oQueMuda, focos (lista de tratamentos), frase da Ester (texto vazio até a sessão 5), video (fases, com o trecho se houver). Base: vídeo DbBfgMjRUkX e carrossel DQXcUrsEVC7 do mapa.
8. Coleção "resultados": par antes/depois, tratamento, tempoDecorrido, consentimento (pendente|autorizado), legenda. Em produção, só autorizado.
9. avaliacoes.ts: a partir do JSON; exibirNota=false; a avaliação literal de Nathalia F.; depoimentosAutorizados[] (vazio).
10. valores.ts: os 4 valores com a frase de cada um (da sessão 5) e o still correspondente.
11. src/lib/whatsapp.ts: linkWhatsApp(texto) e mensagens: geral "Olá! Vim pelo site da Giyma e gostaria de agendar uma avaliação com a Dra. Ester."; por tratamento "Olá! Vim pelo site da Giyma e gostaria de agendar uma avaliação sobre {tratamento}."; por fase "Olá! Vim pelo site da Giyma. Tenho {faixa} anos e gostaria de entender o que faz sentido para a minha pele."; dúvida "Olá! Vim pelo site da Giyma e tenho uma dúvida sobre {tema}." Testes de todas.
12. termos.ts (lista do CLAUDE.md, seção 8), seo.ts (SITE_URL por env; indexar=false), tema.ts.
13. validate-config e audit-compliance: travas do CLAUDE.md seção 9 + termos vetados no dist/ + todo nome "Dra. Ester Santos" no HTML tem "CRF-SC 3984" no mesmo bloco (componente <AssinaturaProfissional>).

Critério de aceite: testes verdes (horário, WhatsApp, travas simuladas); preview passa com pendências; commit "config".
````

---

## PROMPT 3 — Design system, logo e "O Florescer"

````text
Leia CLAUDE.md, docs/MIDIA_CATALOGO.md e src/config/tema.ts. Pesquise antes (MDN): clip-path, mask-image, @property, stroke-dashoffset, View Transitions, prefers-reduced-motion.

Tarefa: tokens, tipografia, logo, componentes base e a assinatura. Página /_estilo (noindex) com tudo.
Escopo: src/styles/**, src/components/base/**, src/components/marca/**, src/pages/_estilo.astro, scripts/audit-contraste.mjs.

Passos:
1. Tokens claro e escuro (o site alterna capítulos cacau, petróleo e pérola; o tema escuro global inverte com cuidado): calibre as cores com os stills (o petróleo da parede, o ouro do logo). audit-contraste valida AA de cada par usado. O ouro velho só em fios, monograma e números grandes; texto corrido nunca em ouro sobre pérola se não passar AA.
2. Tipografia: teste Bellefair × Gilda Display (títulos), Mulish × Red Hat Text (texto), EB Garamond Italic (acentos), Josefin Sans (rótulos), em 3 provas: hero com o nome e o CRF, bloco da Linha do tempo, citação longa da Ester. Escolha com capturas e justifique. Escala fluida (clamp): display grande e fino, texto 17–18 px, entrelinha generosa.
3. Logo: componentes <Logo variante="vertical|horizontal|monograma"> a partir dos SVG (currentColor, title acessível). Verifique a nitidez do monograma em 24, 32, 48 e 96 px; se precisar, crie uma versão "pequena" com traço proporcionalmente mais grosso (sem mudar o desenho). Favicon e apple-touch-icon a partir do monograma.
4. Assinatura "O Florescer" (componentes):
   (a) <Florescer>: revelação de bloco/imagem por duas curvas que se abrem do centro (clip-path com duas elipses que se afastam), 700–900 ms, uma vez, WAAPI;
   (b) <Haste>: divisor vertical fino em ouro com duas folhas mínimas (do monograma) que se abrem ao entrar na tela;
   (c) foco e hover: fio dourado de 1 px que acende na borda; foco visível de alto contraste sempre.
   NÃO use o arco como moldura, máscara ou botão.
5. <LinhaDoTempo>: seletor de fases 20 · 30 · 40 · 50 · 60+ (role=tablist, setas do teclado, URL com ?fase= para compartilhar). O painel troca com um cross-fade curto; sem JS, as cinco fases aparecem em sequência.
6. Componentes base: Botão primário "Agendar avaliação" (ícone oficial do WhatsApp monocromático, sem círculo), botão secundário, Link, Rótulo, Citação (voz da Ester, com fonte), <AssinaturaProfissional> (Dra. Ester Santos · farmacêutica esteta · CRF-SC 3984), Par antes/depois (componente <Comparador> com range acessível, legendas "Antes" e "Depois · {tempo}" sempre visíveis), Moldura de vídeo vertical, Pôster com LQIP, Mapa estático.
7. Movimento: durações 200–900 ms, uma curva assinatura (suave, "orgânica"), nada de bounce. prefers-reduced-motion: estados finais diretos.
8. /_estilo com tudo, claro e escuro.

Critério de aceite: AA verde; capturas de /_estilo em 390/1440 claro/escuro/reduced-motion; JS desta sessão ≤ 6 KB; commit "design system".
````

---

## PROMPT 4 — Entrada e hero

````text
Leia CLAUDE.md e os componentes da sessão 3. Use o retrato recortado (627373272) e o loop-letras.

Tarefa: a entrada e o hero da home. Só isso.
Escopo: src/components/entrada/**, src/components/hero/**, src/pages/index.astro (só o hero).

A ENTRADA, "O FLORESCER" (≤ 2,6 s no total, uma vez por sessão):
- 0–0,3 s: tela pérola, silêncio visual.
- 0,3–1,1 s: o monograma se desenha em ouro velho (stroke-dashoffset): primeiro a haste, de baixo para cima; depois o quadrado e o arco num traço contínuo e calmo.
- 1,1–1,6 s: as duas folhas se abrem a partir do topo da haste (as curvas crescem para os lados) e "GIYMA" aparece com o tracking se fechando, sem bounce. O subtítulo "SAÚDE E ESTÉTICA AVANÇADA" vem logo depois, em opacidade.
- 1,6–2,6 s: a tela pérola se abre do centro para os lados em duas curvas (o florescer, igual às folhas), revelando o hero por baixo; o logo encolhe e vai para o cabeçalho (FLIP com WAAPI; View Transition se suportado).
- Botão "Pular" acessível desde o primeiro quadro; toque, clique, tecla ou rolagem pula para o estado final. Uma vez por sessão (sessionStorage com try/catch). Visitas seguintes, reduced-motion e sem JS: estado final direto (a camada da entrada só existe se o JS criá-la).
- O retrato do hero é o LCP, está no HTML desde o início com fetchpriority="high". Meça Lighthouse com e sem a entrada; se piorar o LCP, a camada passa a ser transparente sobre a imagem já pintada.

O HERO:
- Desktop (1440): composição editorial assimétrica em cacau. À direita, o retrato grande da Ester (recorte 3:4, sangrando para a borda direita e para baixo). À esquerda: rótulo em versalete "SAÚDE E ESTÉTICA AVANÇADA · LAGES"; H1 em serifa grande (provisório, a sessão 5 refina): "Beleza natural em cada fase da vida."; linha de apoio: "Harmonização facial com avaliação individual, planejamento e o cuidado de quem conhece a pele por dentro."; <AssinaturaProfissional>; botões "Agendar avaliação" (WhatsApp) e "Conheça a Dra. Ester"; embaixo, discreto: endereço curto e o Instagram.
- Mobile (390): retrato em cima (4:5) com o nome sobreposto no pé da foto, H1 e botões abaixo; o botão de agendar fica visível na primeira dobra.
- Detalhe de luxo: no canto do hero, um fio de ouro com a haste do monograma (o divisor <Haste>) separando a coluna de texto.
- Alternativa B (para eu comparar): no lugar do retrato, o loop-letras (as letras douradas na parede petróleo) em tela cheia com o texto à frente. Entregue as duas em /_hero-a e /_hero-b (noindex) com capturas.

Critério de aceite: sequência de capturas da entrada (0; 0,6; 1,2; 1,8; 2,6 s) em 390 e 1440; LCP < 2,0 s mobile medido com e sem entrada; Pular funciona no teclado; reduced-motion sem animação; commit "entrada e hero".
````

---

## PROMPT 5 — Textos (a voz da Ester, editada para o site)

````text
Leia CLAUDE.md, docs/GIYMA_INVESTIGACAO_CLIENTE.md (seções 3, 4 e 6), docs/GIYMA_MAPA_MIDIA.md (textos transcritos) e src/config.

Tarefa: escrever TODOS os textos do site em src/content (coleções e textos de página), com fonte de cada citação.
Escopo: só texto. Nada de layout.

Regras de voz:
- Primeira pessoa da Ester quando é ela falando ("eu", "aqui comigo"); a marca em "nós" quando é a clínica. Calorosa, segura, elegante, frases curtas. Sem emoji, sem hashtag, sem superlativo, sem promessa.
- Use as frases reais dela (seção 1 do CLAUDE.md) como espinha, editadas só para o ritmo do site. Toda citação literal leva a fonte (post).
- Cada página de tratamento começa com um parágrafo-resposta (2–3 frases) com o quê + quem faz + onde: "Na Giyma, no Centro de Lages, a Dra. Ester Santos (farmacêutica esteta, CRF-SC 3984) aplica toxina botulínica para suavizar e prevenir rugas de expressão, como as da testa, entre as sobrancelhas e os pés de galinha, sempre depois de uma avaliação individual."
- Seção de cuidados e riscos em linguagem simples (inchaço, roxo, retorno), sem assustar e sem esconder. Termine com "Na avaliação, a Dra. Ester explica o que faz sentido para você."
- Nada inventado: sem número de pacientes, sem duração exata se não confirmada, sem marcas comerciais.

Textos a entregar:
1. Home (ordem do Prompt 6A): manifesto curto; os 4 valores com uma frase cada; a Linha do tempo (20, 30, 40, 50, 60+: o que muda, focos, frase da Ester; base no vídeo DbBfgMjRUkX e no carrossel DQXcUrsEVC7); a prévia da história; o convite à avaliação ("Como é a sua avaliação": escuta, análise do rosto e da pele, planejamento por etapas, o que fazer e o que não fazer, cuidados); "O espaço" (legendas dos capítulos do tour).
2. /dra-ester-santos: a história completa (1999, as "muitas Esters", 2015, o renascimento aos 38, a Giyma, os 50 anos), a formação (com o campo da pós vazio até chegar), "por que uma farmacêutica" (o texto "Farmacêutico esteta" dela: formulações, bioquímica, farmácia clínica, cosmetologia), e a frase-convite.
3. /a-giyma: o espaço, os valores, como é a experiência do primeiro contato ao retorno.
4. Cada tratamento confirmado (coleção) e /tratamentos (índice editorial).
5. /cada-fase (a Linha do tempo em página própria) e uma página por fase só se cada uma tiver conteúdo real e diferente (senão, âncoras).
6. /perguntas-frequentes: as 4 da arte (transcritas), os 3 medos do botox (vídeo), os 3 mitos do preenchimento, botox × preenchimento, creme × bioestimulador, por que começar no inverno, "quem pode aplicar? farmacêutico pode?" (resposta factual e serena, com as resoluções do CFF), "o que é avaliação personalizada?", "como chegar e onde estacionar" (pendente).
7. /resultados (texto de abertura sobre naturalidade e consentimento), /como-chegar, /privacidade, 404.
8. Microtextos: botões, mensagens do WhatsApp por contexto, alt de cada imagem, descrições dos vídeos, rodapé.
9. Metas: title (≤ 60) e description (≤ 155) por página, com tratamento + Lages.

Critério de aceite: audit-compliance sem termo vetado nos textos; toda citação com fonte; campos pendentes listados; commit "textos".
````

---

## PROMPT 6A — Home

````text
Leia CLAUDE.md, src/content e os componentes das sessões 3 e 4.

Tarefa: montar a home inteira abaixo do hero. Cada seção com um gesto próprio. Nada de seções iguais.
Escopo: src/pages/index.astro, src/components/secoes/**.

Seções (nesta ordem):
1. MANIFESTO (pérola): duas ou três frases grandes em serifa, com a palavra-chave em itálico ("Não é sobre mudar quem você é."), e a <Haste> abrindo antes do texto.
2. A DRA. ESTER (cacau): retrato secundário (quadro do tour na recepção ou do ensaio), a história em 4 linhas, os marcos como números grandes em ouro (1999 · 2015 · 2023), <AssinaturaProfissional>, link "Conheça a história".
3. A LINHA DO TEMPO DA PELE (pérola): o componente <LinhaDoTempo> em destaque, com o vídeo "fases" ao lado em moldura vertical e um botão por fase ("Agendar avaliação para a minha fase": mensagem da fase).
4. TRATAMENTOS (petróleo): índice editorial em lista grande (não cards): nome em serifa, nome popular em versalete, uma linha, e uma imagem que aparece ao lado no hover/foco (no mobile, miniatura fixa). Link para cada página.
5. COMO É A SUA AVALIAÇÃO (pérola): 4 passos em linha horizontal com números grandes (Escuta · Análise · Planejamento · Cuidado depois), still do modelo anatômico com a marcação (planejamento real).
6. O ESPAÇO (cacau): o tour em capítulos: vídeo vertical à esquerda e lista de capítulos à direita (clicar pula o vídeo para o tempo); no mobile, carrossel nativo de stills com legenda. Fecha com "Rua Rui Barbosa, 277 · Centro · Lages".
7. VALORES (pérola): os 4 valores em composição assimétrica (2 grandes + 2 pequenos), cada um com um still real do tour.
8. RESULTADOS (petróleo): só aparece se houver pares autorizados; senão, a seção vira "Naturalidade com propósito" com a frase dela e um link para a FAQ. Com pares: <Comparador> grande + 2 pequenos, legenda técnica.
9. O QUE DIZEM (pérola): a avaliação de Nathalia F. em citação grande + depoimentos autorizados (se houver) + "Avaliar a Giyma no Google" (link). Sem nota/estrelas agregadas.
10. AGENDAR E VISITAR (cacau): CTA grande "Agende sua avaliação", horário (ou "Horário pelo WhatsApp" enquanto pendente), endereço completo, mapa estático, botões Google Maps / Waze / Apple Mapas, Instagram.
11. RODAPÉ: logo horizontal, <AssinaturaProfissional>, endereço, WhatsApp escrito, Instagram, CNPJ (pendente), privacidade, links.
- Botão flutuante discreto "Agendar" (mobile) que some quando a seção 10 está na tela.

Critério de aceite: capturas 390/1440 claro/escuro/reduced-motion da home inteira; Lighthouse mobile ≥ 95/100; JS total da home ≤ 35 KB gzip; sem rolagem horizontal; commit "home".
````

---

## PROMPT 6B — Tratamentos

````text
Leia CLAUDE.md e src/content/tratamentos.

Tarefa: índice e páginas de tratamento com template próprio, pensadas para busca local e para quem chega com medo.
Escopo: src/pages/tratamentos/index.astro, src/pages/tratamentos/[slug].astro, src/layouts/Tratamento.astro.

Template: H1 "{Tratamento} em Lages" (ex.: "Toxina botulínica em Lages"); parágrafo-resposta; <AssinaturaProfissional>; "Para quem é"; "Como é feito" (passos numerados); "O que esperar" (honesto, sem promessa); "Cuidados" (antes e depois); par antes/depois autorizado, se houver; vídeo da Ester, se houver; FAQ da página (<details>); "Em que fase costuma fazer sentido" (links para a Linha do tempo); CTA "Agendar avaliação sobre {tratamento}"; tratamentos relacionados; breadcrumb.
- Tratamentos com status pendente não geram página em produção.
- URLs: /tratamentos/toxina-botulinica, /preenchimento-labial, /contorno-facial, /sulcos-e-olheiras, /bioestimulador-de-colageno, /rejuvenescimento-de-maos, /microagulhamento, /peeling.
- Rejuvenescimento de mãos ganha destaque (nicho pouco ocupado em Lages, post de 30/10/2026).

Critério de aceite: capturas de 3 páginas em 390/1440; nenhuma marca comercial nos títulos; commit "tratamentos".
````

---

## PROMPT 6C — Dra. Ester, A Giyma, Fases, Resultados, FAQ, Como chegar

````text
Leia CLAUDE.md e src/content.

Tarefa: as páginas de confiança e de dúvida.
Escopo: src/pages/{dra-ester-santos,a-giyma,cada-fase,resultados,perguntas-frequentes,como-chegar,privacidade,404}.astro.

- /dra-ester-santos: página de autoridade (para pessoas, Google e IAs). Retrato grande; a história em capítulos ("As muitas Esters" · "2015" · "Os 38" · "A Giyma" · "Hoje"); linha de marcos com números grandes; formação (com o campo da pós em PROVISÓRIO até chegar); "Por que uma farmacêutica esteta"; citações dela; CTA.
- /a-giyma: o tour completo (vídeo com capítulos), os valores, a experiência do primeiro contato ao retorno, a fachada (para reconhecer na rua).
- /cada-fase: a Linha do tempo em página própria, com ?fase= no endereço.
- /resultados: só pares autorizados, filtro por tratamento, texto sobre naturalidade e consentimento. Sem pares: a página explica que os resultados são mostrados na avaliação e leva à FAQ (sem página vazia).
- /perguntas-frequentes: <details> nativos, agrupados (Toxina · Preenchimento · Bioestimulador · Avaliação · Sobre a Dra. Ester · Visita).
- /como-chegar: endereço grande com botão copiar, fachada (still), mapa estático e, após clique e consentimento, mapa interativo; Google Maps / Waze / Apple Mapas; horário (ou pendente); estacionamento (pendente).
- /privacidade: LGPD simples. 404: curta, com o monograma e três caminhos.

Critério de aceite: capturas 390/1440 de todas; nenhuma página vazia em produção; commit "paginas".
````

---

## PROMPT 7 — Funil WhatsApp e LGPD

````text
Leia CLAUDE.md e src/lib/whatsapp.ts.

Tarefa: endurecer o funil e medir sem invadir.
Escopo: componentes de CTA, src/components/consentimento/**, src/lib/medicao.ts, docs/FUNIL.md.

1. Todos os CTAs passam por linkWhatsApp() com a mensagem do contexto (página, tratamento, fase). Sem JS: link direto com a mensagem geral.
2. Mini assistente opcional "Não sei o que fazer": 3 perguntas (o que te incomoda hoje? · faixa de idade · já fez algum procedimento?) que montam o texto da mensagem e abrem o WhatsApp. Nada é guardado. Rádios nativos, acessível, ≤ 4 KB.
3. Medição: eventos clique_whatsapp (origem, tratamento, fase), clique_como_chegar, clique_instagram. Ferramenta sem cookie (Plausible/Umami) OU GA4 só após consentimento; proponha e justifique.
4. Banner de consentimento com Aceitar e Recusar do mesmo peso; mapa interativo e medição com cookie só após aceitar; preferência alterável no rodapé.
5. docs/FUNIL.md: caminhos até o WhatsApp e as mensagens exatas.

Critério de aceite: testes e2e (Playwright, 390 px) gerando o link exato em 5 cenários; nenhum request de terceiro antes do consentimento; commit "funil e lgpd".
````

---

## PROMPT 8 — SEO local e GEO

````text
Leia CLAUDE.md e a seção 7 de docs/GIYMA_INVESTIGACAO_CLIENTE.md. Pesquise e cite antes: schema.org (MedicalBusiness, HealthAndBeautyBusiness, BeautySalon, Physician NÃO, Person, Service, FAQPage), Google Search Central (negócio local, avaliações autosservidas, FAQ), llms.txt.

Tarefa: deixar o site legível e citável por Google e IAs.
Escopo: src/components/seo/**, robots, sitemap, public/llms.txt (gerado), scripts/audit-seo.mjs, docs/SEO_GEO.md.

1. JSON-LD gerado da config: negócio (tipo escolhido pela pesquisa; NUNCA Physician nem MedicalClinic que sugira médico) com name, address, geo, telephone, url, sameAs (Instagram, ficha), openingHoursSpecification (quando houver), hasOfferCatalog com os tratamentos confirmados; Person "Ester Santos" (jobTitle "Farmacêutica esteta", identifier CRF-SC 3984, alumniOf UFSC, knowsAbout, worksFor Giyma); Service por tratamento; FAQPage; BreadcrumbList. SEM AggregateRating e sem Review.
2. Metas, canonical, Open Graph (imagem 1200×630 gerada no build: retrato + logo + "Lages/SC"), lang pt-BR.
3. NAP idêntico em todas as páginas; audit-seo falha se divergir.
4. llms.txt: quem é a Ester, formação, registro, o que faz, endereço, horário, como agendar, links.
5. Conteúdo citável: parágrafo-resposta no topo de cada página; títulos em pergunta onde fizer sentido; termos que queremos associar (beleza natural, cada fase da vida, rejuvenescimento de mãos, planejamento, farmacêutica esteta em Lages) usados com naturalidade.
6. noindex enquanto indexar=false; sitemap e robots corretos quando virar true.
7. docs/SEO_GEO.md (checklist para o João fora do site): ficha do Google completa (categoria, horário, site, descrição, serviços, 20+ fotos, link de agendamento); pedir avaliação a toda paciente, sem incentivo, com QR na recepção; NAP igual no Instagram, WhatsApp Business, Apple Business Connect e Bing; teste mensal sem login: "harmonização facial em Lages", "preenchimento labial Lages", "bioestimulador de colágeno Lages", "rejuvenescimento de mãos Lages", "farmacêutica esteta Lages".

Critério de aceite: Rich Results Test e validator.schema.org sem erro (capturas); audit-seo verde; commit "seo e geo".
````

---

## PROMPT 9 — QA, conferência final e deploy

````text
Leia CLAUDE.md e docs/PENDENCIAS.md.

Tarefa: auditoria completa, conferência de normas (a única passada) e deploy.
Escopo: correções pontuais, docs/QA.md, docs/CONFERENCIA_FINAL.md, configuração de deploy.

1. Desempenho: Lighthouse mobile em todas as rotas (≥ 95/100); pesos de JS, CSS, fontes e vídeos; LCP com e sem a entrada.
2. Acessibilidade: axe em todas as rotas; teclado do início ao fim (entrada → pular → Linha do tempo → comparador → WhatsApp); leitor de tela; contraste; reduced-motion; zoom 200%; pausar vídeo.
3. Navegadores: Chrome, Safari iOS (WebKit), Firefox; Android 390 px.
4. ACABAMENTO "CLIENTE EXIGENTE": revise cada página como diretor de arte. Liste e corrija viúvas e órfãs nos títulos (use &nbsp; e text-wrap: balance/pretty), alinhamentos ópticos, espaçamentos inconsistentes, imagens com recorte ruim, estados de foco feios, textos cortados em 390 px, hifenização, aspas tipográficas (“ ”), travessões, acentos. Capturas antes/depois.
5. Conferência de normas: CFF (assinatura profissional em todo lugar; sem promessa; sem preço ou promoção; antes e depois só autorizados, com legenda técnica); Anvisa (nenhuma marca comercial de medicamento como chamada); CDC (informação clara); LGPD; direito de imagem (crédito do fotógrafo, consentimentos); Google (sem AggregateRating, sem avaliação incentivada); termos vetados. NÃO afrouxe nenhuma trava.
6. Deploy: hospedagem estática (Vercel por padrão), SITE_URL por env, cabeçalhos (CSP por hash, HSTS, Referrer-Policy, Permissions-Policy), cache longo para /media com hash, preview com noindex.
7. docs/QA.md com números e capturas; docs/CONFERENCIA_FINAL.md com o que foi conferido e o que depende do João.

Critério de aceite: todos os números no relatório; nenhuma trava afrouxada; commit "qa e deploy".
````

---

## PROMPT L — Nova mídia (reutilizável)

````text
Leia CLAUDE.md e docs/MIDIA_CATALOGO.md.

Tarefa: incorporar a mídia nova de media-novas/ sem quebrar nada.
[Lista: arquivo · o que é · onde entra · consentimento (autorizado?) · pode ter som? · crédito]

1. Inventário, folha de contato, avaliação de qualidade (nitidez, luz, texto queimado, música).
2. git mv para media-originais/; registros no manifesto (mesmos campos; consentimento e audioLiberado só se eu disser).
3. Recortes, trechos, pôsteres e derivados (mesma régua da sessão 1).
4. Encaixe por tipo: ensaio da Ester → hero, /dra-ester-santos, Open Graph (troca os provisórios); antes e depois autorizados → coleção resultados (o <Comparador> passa a aparecer); tour sem legenda → /a-giyma e home; fotos do espaço → O espaço, Como chegar; Ester falando sem música → Linha do tempo e FAQ (com transcrição em texto na página, para GEO).
5. Remova selos PROVISÓRIO que deixaram de valer; atualize PENDENCIAS.
6. Capturas antes/depois das páginas afetadas.

Critério de aceite: build verde; LCP não piora; nada sem consentimento publicado; commit "midia: <resumo>".
````

---

## PROMPT D — Novo dado (reutilizável)

````text
Leia CLAUDE.md e src/config.

Tarefa: atualizar dados confirmados pelo João, só na config e no conteúdo, e propagar.
[Dados: ex.: horário seg a sex 9h–19h…; pós-graduação em X (instituição, ano); procedimentos corporais: …; origem do nome Giyma: …; CNPJ e responsável técnico; domínio; estacionamento; consentimento autorizado para os pares 18, 19, 21; link de avaliação do Google; crédito do fotógrafo]

Passos: trocar opcional()/bloqueante() por confirmado(valor, "João, <data>"); rodar validate-config, testes, audit-seo (NAP) e build; capturas das páginas afetadas; atualizar PENDENCIAS e docs/SEO_GEO.md se o dado for de NAP.
Critério de aceite: testes verdes; nenhum texto com o valor antigo (busca no dist/); commit "dados: <resumo>".
````

---

## C. O que falta (não trava o início; trava a produção onde indicado)

**Trava a produção**
1. **Horário de atendimento.**

**Importante antes da sessão 5**
2. Pós-graduação em estética (instituição e ano) e confirmação da averbação no CRF-SC.
3. Procedimentos corporais que ela faz de fato.
4. Origem do nome Giyma (Gi + Ma?).
5. CNPJ e responsável técnico; quem mais atende na clínica.
6. Estacionamento perto; ponto de referência.

**Mídia (entra pelo Prompt L)**
7. Originais do ensaio profissional + crédito do fotógrafo.
8. Antes e depois originais **com autorização escrita**.
9. Vídeo do tour e vídeos dela falando, sem legenda queimada e sem música.
10. Fotos limpas do espaço.
11. Logo original do designer (se existir).

**Fora do site (já pode começar)**
12. Completar a ficha do Google (categoria, horário, site, fotos) e começar a pedir avaliações.
13. Domínio.
