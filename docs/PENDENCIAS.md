# Pendências

Campos e decisões que dependem do cliente ou do João. Nada aqui é inventado no site: enquanto estiver pendente, aparece como campo pendente (preview) ou trava a produção (CLAUDE.md, seção 9).

## Arquivos (sessão 0)

- Todos os arquivos esperados estavam no repositório e foram movidos para `docs/` (nenhum faltou).
- O CLAUDE.md (seção 2) cita os documentos pelo nome antigo, na raiz. Eles agora estão em `docs/` e `docs/dados/avaliacoes-google.json`. O bloco foi mantido sem alteração, como pedido; ajustar o texto só com ordem do João.

## Dados do cliente (ver docs/GIYMA_PACOTE_PROMPTS_CODE.md, seção A)

- **Horário de atendimento** — bloqueia produção.
- Pós-graduação em estética.
- Procedimentos corporais.
- CNPJ, responsável técnico, domínio.
- Origem do nome "Giyma" (hipótese Gi + Ma) — só entra se a Ester confirmar.
- Crédito do fotógrafo do retrato (SaveClip…627373272…).

## Mídia (sessão 1; detalhes em docs/MIDIA_CATALOGO.md)

- Originais do ensaio com crédito do fotógrafo (o retrato atual só rende 16:9 de 1184 px, acima da assinatura).
- Antes e depois: os 9 pares estão com consentimento **pendente**; nenhum vai para o site. Faltam também procedimento e tempo decorrido. Os pares 18–22 têm marca d'água GIYMA sobre o rosto: só os originais resolvem.
- Tour: paciente aparece na consulta (de costas) e no procedimento. Conferir o direito de imagem (sessão 9).
- Still "Ester com produto" (25,8 s): a embalagem tem marca visível; confirmar que não é marca de medicamento.
- Tour sem legenda e sem música; vídeo das letras douradas em resolução maior.
- Logo original do designer.
- Artes com pontos de atenção no texto (não reproduzir literal): "Dra." sem CRF e "expert" (07), telefone com dígito faltando (29), "o melhor" (37), "valores dos procedimentos" = preço (41), "Botox" como chamada (36).

## Config e conteúdo (sessão 2)

`pnpm validate-config` lista tudo com o estado atual (17 pendências na config, 2 bloqueantes). Resumo:

- **Horário** (`horario.semana`): bloqueante. Único motivo que hoje trava a produção. O site mostra "Horário pelo WhatsApp" com selo PROVISÓRIO. O motor (`src/lib/horario.ts`) já está pronto e testado: basta trocar por `confirmado({ seg: [...], ... }, fonte)`.
- **Pós-graduação em estética** (`profissional.posEstetica`): bloqueante só para a página `/dra-ester-santos` (fica fora da produção até chegar). Conferir também a **averbação** no CRF-SC.
- **Fases 50 e 60+:** o vídeo DbBfgMjRUkX trata "Aos 40 ou +" junto. As fases 50 e 60+ usam o mesmo trecho (29–43 s) e os mesmos focos do 40, mais os conteúdos de mãos e bioestimulador para "40, 50 ou 60 anos". Confirmar com a Ester se há diferença real entre 40, 50 e 60+.
- **Fios de PDO:** citados no vídeo (40+, "combinado com fios de PDO") e sem tratamento cadastrado. Confirmar se ela faz; se fizer, vira registro em `src/content/tratamentos/`.
- **Valores:** frase só de "Segurança e cuidado" (arte de 21/10/2026). Faltam as de Naturalidade, Ética e Acolhimento (sessão 5). Sem still limpo para Segurança (procedimento mostra paciente) e para Naturalidade (quadro "face body dreams", tour 16,6–17,7 s, ainda não extraído).
- **Resultados:** os 9 pares em `src/content/resultados/` estão `pendente`. Para publicar cada um: autorização escrita, procedimento, tempo decorrido e legenda; o consentimento precisa ser trocado no manifesto **e** na coleção (a trava acusa divergência).
- **Textos dos tratamentos e das fases** (`paraQuem`, `oQueE`, `comoEFeito`, `cuidados`, `resultadosEsperados`, `oQueMuda`, `frase`): `null`/vazio até a sessão 5. Duração da sessão de cada procedimento: não informada.
- **Origem do nome Giyma** (Gi + Ma): opcional e vazia; não publicar sem a confirmação da Ester.
- **"botox" na FAQ:** a única exceção do CLAUDE.md. A auditoria só aceita a palavra dentro de um elemento com `data-nome-popular` (a lista de termos não foi alterada).

## Design system (sessão 3)

- **Mapa estático:** o OpenStreetMap estava bloqueado na rede da sessão. O componente `<MapaEstatico>` usa hoje a fachada real, o endereço, o plus code e as rotas (Google, Waze, Apple) e aceita a imagem do mapa (`mapa="id"`) quando ela puder ser gerada no build com atribuição "© OpenStreetMap". Liberar `tile.openstreetmap.org` na rede ou mandar uma imagem de mapa autorizada.
- **MDN:** `developer.mozilla.org` está fora da rede da sessão; a pesquisa foi feita no repositório do MDN no GitHub (mdn/content).
- **Logo:** o monograma ganhou uma versão "pequena" (traço 18 em vez de 11, mesmo desenho) para ≤ 48 px e para os ícones. Validar com a clínica junto com o arquivo original do designer.
- **Paleta calibrada nos stills:** petróleo #1F2E44 (parede medida #242B3F), ouro velho #B8925C (sombra das letras #AA7F4A), cacau #231A16. Conferir com o João na primeira rodada de capturas.
