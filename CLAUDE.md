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
