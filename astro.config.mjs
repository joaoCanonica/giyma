// @ts-check
import { defineConfig } from 'astro/config';

// Site estático. URL: SITE_URL; senão, a URL de produção do projeto na Vercel.
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export default defineConfig({
  site:
    process.env.SITE_URL ??
    (vercel ? `https://${vercel}` : 'https://giyma-estetica-avancada.vercel.app'),
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  compressHTML: true,
  devToolbar: { enabled: false },
  // public/ é a pasta pública; os derivados de mídia caem em public/media (fora do git)
});
