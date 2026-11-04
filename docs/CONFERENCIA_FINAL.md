# Conferência final de normas (sessão 9: a única passada)

Data: 04/11/2026. Base: o HTML final do `dist/` em preview e em produção simulada, o JSON-LD, o
llms.txt, as mensagens de WhatsApp e o `media.manifest.json`.

**Nenhuma trava foi afrouxada.** `src/config/termos.ts`, `scripts/lib/travas.mjs`,
`scripts/audit-compliance.mjs`, `scripts/validate-config.mjs` e `scripts/test-config.mjs` não
mudaram nesta sessão (o `git diff` desses arquivos está vazio). O que entrou é trava nova:

- `audit-csp`;
- `audit-a11y` com as regras de boas práticas;
- teste de pausa de vídeo;
- auditoria de tipografia.

Legenda:

- ✓ conferido e conforme;
- ⚠ conforme no site, mas depende de documento ou decisão do João;
- ✗ não conforme (não há nenhum).

## 1. CFF: publicidade da farmacêutica esteta (Res. 658/2018 e 724/2022)

| Item | Como foi conferido | Estado |
| --- | --- | --- |
| "Dra. Ester Santos · farmacêutica esteta · CRF-SC 3984" sempre juntos | `audit-compliance`: todo "Dra. Ester" no texto, no `alt`/`title`/`aria-label` e no `<meta>` está dentro da assinatura com profissão e CRF (22 páginas, 0 problemas). `audit-seo`: idem no JSON-LD. O llms.txt foi conferido à mão. Rodapé, hero e página da Ester trazem a assinatura completa | ✓ |
| "Dra." sozinho sugerindo médica | Botões dizem "Conheça a Ester Santos". No JSON-LD a pessoa é "Ester Santos", com `jobTitle` "Farmacêutica esteta". O tipo do negócio nunca é Physician ou MedicalClinic (travado no audit-seo). O llms.txt diz "ela é farmacêutica, não médica" | ✓ |
| Mensagem pronta do WhatsApp "…avaliação com a Dra. Ester." | É o texto que a paciente envia, não publicidade na página. Fica a decisão do João (pendência da sessão 7) | ⚠ |
| Sem promessa de resultado | Termos vetados: 0 no HTML (`audit-compliance`), 0 nos textos (`validate-config`), 0 no JSON-LD (`audit-seo`). Varredura ampla adicional ("garant", "imediat", "definitiv", "milagr", "perfeit", "anos mais jovem", "100%") com 0 ocorrência real. O texto de resultados diz "Resultados variam de pessoa para pessoa. Eles mostram o cuidado, não uma promessa." | ✓ |
| Sem preço, promoção, combo, bônus, vale, sorteio ou "avaliação gratuita" | Varredura de "R$", "preço", "parcel", "promo", "descont", "grátis", "combo", "bônus", "vale", "sorteio": 0 ocorrência ("valores" aparece só no sentido de princípios). O llms.txt diz que o site não divulga preço | ✓ |
| Antes e depois só autorizados, com legenda técnica | Nenhum par tem `consentimento=autorizado`, então nenhum é publicado. O `prepare-media` nem copia os pares para `public/`, e o `audit-compliance` trava qualquer referência. O comparador exige procedimento + tempo decorrido (schema) | ✓ (hoje: 0 pares no ar) |
| Habilitação para estética (pós-graduação, averbação no CRF-SC) | `profissional.posEstetica` bloqueante: a página /dra-ester-santos não vai para produção, e a resposta "Farmacêutico pode?" aguarda a confirmação | ⚠ |

## 2. Anvisa: marca comercial de medicamento

| Item | Estado |
| --- | --- |
| Botox, Dysport, Sculptra etc. como chamada no texto | ✓ Nenhum. "botox" aparece só na FAQ, como nome popular, dentro de `[data-nome-popular]` (exceção do CLAUDE.md), e na FAQPage do JSON-LD, que reproduz a FAQ visível |
| **Legenda queimada nos vídeos do Instagram** | ⚠ O vídeo de toxina (player mudo, só toca se a pessoa apertar) tem "Botox" na legenda original em vários trechos. Apagar texto queimado é proibido (CLAUDE.md §7), então o **pôster** foi trocado para um quadro sem a marca (7,05 s, "como prevenção."). **Decisão do João:** manter o vídeo como fala da Ester em formato de FAQ, ou tirá-lo das páginas |
| **Caixas de Restylane ao fundo** | ⚠ Aparecem na estante em todos os vídeos gravados no consultório. Não são chamada nem citação, são o cenário. Registrado para o João decidir |
| Foto de produto | ✓ O still `still-produto` (caixa na mão da Ester) não é usado em nenhuma página |

## 3. CDC: informação clara

| Item | Estado |
| --- | --- |
| Quem presta o serviço, onde e como contratar | ✓ NAP idêntico em todas as páginas (o `audit-seo` trava divergência). "Você conversa com a equipe e agenda sua avaliação." Nenhum preço que possa induzir |
| Aviso de que o site não substitui a avaliação | ✓ Rodapé de todas as páginas |
| Cuidados e riscos de cada tratamento em linguagem simples | ✓ Seção "Quais são os cuidados?" em cada tratamento |
| CNPJ e razão social | ⚠ Pendentes: aparecem como "PROVISÓRIO" no preview. **Para produção, o João precisa mandar** (identificação do fornecedor) |
| Horário de atendimento | ⚠ Bloqueante (trava a produção, como previsto) |

## 4. LGPD

| Item | Estado |
| --- | --- |
| Formulário, cadastro, cookie | ✓ Nenhum. A preferência de privacidade fica no `localStorage`, sem cookie |
| Terceiros antes do consentimento | ✓ Zero requests (e2e). O mapa do Google e a medição (Plausible, sem cookie) só carregam depois de "Aceitar" |
| Aceitar = Recusar, preferência alterável | ✓ Mesmo estilo (e2e compara). "Preferências de privacidade" no rodapé |
| Assistente "Não sei o que fazer" | ✓ Nada é guardado nem enviado ao site; o texto só existe no link do WhatsApp |
| Política de privacidade | ⚠ Texto no ar. Faltam razão social, CNPJ, e-mail do encarregado de dados e data de atualização |
| Dados sensíveis (saúde e imagem) | ✓ Nenhum coletado pelo site. A política explica prontuário e autorização de imagem |
| CSP e cabeçalhos | ✓ CSP por hash. `Referrer-Policy` e `Permissions-Policy` sem câmera, microfone ou localização |

## 5. Direito de imagem

| Item | Estado |
| --- | --- |
| **Paciente no tour do espaço** | ✓ Corrigido nesta conferência. A paciente aparece de 17,7 a 25,3 s (de costas na consulta e deitada no procedimento). Sem autorização escrita no repositório, o vídeo publicado **termina em 17,6 s** (corte de trecho, que é edição permitida). Os capítulos "Procedimento" e "Recepção" saíram do vídeo, e a recepção segue nas fotos. ⚠ Volta inteiro se o João mandar a autorização da paciente |
| **Crédito do fotógrafo do retrato** (hero, OG, página da Ester) | ⚠ O retrato veio de um post de outra conta, provavelmente do fotógrafo. Faltam o crédito e a **licença de uso no site**: é direito autoral, não só de imagem. O João precisa confirmar com o fotógrafo, ou mandar os originais do ensaio com a autorização |
| Imagem da própria Ester | ⚠ Autorização da Ester para uso no site e nas redes: guardar por escrito (contrato com a WAXLO) |
| Depoimento | ✓ Só o da Google: "Nathalia F." (primeiro nome + inicial), citação literal, com link para a ficha. Nenhum depoimento fora do Google sem autorização |
| Antes e depois | ✓ Nenhum publicado (ver §1) |
| Edição de mídia | ✓ Nenhuma IA generativa, retoque de pele ou texto apagado. Só recorte, trecho e escolha de quadro do pôster (registrados no manifesto) |

## 6. Google

| Item | Estado |
| --- | --- |
| `AggregateRating` e `Review` | ✓ Ausentes (o `audit-seo` trava). Sem estrelas e sem nota no site (`avaliacoes.exibirNota=false`) |
| Avaliação incentivada | ✓ O site não oferece nada em troca de avaliação. O checklist do João (`docs/SEO_GEO.md`) proíbe brinde, desconto ou sorteio |
| Dados estruturados | ✓ Válidos contra o vocabulário oficial do schema.org 30.1. ⚠ Falta rodar o Rich Results Test e o validator.schema.org com o site no ar |

## 7. Termos vetados

✓ A lista de `src/config/termos.ts` está intacta (18 termos), e 0 ocorrências no HTML, nos textos
e no JSON-LD.

## 8. O que depende do João (para publicar)

**Trava a produção hoje:**
1. Horário de atendimento.

**Precisa antes de publicar** (não trava o build, mas é risco legal):
2. Licença ou crédito do fotógrafo do retrato, ou os originais do ensaio com autorização.
3. CNPJ, razão social e encarregado de dados (rodapé e política de privacidade).
4. Decisão sobre o vídeo de toxina, que tem "Botox" na legenda original e Restylane ao fundo.
5. Domínio: `SITE_URL` na Vercel, e `seo.indexar=true` quando for ao ar (`docs/DEPLOY.md`).

**Para destravar conteúdo** (o site já funciona sem):
6. Pós-graduação e averbação: libera a página da Ester.
7. Autorização da paciente do tour: devolve o vídeo inteiro.
8. Medição (Plausible ou Umami) e o domínio dela.

**Teste em aparelho real** (10 minutos), porque este ambiente só tem o Chromium:
- **iPhone (Safari):**
  - abrir a home e deixar a entrada rodar;
  - trocar de fase na Linha do tempo;
  - abrir "Não sei o que fazer", responder e tocar em "Abrir no WhatsApp": a mensagem chega
    pronta;
  - abrir /como-chegar → "Mostrar o mapa interativo" → Aceitar;
  - tocar um vídeo.
- **Firefox (computador):** o mesmo percurso, e conferir o rodapé e o aviso de privacidade.
