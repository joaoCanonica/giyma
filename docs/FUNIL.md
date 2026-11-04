# Funil: caminhos até o WhatsApp

Ação principal única: **Agendar avaliação** no WhatsApp **(49) 99827-3904**, com a mensagem
pronta do contexto. Sem formulário, sem backend. Todo link para o WhatsApp sai de
`linkWhatsApp()` (`src/lib/whatsapp.ts`): `https://wa.me/5549998273904?text=<mensagem codificada>`.
As mensagens vêm de `mensagens.*` (mesmo arquivo) e de `src/content/microtextos/microtextos.json`
(chaves `whatsapp.*`); os testes garantem que as duas fontes dão o mesmo texto.

**Sem JavaScript**, todos os links continuam funcionando: cada um já sai do build com a sua
mensagem; o assistente e o convite final de /cada-fase caem na mensagem geral.

## Mensagens exatas

| Contexto | Mensagem |
| --- | --- |
| Geral | Olá! Vim pelo site da Giyma e gostaria de agendar uma avaliação com a Dra. Ester. |
| Tratamento | Olá! Vim pelo site da Giyma e gostaria de agendar uma avaliação sobre **{tratamento}**. |
| Fase | Olá! Vim pelo site da Giyma. Tenho **{faixa}** anos e gostaria de entender o que faz sentido para a minha pele. |
| Dúvida | Olá! Vim pelo site da Giyma e tenho uma dúvida sobre **{tema}**. |
| Assistente | Olá! Vim pelo site da Giyma e gostaria de agendar uma avaliação. O que me incomoda hoje: **{incômodo}**. Tenho **{faixa}** anos. **{histórico}** |

- **{tratamento}**: toxina botulínica · preenchimento labial · contorno facial · sulcos e olheiras ·
  bioestimulador de colágeno · rejuvenescimento das mãos · microagulhamento · peeling.
  (Harmonização corporal não tem mensagem própria enquanto não for confirmada: o botão flutuante
  usa a geral e a página não é gerada em produção.)
- **{faixa}**: entre 20 e 29 · entre 30 e 39 · entre 40 e 49 · entre 50 e 59 · 60 ou mais.
- **{tema}**: a avaliação · como chegar à clínica · os resultados · um tratamento · os meus dados.
- **{incômodo}**: linhas de expressão · lábios · contorno do rosto · olheiras e sulcos · firmeza da
  pele · as mãos · textura e manchas da pele · ainda não sei dizer.
- **{histórico}**: "Nunca fiz procedimento estético." · "Já fiz procedimento estético antes."

A "Dra. Ester" da mensagem geral é texto que a paciente envia (não é publicidade na página); o
botão que a gera nunca mostra "Dra." sem o CRF.

## Caminhos (origem medida → mensagem)

| Página | Onde | `origem` | Mensagem |
| --- | --- | --- | --- |
| Início | Hero | `hero` | geral |
| Início | Avaliação | `home-avaliacao` | geral |
| Início | Linha do tempo (cada fase) | `linha-do-tempo` + `fase` | fase |
| Início | Agendar e visitar | `home-agendar` | geral |
| Início | Assistente "Não sei o que fazer" | `assistente-home` | assistente |
| Tratamento | Topo e fim da página | `tratamento-topo` / `tratamento-final` + `tratamento` | tratamento |
| Tratamento | Botão flutuante (mobile) | `flutuante` + `tratamento` | tratamento |
| Tratamentos | Índice | `tratamentos-indice` | geral |
| Cada fase | Abas (uma por fase) | `linha-do-tempo` + `fase` | fase |
| Cada fase | Convite final | `cada-fase` + `fase` | fase escolhida nas abas (sem JS: geral) |
| Perguntas frequentes | Fim | `faq` | dúvida: um tratamento |
| Perguntas frequentes | Assistente | `assistente-faq` | assistente |
| Resultados | Fim | `resultados` | dúvida: os resultados |
| Como chegar | Bloco do endereço | `como-chegar` | dúvida: como chegar à clínica |
| Ester Santos | Convite | `ester-convite` | geral |
| Todas | Botão flutuante (mobile) | `flutuante` | geral |
| Todas | Rodapé | `rodape` | geral |
| 404 | Caminhos | `erro-404` | geral |

Links sem `data-origem` próprio herdam a seção (`id` ou `aria-labelledby`).

## Mini assistente "Não sei o que fazer"

`src/components/cta/Assistente.astro`, dentro de um `<details>` (opcional, fechado por padrão), na
seção "Agendar e visitar" do início e no fim das perguntas frequentes.

- Três perguntas em rádios nativos (`fieldset` + `legend`): o que te incomoda hoje? · faixa de
  idade · já fez algum procedimento estético?
- A cada resposta o `href` do botão é remontado. Se faltar resposta, o clique não abre o WhatsApp:
  um aviso (`role="status"`) pede as três e o foco vai para a pergunta que falta.
- **Nada é guardado**: sem armazenamento, sem envio ao site; o texto só existe no link.
- Peso medido: 3,8 KB (HTML + CSS + JS), 1,5 KB com gzip.

## Medição sem invadir

**Proposta: Plausible**, carregado **só depois de "Aceitar"**.

- Por quê: não usa cookie, não cria perfil, não guarda IP, mostra números agregados; o site
  precisa de três contagens, não de remarketing. Script de ~1 KB.
- Por que não GA4: usa cookies e identificadores, manda dados ao Google, pede consentimento de
  qualquer forma e pesa mais. Não compensa para três eventos.
- Por que pedir consentimento mesmo sem cookie: o navegador da visitante fala com um servidor de
  outra empresa (o IP chega lá). Regra do projeto: nenhum request de terceiro antes da escolha.
- Umami (auto-hospedado) é a alternativa se a clínica preferir não depender de serviço externo;
  troca só a URL do script.

Eventos (`src/lib/medicao.ts`, por delegação de clique; nada pessoal):

| Evento | Quando | Propriedades |
| --- | --- | --- |
| `clique_whatsapp` | link `wa.me` | `origem`, `pagina`, `tratamento`?, `fase`? |
| `clique_como_chegar` | Google Maps, Waze, Apple Mapas | `origem`, `pagina` |
| `clique_instagram` | instagram.com | `origem`, `pagina` |

Configuração no build: `PLAUSIBLE_DOMINIO` (ex.: `giyma.com.br`) e, opcional, `PLAUSIBLE_SCRIPT`
(padrão `https://plausible.io/js/script.js`). Sem `PLAUSIBLE_DOMINIO` a medição fica desligada.

## Consentimento (LGPD)

`src/components/consentimento/` (aviso + `consentimento.ts`), presente em todas as páginas.

- **Aceitar** e **Recusar** idênticos (mesmo estilo, mesmo tamanho; o e2e compara).
- Abre sozinho na primeira visita **só quando a medição está configurada**. Sem medição, só abre
  quando a visitante pede o mapa interativo ou clica em **"Preferências de privacidade"** no rodapé
  (onde a escolha pode ser mudada a qualquer momento).
- A escolha fica no `localStorage` do navegador (`giyma-consentimento`), sem cookie.
- Depois de aceitar: medição (se configurada) e o mapa interativo do Google em /como-chegar
  (que ainda exige o clique em "Mostrar o mapa interativo"). Recusar: nada de terceiro carrega.
- Enquanto o aviso está aberto, o botão flutuante some (não disputa o canto da tela).

## Testes

- `pnpm test`: mensagens exatas, todas as 80 combinações do assistente (o modelo do componente dá
  o mesmo link que `mensagens.assistente`), nenhum termo vetado, classificação dos eventos.
- `PLAUSIBLE_DOMINIO=giyma-e2e.test pnpm build && pnpm test:e2e` (Playwright, 390 px): link exato
  em 5 cenários (hero, tratamento, fase, assistente, FAQ), convite de /cada-fase seguindo a aba,
  nenhum request de terceiro antes do consentimento, Aceitar = Recusar em peso, eventos depois de
  aceitar, Recusar sem nada externo, e sem JS (mensagem geral).
