import { defineConfig } from 'astro/config';
import { origin } from './src/config/site.ts';

export default defineConfig({
  site: origin,
  trailingSlash: 'ignore',
  compressHTML: true,
  build: {
    format: 'directory',

    inlineStylesheets: 'never',
    assets: 'a',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
