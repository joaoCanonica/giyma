# SEO e GEO: Google e IAs

O objetivo é ser **legível e citável**: o Google entende quem é a Giyma, onde fica e o que faz,
e uma IA consegue responder "quem faz rejuvenescimento de mãos em Lages?" citando o site. Parte do
trabalho é do site (já feito, abaixo). A outra parte é fora do site e depende do João (checklist
no fim do documento).

## 1. Pesquisa (fontes)

Esta sessão não conseguiu abrir schema.org, developers.google.com nem llmstxt.org diretamente (a
rede bloqueia esses domínios). Por isso:

- o vocabulário foi conferido no **arquivo oficial do schema.org 30.1**, baixado do repositório
  do projeto (`github.com/schemaorg/schemaorg`, `data/releases/30.1`) e guardado de forma
  compacta em `scripts/lib/schemaorg-vocab.json`;
- as regras do Google e do llms.txt foram conferidas por busca, nas páginas citadas abaixo.

| Tema | O que diz | Fonte |
| --- | --- | --- |
| `MedicalBusiness` | "A particular physical or virtual business of an organization for medical purposes. Examples of MedicalBusiness include different businesses run by health professionals." Subtipo de `LocalBusiness`. Os subtipos dele incluem `Pharmacy`, `Physician` e `MedicalClinic`. | schema.org 30.1 (arquivo oficial) · [schema.org/MedicalBusiness](https://schema.org/MedicalBusiness) |
| `HealthAndBeautyBusiness` | "Health and beauty." Subtipo de `LocalBusiness`. Subtipos: `BeautySalon`, `DaySpa`, `HairSalon`, `NailSalon`, `HealthClub`, `TattooParlor`. | schema.org 30.1 · [schema.org/HealthAndBeautyBusiness](https://schema.org/HealthAndBeautyBusiness) |
| `BeautySalon` | "Beauty salon." É salão de beleza: não descreve uma clínica de procedimentos injetáveis. | schema.org 30.1 · [schema.org/BeautySalon](https://schema.org/BeautySalon) |
| `Physician` (NÃO) | "An individual physician or a physician's office considered as a MedicalOrganization." Desde a versão 24 tem os subtipos `IndividualPhysician` e `PhysiciansOffice`. Diz "médico": proibido aqui. | schema.org 30.1 · [schema.org/Physician](https://schema.org/Physician) · [Schema App, v24](https://www.schemaapp.com/schema-app-news/schema-org-v24-0-release-changes-to-physician-schema-markup/) |
| `MedicalClinic` (NÃO) | "A facility, often associated with a hospital or medical school, that is devoted to the specific diagnosis and/or healthcare." Sugere clínica médica: proibido aqui. | schema.org 30.1 |
| `Person` | `jobTitle`, `identifier`, `hasCredential` (EducationalOccupationalCredential), `alumniOf` (EducationalOrganization), `knowsAbout` ("suggesting possible expertise but not implying it"), `worksFor`. | schema.org 30.1 · [schema.org/Person](https://schema.org/Person) |
| `Service` | `provider` (Person ou Organization), `areaServed`, `serviceType`. | schema.org 30.1 · [schema.org/Service](https://schema.org/Service) |
| `FAQPage` | "A WebPage presenting one or more Frequently asked questions." | schema.org 30.1 · [schema.org/FAQPage](https://schema.org/FAQPage) |
| Negócio local (Google) | `name` e `address` são obrigatórios; `geo`, `telephone`, `url` e `openingHoursSpecification` são recomendados. | [Google Search Central, LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business) |
| Avaliações autosservidas | Desde 2019 o Google não mostra estrelas quando a própria empresa (`LocalBusiness`, `Organization` e subtipos) marca avaliações sobre si no próprio site. | [Google Search Central Blog, set/2019](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful) |
| FAQ (Google) | Desde agosto de 2023 o resultado enriquecido de FAQ só aparece para sites de governo e de saúde "well-known, authoritative". A marcação continua válida e útil para a leitura (Google e IAs), mas **não há promessa de "FAQ no Google"**. As perguntas marcadas precisam estar visíveis na página. | [Google Search Central, FAQPage](https://developers.google.com/search/docs/appearance/structured-data/faqpage) · [Blog, ago/2023](https://developers.google.com/search/blog/2023/08/howto-faq-changes) |
| llms.txt | Proposta (não é padrão ratificado): arquivo em Markdown na raiz, com H1 (nome), resumo em blockquote, texto livre e seções H2 com listas de links. | [llmstxt.org](https://llmstxt.org/) · [resumo, llmrefs](https://llmrefs.com/blog/what-is-llms-txt-file) |

## 2. Decisões

- **Tipo do negócio:** `["HealthAndBeautyBusiness", "MedicalBusiness"]`.
  - `HealthAndBeautyBusiness` diz "estética".
  - `MedicalBusiness` diz "negócio de saúde de um profissional de saúde". Pela definição oficial
    cobre farmacêutico, e o tipo não é `MedicalOrganization`, então não sugere médico.
  - `BeautySalon` descreve salão de beleza e foi descartado.
  - `Physician`, `IndividualPhysician`, `PhysiciansOffice` e `MedicalClinic` ficam **travados no
    audit-seo**.
- **Sem `AggregateRating` e sem `Review`:** o Google trata como autosservida, e a seção 8 do
  CLAUDE.md também barra. Também ficam travados no audit-seo.
- **Ester:**
  - `Person` com `jobTitle` "Farmacêutica esteta".
  - `identifier` CRF-SC 3984, mais `hasCredential` reconhecida pelo CRF-SC.
  - `alumniOf` UFSC.
  - `knowsAbout` com os tratamentos e "beleza natural" / "planejamento estético por etapas".
  - `worksFor` aponta para a Giyma.
  - O campo `name` é "Ester Santos": sem "Dra." isolado, nem no JSON-LD.
- **Uma pergunta, uma marcação:** a pergunta que aparece em /perguntas-frequentes e também numa
  página de tratamento é marcada só na FAQ geral. Hoje são 3 nesse caso.
- **Horário:** `openingHoursSpecification` só entra quando `horario.semana` estiver confirmado. Hoje
  está bloqueante, então não entra.

## 3. O que o site faz (sessão 8)

| Item | Onde |
| --- | --- |
| JSON-LD em `@graph`: negócio + Ester + site em todas as páginas; Service e FAQPage nos tratamentos; FAQPage em /perguntas-frequentes; BreadcrumbList em toda página interna | `src/components/seo/jsonld.ts`, `Seo.astro` |
| Catálogo (`hasOfferCatalog`) só com tratamentos `confirmado` | `src/components/seo/dados.ts` |
| title, description, robots, canonical absoluto, Open Graph, `twitter:card` e `lang="pt-BR"` | `Seo.astro` + `Documento.astro` |
| Imagem de compartilhamento 1200×630 gerada no build: retrato, logo em ouro e "LAGES/SC" em Josefin Sans | `scripts/gerar-og.mjs` → `/media/og/giyma-og.jpg` |
| NAP saindo de uma única função (`nap()` em `src/config/seo.ts`) para rodapé, JSON-LD e llms.txt | `Rodape.astro` (`data-nap`) |
| Parágrafo-resposta (quem, o quê, onde) no topo de cada página | campo `resposta` em `src/content/paginas/*.json`; nos tratamentos, o campo `resposta` |
| Títulos em pergunta nos tratamentos ("O que é?", "Como é feito?", "Quais são os cuidados?"…) e em /como-chegar | `Tratamento.astro`, `como-chegar.json` |
| robots.txt, sitemap.xml e llms.txt gerados da config | `src/pages/robots.txt.ts`, `sitemap.xml.ts`, `llms.txt.ts` |

Os termos que queremos associar entram no texto de forma natural: beleza natural, cada fase da
vida, rejuvenescimento de mãos, planejamento por etapas e farmacêutica esteta em Lages.

**Indexação:** `seo.indexar` continua `false`. Com isso:

- todas as páginas saem com `noindex, nofollow`;
- o robots.txt sai com `Disallow: /`;
- o sitemap é gerado, mas não é anunciado.

Quando `indexar` virar `true` em produção (sessão 9, junto com o domínio em `SITE_URL`), o
robots.txt passa a `Allow: /` e aponta o sitemap. Isso foi testado com uma simulação:
16 páginas públicas = 16 URLs no sitemap, e Lighthouse SEO 100.

## 4. Verificação

- `pnpm audit-seo` (depois do build, com o mesmo `SITE_URL` e `GIYMA_MODO`) falha se:
  - um tipo ou uma propriedade não existir no schema.org 30.1, ou não valer para o tipo;
  - faltar algo que o Google exige;
  - aparecer Physician, MedicalClinic, avaliação ou termo vetado no JSON-LD, ou "Dra. Ester" sem
    o CRF;
  - uma pergunta marcada não estiver visível na página;
  - faltar o parágrafo-resposta no topo;
  - o canonical, o Open Graph ou a trilha estiverem errados;
  - o **NAP divergir** entre as páginas, o JSON-LD, o llms.txt e a config;
  - o robots.txt e o sitemap não baterem com `indexar`.
- `node scripts/test-seo.mjs` prova que cada uma dessas travas dispara (19 casos).
- **Rich Results Test e validator.schema.org:** não abrem a partir deste ambiente. Os dois devem
  ser rodados com o site no ar: colar a URL e salvar as capturas em
  `docs/capturas/<data>-seo/`. A validação local cobre o vocabulário e as exigências do Google,
  mas não substitui o teste oficial.

## 5. Checklist para o João (fora do site)

### Google Perfil da Empresa (fazer já)

- [ ] **Nome igual ao do site:** "Giyma Saúde e Estética Avançada". Hoje a ficha diz "Giyma | Saúde e
      Estética Avançada"; trocar o "|" ou aceitar a diferença conscientemente.
- [ ] **Categoria principal:** "Clínica de estética". Secundárias: as que o Google oferecer próximas,
      como "Centro de estética" e "Serviço de harmonização facial". Nunca uma categoria de médico.
- [ ] **Horário** completo, incluindo feriados. Ele também destrava a produção do site.
- [ ] **Site:** o domínio final.
- [ ] **Descrição:** usar o texto abaixo, ou adaptar sem preço e sem promessa.

      > Clínica de estética da Dra. Ester Santos, farmacêutica esteta (CRF-SC 3984), no Centro de
      > Lages/SC. Harmonização facial com beleza natural em cada fase da vida: toxina botulínica,
      > preenchimento com ácido hialurônico, bioestimulador de colágeno e rejuvenescimento de mãos,
      > sempre com avaliação individual e planejamento.

- [ ] **Serviços:** os mesmos 8 do site, com os mesmos nomes. Toxina botulínica, preenchimento
      labial, contorno facial, sulcos e olheiras, bioestimulador de colágeno, rejuvenescimento das
      mãos, microagulhamento e peeling.
- [ ] **20+ fotos reais:**
  - fachada com a faixa;
  - recepção (parede petróleo);
  - sala;
  - a Ester trabalhando;
  - o logo.

  Nada de banco de imagem nem antes e depois sem autorização.
- [ ] **Link de agendamento:** `https://wa.me/5549998273904`.
- [ ] **Atributos e perguntas e respostas:** responder às perguntas da ficha com o mesmo texto do site.

### Avaliações

- [ ] Pedir avaliação a **toda** paciente atendida:
  - QR code na recepção;
  - link enviado no WhatsApp depois do retorno.
- [ ] **Sem incentivo** de nenhum tipo: brinde, desconto e sorteio são proibidos pelo Google e
      pela seção 8.
- [ ] Responder a todas, sem dado de saúde na resposta.
- [ ] Meta: 30 em 90 dias. Com volume, a nota aparece sozinha na ficha. O site continua sem nota
      e sem estrelas.

### NAP idêntico em todo lugar

Copiar exatamente:

> **Giyma Saúde e Estética Avançada** · Rua Rui Barbosa, 277, Centro, Lages/SC, CEP 88501-170 ·
> (49) 99827-3904

- [ ] Instagram (@dra_estersantos): endereço e link do site na bio.
- [ ] WhatsApp Business: nome, endereço, horário, site e catálogo com os 8 tratamentos.
- [ ] Apple Business Connect (Apple Mapas).
- [ ] Bing Places (dá para importar do Google).
- [ ] Facebook, se existir página.

### Teste mensal (sem login, em aba anônima, celular e computador)

Anotar a posição no mapa e nos resultados, e se a IA do Google cita a Giyma:

- [ ] "harmonização facial em Lages"
- [ ] "preenchimento labial Lages"
- [ ] "bioestimulador de colágeno Lages"
- [ ] "rejuvenescimento de mãos Lages"
- [ ] "farmacêutica esteta Lages"

Opcional: fazer as mesmas perguntas ao ChatGPT, ao Perplexity e ao Gemini ("quem faz
rejuvenescimento de mãos em Lages?") e anotar se citam a Giyma e com qual texto.
