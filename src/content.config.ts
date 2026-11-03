import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { fase, microtextos, pagina, resultado, tratamento } from './content/schemas.ts';

export const collections = {
  tratamentos: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/tratamentos' }),
    schema: tratamento,
  }),
  fases: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/fases' }),
    schema: fase,
  }),
  paginas: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/paginas' }),
    schema: pagina,
  }),
  microtextos: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/microtextos' }),
    schema: microtextos,
  }),
  resultados: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/resultados' }),
    schema: resultado,
  }),
};
