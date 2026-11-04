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
| Mensagem pronta do WhatsApp "…avaliação com a Dra. Ester." | ✓ Mantida: é o texto que a paciente escolhe enviar no WhatsApp dela, não publicidade na página (nenhum botão ou texto do site mostra "Dra." sem o CRF) |
| Sem promessa de resultado | Termos vetados: 0 no HTML (`audit-compliance`), 0 nos textos (`validate-config`), 0 no JSON-LD (`audit-seo`). Varredura ampla adicional ("garant", "imediat", "definitiv", "milagr", "perfeit", "anos mais jovem", "100%") com 0 ocorrência real. O texto de resultados diz "Resultados variam de pessoa para pessoa. Eles mostram o cuidado, não uma promessa." | ✓ |
| Sem preço, promoção, combo, bônus, vale, sorteio ou "avaliação gratuita" | Varredura de "R$", "preço", "parcel", "promo", "descont", "grátis", "combo", "bônus", "vale", "sorteio": 0 ocorrência ("valores" aparece só no sentido de princípios). O llms.txt diz que o site não divulga preço | ✓ |
| Antes e depois só autorizados, com legenda técnica | Publicados 3 pares autorizados, com luz e ângulo coerentes: f00 (lábios), f03 (mento) e f05 (toxina na testa). Rótulos "Antes da harmonização" e "Depois da harmonização na Giyma". A legenda traz o procedimento e "O resultado depende de cada paciente". **Por ordem expressa do João (04/11/2026), o tempo decorrido não aparece** ("depende muito de cada paciente"): o campo é preenchido com "depende de cada paciente", e as travas continuam exigindo legenda e autorização. Ficaram fora: f06 (as mesmas fotos do f00), f20 (ângulo diferente), f22 (luz diferente), f18, f19 e f21 (procedimento não informado e marca d’água sobre o rosto) | ✓ |
| Habilitação para estética | ✓ Pós-graduação lato sensu em Farmácia Estética, que habilita a Ester no CRF-SC para os injetáveis (João, 04/11/2026). A página /dra-ester-santos vai para a produção. Instituição e ano não informados: o site não os cita |

## 2. Anvisa: marca comercial de medicamento

| Item | Estado |
| --- | --- |
| Botox, Dysport, Sculptra etc. como chamada no texto | ✓ Nenhum. "botox" aparece só na FAQ, como nome popular, dentro de `[data-nome-popular]` (exceção do CLAUDE.md), e na FAQPage do JSON-LD, que reproduz a FAQ visível |
| **Legenda queimada nos vídeos do Instagram** | ✓ Decisão do João: o vídeo de toxina fica (é a fala da Ester respondendo dúvidas, com "botox" como nome popular, no espírito da exceção da FAQ). Player mudo, só toca se a pessoa apertar. O pôster fica num quadro sem a marca |
| **Caixas de Restylane ao fundo** | ✓ São o cenário do consultório, não chamada nem citação. Mantido com o vídeo (decisão do João) |
| Foto de produto | ✓ O still `still-produto` (caixa na mão da Ester) não é usado em nenhuma página |

## 3. CDC: informação clara

| Item | Estado |
| --- | --- |
| Quem presta o serviço, onde e como contratar | ✓ NAP idêntico em todas as páginas (o `audit-seo` trava divergência). "Você conversa com a equipe e agenda sua avaliação." Nenhum preço que possa induzir |
| Aviso de que o site não substitui a avaliação | ✓ Rodapé de todas as páginas |
| Cuidados e riscos de cada tratamento em linguagem simples | ✓ Seção "Quais são os cuidados?" em cada tratamento |
| CNPJ e razão social | ✓ Decisão do João: ficam de fora por enquanto. O site identifica a clínica por nome, endereço, WhatsApp e profissional com registro |
| Horário de atendimento | ✓ Segunda a sexta, 9h–19h, com agenda personalizada: o site pede para confirmar o horário antes de ir |

## 4. LGPD

| Item | Estado |
| --- | --- |
| Formulário, cadastro, cookie | ✓ Nenhum. A preferência de privacidade fica no `localStorage`, sem cookie |
| Terceiros antes do consentimento | ✓ Zero requests (e2e). O mapa do Google e a medição (Plausible, sem cookie) só carregam depois de "Aceitar" |
| Aceitar = Recusar, preferência alterável | ✓ Mesmo estilo (e2e compara). "Preferências de privacidade" no rodapé |
| Assistente "Não sei o que fazer" | ✓ Nada é guardado nem enviado ao site; o texto só existe no link do WhatsApp |
| Política de privacidade | ✓ No ar, com o contato para pedidos sobre dados (WhatsApp) e a data de atualização (04/11/2026). Razão social e CNPJ ficam de fora por decisão do João |
| Dados sensíveis (saúde e imagem) | ✓ Nenhum coletado pelo site. A política explica prontuário e autorização de imagem |
| CSP e cabeçalhos | ✓ CSP por hash. `Referrer-Policy` e `Permissions-Policy` sem câmera, microfone ou localização |

## 5. Direito de imagem

| Item | Estado |
| --- | --- |
| **Paciente no tour do espaço** | ✓ Autorizada (João, 04/11/2026). O tour vai inteiro |
| **Crédito do retrato** (hero, OG, página da Ester) | ✓ Os posts são da própria Ester: sem fotógrafo a creditar (João, 04/11/2026) |
| Imagem da própria Ester | ✓ Autorizada (João, 04/11/2026). Recomendação: guardar por escrito, no contrato com a WAXLO |
| Depoimentos | ✓ O da Google: "Nathalia F." (primeiro nome + inicial), literal, com link para a ficha. Mais 2 do WhatsApp, autorizados, em texto literal e anônimos ("Paciente da Giyma"), nunca o print |
| Antes e depois | ✓ 3 pares autorizados publicados, sem edição além do recorte idêntico (ver §1) |
| Edição de mídia | ✓ Nenhuma IA generativa, retoque de pele ou texto apagado. Só recorte, trecho e escolha de quadro do pôster (registrados no manifesto) |

## 6. Google

| Item | Estado |
| --- | --- |
| `AggregateRating` e `Review` | ✓ Ausentes (o `audit-seo` trava). Sem estrelas e sem nota no site (`avaliacoes.exibirNota=false`) |
| Avaliação incentivada | ✓ O site não oferece nada em troca de avaliação. O checklist do João (`docs/SEO_GEO.md`) proíbe brinde, desconto ou sorteio |
| Dados estruturados | ✓ Válidos contra o vocabulário oficial do schema.org 30.1, com horário. ⚠ Falta rodar o Rich Results Test e o validator.schema.org com o site no ar |

## 7. Termos vetados

✓ A lista de `src/config/termos.ts` está intacta (18 termos), e 0 ocorrências no HTML, nos textos
e no JSON-LD.

## 8. Decisões do João (04/11/2026) e como ficaram

| Decisão | No site |
| --- | --- |
| Horário: segunda a sexta, em horário comercial estendido (frequentemente 9h–19h), com agenda personalizada | `horario.semana` confirmado: segunda a sexta, 9h–19h. A observação "A agenda é personalizada, com avaliação individual: confirme o seu horário pelo WhatsApp antes de vir." aparece junto do horário. Também entra no JSON-LD e no llms.txt. **A produção não está travada** |
| Os posts são todos da Ester: sem crédito de fotógrafo | Pendência encerrada (manifesto atualizado) |
| CNPJ e razão social ficam de fora | Saíram do rodapé e da política de privacidade, inclusive o selo de pendência. A política ganhou o contato pelo WhatsApp e a data de atualização |
| O vídeo de toxina fica: ela arrumou e pediu | Mantido como player mudo. O pôster continua no quadro sem a marca (só escolha de quadro, sem edição) |
| Sem domínio por enquanto: "giyma estetica avançada" | `SITE_URL` padrão `https://giyma-estetica-avancada.vercel.app`, com o projeto na Vercel chamado `giyma-estetica-avancada`. O noindex de cabeçalho vale só para as URLs de preview (`giyma-estetica-avancada-*.vercel.app`) |
| Tudo o que foi enviado está autorizado; antes e depois sem tempo, "depende de cada paciente"; pós-graduação em Farmácia Estética | O **tour volta inteiro** (32,3 s, com os capítulos Procedimento e Recepção). Os **2 depoimentos do WhatsApp** (post de 30/07/2025) entram em texto literal, como "Paciente da Giyma · WhatsApp", nunca o print |
| Indexação | `seo.indexar=true`: em produção, `index, follow`, `robots.txt` com `Allow: /` e sitemap (16 URLs). O preview continua noindex |

## 9. O que ainda falta

1. **Teste em aparelho real** (10 minutos), porque este ambiente só tem o Chromium:
   - **iPhone (Safari):**
     - abrir a home e deixar a entrada rodar;
     - trocar de fase na Linha do tempo;
     - abrir "Não sei o que fazer", responder e tocar em "Abrir no WhatsApp": a mensagem chega
       pronta;
     - abrir /como-chegar → "Mostrar o mapa interativo" → Aceitar;
     - tocar um vídeo;
     - arrastar o antes e depois em /resultados.
   - **Firefox (computador):** o mesmo percurso.
2. **Rich Results Test e validator.schema.org** com o site no ar.
3. **Antes e depois que ficaram fora** (f18–f22): voltam com o original sem moldura e o
   procedimento de cada um.
4. **Medição** (Plausible ou Umami): segue desligada até haver decisão.
5. **Domínio próprio:** quando for comprado, seguir `docs/DEPLOY.md`.
