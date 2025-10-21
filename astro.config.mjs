// @ts-check
import { defineConfig } from 'astro/config';
import qwikdev from '@qwikdev/astro';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://strudual.ldlework.com',
  base: '/',
  integrations: [qwikdev(), tailwind()],
  vite: {
    ssr: {
      noExternal: ['@codemirror/*', '@lezer/*', '@replit/codemirror-emacs']
    }
  },
  devToolbar: {
    enabled: false
  }
});
