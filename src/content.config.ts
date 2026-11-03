import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { fase, resultado, tratamento } from './content/schemas.ts';

export const collections = {
  tratamentos: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/tratamentos' }),
    schema: tratamento,
  }),
  fases: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/fases' }),
    schema: fase,
  }),
  resultados: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/resultados' }),
    schema: resultado,
  }),
};
