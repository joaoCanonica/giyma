#!/usr/bin/env node
// Travas simuladas do audit-seo: prova que cada regra dispara (e que o grafo real passa).
import assert from 'node:assert/strict';
import { auditarPaginaSeo, validarJsonLd } from './lib/seo.mjs';

let ok = 0;
const falhas = [];
function caso(nome, fn) {
  try {
    fn();
    ok++;
    console.log(`  ✓ ${nome}`);
  } catch (e) {
    falhas.push(nome);
    console.log(`  ✗ ${nome}\n    ${e.message.split('\n').join('\n    ')}`);
  }
}
const regras = (dado) => validarJsonLd(dado).map((p) => p.regra);
const BASE = 'https://giyma.com.br';
const negocio = {
  '@type': ['HealthAndBeautyBusiness', 'MedicalBusiness'],
  '@id': `${BASE}/#giyma`,
  name: 'Giyma Saúde e Estética Avançada',
  url: `${BASE}/`,
  telephone: '+55 49 99827-3904',
  geo: { '@type': 'GeoCoordinates', latitude: -27.8, longitude: -50.3 },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Rui Barbosa, 277',
    addressLocality: 'Lages',
    addressRegion: 'SC',
    postalCode: '88501-170',
    addressCountry: 'BR',
  },
};
const grafo = (...nos) => ({ '@context': 'https://schema.org', '@graph': [negocio, ...nos] });

console.log('JSON-LD');
caso('negócio válido passa', () => assert.deepEqual(regras(grafo()), []));
caso('Physician é proibido', () =>
  assert.ok(regras(grafo({ '@type': 'Physician', name: 'x' })).includes('jsonld-tipo-proibido')),
);
caso('MedicalClinic é proibido', () =>
  assert.ok(
    regras({
      '@context': 'https://schema.org',
      '@graph': [{ ...negocio, '@type': 'MedicalClinic' }],
    }).includes('jsonld-tipo-proibido'),
  ),
);
caso('aggregateRating é proibido', () =>
  assert.ok(
    regras({
      '@context': 'https://schema.org',
      '@graph': [{ ...negocio, aggregateRating: { '@type': 'AggregateRating', ratingValue: 5 } }],
    }).includes('jsonld-avaliacao'),
  ),
);
caso('tipo inexistente trava', () =>
  assert.ok(
    regras(grafo({ '@type': 'ClinicaDeEstetica', name: 'x' })).includes('jsonld-tipo-inexistente'),
  ),
);
caso('propriedade inexistente trava', () =>
  assert.ok(
    regras(grafo({ '@type': 'Person', name: 'x', crf: '3984' })).includes(
      'jsonld-propriedade-inexistente',
    ),
  ),
);
caso('propriedade fora do tipo trava (alumniOf num Service)', () =>
  assert.ok(
    regras(grafo({ '@type': 'Service', name: 'x', alumniOf: 'UFSC' })).includes(
      'jsonld-propriedade-fora-do-tipo',
    ),
  ),
);
caso('negócio sem endereço trava (Google)', () => {
  const { address, ...sem } = negocio;
  void address;
  assert.ok(
    regras({ '@context': 'https://schema.org', '@graph': [sem] }).includes('google-negocio'),
  );
});
caso('FAQ sem resposta trava', () =>
  assert.ok(
    regras(
      grafo({ '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'x?' }] }),
    ).includes('google-faq'),
  ),
);
caso('"Dra. Ester" sem CRF no JSON-LD trava', () =>
  assert.ok(regras(grafo({ '@type': 'Person', name: 'Dra. Ester Santos' })).includes('jsonld-crf')),
);
caso('termo vetado no JSON-LD trava (fora da FAQ)', () =>
  assert.ok(
    regras(grafo({ '@type': 'Service', name: 'Botox em Lages' })).includes('jsonld-termo-vetado'),
  ),
);
caso('"botox" como nome popular dentro da FAQPage passa', () =>
  assert.ok(
    !regras(
      grafo({
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'O que é?',
            acceptedAnswer: { '@type': 'Answer', text: 'É o que chamam de botox.' },
          },
        ],
      }),
    ).includes('jsonld-termo-vetado'),
  ),
);

console.log('Página e NAP');
const NAP = {
  nome: 'Giyma Saúde e Estética Avançada',
  endereco: 'Rua Rui Barbosa, 277, Centro, Lages/SC, CEP 88501-170',
  telefone: '(49) 99827-3904',
  bairro: 'Centro',
};
const pagina = ({
  nap = NAP,
  jsonld = grafo(),
  canonical = `${BASE}/`,
  extra = '',
} = {}) => `<!doctype html><html lang="pt-BR"><head>
<title>Giyma Saúde e Estética Avançada · Lages/SC</title>
<meta name="description" content="Clínica de estética no Centro de Lages com avaliação individual e planejamento por etapas.">
<meta name="robots" content="noindex, nofollow"><link rel="canonical" href="${canonical}">
<meta property="og:locale" content="pt_BR"><meta property="og:title" content="Giyma Saúde e Estética Avançada · Lages/SC">
<meta property="og:description" content="Clínica de estética no Centro de Lages com avaliação individual e planejamento por etapas.">
<meta property="og:url" content="${BASE}/"><meta property="og:image" content="${BASE}/media/og/giyma-og.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="x">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script></head>
<body><main><section><p data-resposta>Resposta.</p></section></main>${extra}
<footer><span data-nap="nome">${nap.nome}</span><span data-nap="endereco">${nap.endereco}</span><span data-nap="telefone">${nap.telefone}</span></footer></body></html>`;
const ctx = {
  caminho: '/',
  base: BASE,
  robotsEsperado: 'noindex, nofollow',
  nap: NAP,
  existe: () => true,
};
const rp = (html, c = ctx) => auditarPaginaSeo(html, c).problemas.map((p) => p.regra);
caso('página completa passa', () => assert.deepEqual(rp(pagina()), []));
caso('NAP divergente no rodapé trava', () =>
  assert.ok(rp(pagina({ nap: { ...NAP, telefone: '(49) 9982-73904' } })).includes('nap')),
);
caso('NAP divergente no JSON-LD trava', () =>
  assert.ok(
    rp(
      pagina({
        jsonld: {
          '@context': 'https://schema.org',
          '@graph': [{ ...negocio, telephone: '+55 49 3222-0000' }],
        },
      }),
    ).includes('nap'),
  ),
);
caso('canonical errado trava', () =>
  assert.ok(rp(pagina({ canonical: `${BASE}/index.html` })).includes('canonical')),
);
caso('robots indexando sem ordem trava', () =>
  assert.ok(rp(pagina(), { ...ctx, robotsEsperado: 'index, follow' }).includes('robots')),
);
caso('pergunta marcada e não visível trava', () =>
  assert.ok(
    rp(
      pagina({
        jsonld: grafo({
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Pergunta escondida?',
              acceptedAnswer: { '@type': 'Answer', text: 'x' },
            },
          ],
        }),
      }),
    ).includes('faq-visivel'),
  ),
);
caso('sem parágrafo-resposta trava', () =>
  assert.ok(rp(pagina().replace(' data-resposta', '')).includes('resposta')),
);

console.log(`\n${ok} ok · ${falhas.length} falha(s)`);
process.exit(falhas.length ? 1 : 0);
