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

## Entrada e hero (sessão 4)

- **Botão "Conheça a Dra. Ester"** saiu como **"Conheça a Ester Santos"**: "Dra." sem o CRF-SC 3984 no mesmo bloco viola a seção 8 (o audit-compliance reprova). Se o João quiser o "Dra." no botão, a alternativa é o botão levar o CRF junto (ex.: "Conheça a Dra. Ester · CRF-SC 3984").
- **Retrato do hero:** o arquivo disponível tem 852 px de largura no recorte 3:4. No desktop em tela 2x ele aparece um pouco mole (precisaria de ~1320 px). Também tem o filtro escuro/rosado do post: dá para corrigir exposição e balanço de branco globais (permitido), mas o certo é o original do ensaio.
- **Hero B (letras):** o vídeo em tela cheia tende a virar o LCP (o Chrome conta o primeiro quadro), mesmo entrando em fade: das medições, uma deu o texto (0,90 s) e outra o vídeo (1,51 s). Isso fere "vídeo nunca é o LCP". No desktop, a versão 16:9 tem só 720 px (fica borrada em tela cheia). Se o João preferir o B, precisamos do vídeo original em alta e repensar o enquadramento (vídeo em bloco, não tela cheia).
- **Copy do hero** (H1 e linha de apoio): provisória, a sessão 5 refina.

## Textos (sessão 5)

Lista completa e atualizada: `node scripts/validate-config.mjs --textos` (30 itens hoje). Os principais:

- **Texto "Farmacêutico esteta" da Ester** (formulações, bioquímica, farmácia clínica, cosmetologia): não está no repositório. A seção "Por que uma farmacêutica" está com redação provisória baseada só em fatos confirmados.
- **Redação a validar com a Ester** (não é fala literal dela; marcada `origem: "redacao-a-validar"`): "Vou ficar artificial?", "É um caminho sem volta?", "Creme ou bioestimulador nas mãos?", "O que é a avaliação personalizada?", "Quem pode aplicar? Farmacêutico pode?", "Como chegar e onde estacionar?", e a explicação das âncoras em /cada-fase. Os "3 mitos do preenchimento" só têm um transcrito (lábios); os outros dois vieram da lista de temas da investigação.
- **Resposta "Farmacêutico pode?"**: cita as Resoluções CFF 616/2015, 645/2017 e 669/2018 (mantida pelo TRF1 em out/2025). Só publicar depois de confirmar a pós-graduação e a averbação da Ester.
- **"Secagem de vasinhos"**: aparece no vídeo do inverno (DYnNCJ3P80V) como procedimento. Não está na lista confirmada: confirmar se ela faz.
- **Fios de PDO**: citados no vídeo das fases (40+). Confirmar se ela faz.
- **Carrossel "o que está incluso em cada atendimento"** (post de 21/10/2026): não transcrito; completaria "Como é a sua avaliação".
- **Duração das sessões**: não informada (campo vazio em todos os tratamentos). A duração do efeito da toxina (3 a 6 meses, em média) vem da fala dela no vídeo DP9tLKNEeOG.
- **Avaliação**: se tem custo e como funciona o agendamento (o site não fala de preço; a clínica informa no WhatsApp).
- **Privacidade**: razão social, CNPJ, e-mail do encarregado de dados e data da política.
- **"Dra." nos textos**: o fecho pedido "Na avaliação, a Dra. Ester explica…" saiu como "Na avaliação, a Ester explica o que faz sentido para você." (seção 8: "Dra." só junto do CRF). Onde aparece "Dra. Ester Santos", vem sempre com "(farmacêutica esteta, CRF-SC 3984)" na mesma frase, e o validate-config agora trava o contrário.

## Home (sessão 6A)

- **Índice de tratamentos:** o versalete mostra as áreas (ex.: "Linhas da testa · glabela · pés de galinha"), não o nome popular: o único nome popular é "botox", marca comercial (seção 8: só na FAQ).
- **Imagens por tratamento:** não há fotos próprias de cada tratamento (antes e depois sem autorização). A imagem que acende ao lado usa stills reais do espaço; trocar quando houver fotos por tratamento.
- **Resultados com pares autorizados:** quando o primeiro par for autorizado, o `<Comparador>` da seção 8 precisa ler as imagens de `indice.resultados` (hoje ele lê `indice.imagens`). O caminho não roda enquanto nenhum par está autorizado.
- **"Avaliar a Giyma no Google":** aponta para a ficha; falta o link direto de avaliação.

## Tratamentos (sessão 6B)

- **Harmonização corporal:** página só no preview (selo PROVISÓRIO). Em produção, não é gerada até a clínica confirmar os procedimentos.
- **Antes e depois por tratamento:** o template já mostra o par quando ele for autorizado (lê `indice.resultados`). Hoje nenhum aparece.
- **"Em que fase costuma fazer sentido"** aponta para `/cada-fase?fase=…`, página da sessão 6C.
- **Vídeo do inverno** (DYnNCJ3P80V) ligado a microagulhamento, peeling e bioestimulador, porque é a fala da Ester sobre esses tratamentos.

## Páginas de confiança (sessão 6C)

- **/dra-ester-santos em produção:** enquanto a pós-graduação for bloqueante, a página vira redirecionamento (noindex) para o início e os links para ela somem (hero, seção da Ester, rodapé). Quando a pós chegar, tudo volta sozinho.
- **FAQ:** o grupo pedido como "Sobre a Dra. Ester" saiu como "Sobre a profissional" (seção 8). Respostas de redação aparecem com selo PROVISÓRIO no preview até a Ester validar.
- **/como-chegar:** o mapa estático real (tiles) segue pendente (rede bloqueada); a página usa a fachada. O mapa interativo do Google só carrega depois do clique. Estacionamento: em preview mostra "Pergunte à equipe no WhatsApp" com selo; em produção, o bloco some até o dado chegar.
- **Páginas internas** (/_estilo, /_hero-a, /_hero-b) não são geradas em produção.

## Funil e LGPD (sessão 7)

- **Medição:** proposta Plausible (sem cookie), carregada só depois de "Aceitar". Falta o João decidir (Plausible pago, Umami auto-hospedado ou nenhuma) e informar o domínio final: `PLAUSIBLE_DOMINIO` no build. Sem ele, a medição fica desligada e o aviso de privacidade só abre pelo rodapé ou pelo mapa. Ver docs/FUNIL.md.
- **Política de privacidade:** o texto agora cita a medição anônima e o mapa sob consentimento; seguem pendentes razão social, CNPJ, encarregado de dados e data (já listados acima). Conferência jurídica na sessão 9.
- **Mensagem geral do WhatsApp** diz "com a Dra. Ester" (texto que a paciente envia, não aparece na página). Confirmar com a clínica se preferem "com a Dra. Ester Santos" ou só "uma avaliação".
