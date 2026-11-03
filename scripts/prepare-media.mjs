#!/usr/bin/env node
import { pendente } from './lib/pendente.mjs';

pendente(
  'media:prepare',
  'sessão 1 · Mídia',
  'gerar AVIF/WebP, LQIP, pôsteres e vídeos em public/media a partir do media.manifest.json.',
);
