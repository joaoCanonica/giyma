// @ts-check
import { defineConfig } from 'astro/config';

// Site estático. SITE_URL vem do ambiente (domínio ainda pendente).
export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  compressHTML: true,
  devToolbar: { enabled: false },
  // public/ é a pasta pública; os derivados de mídia caem em public/media (fora do git)
});
