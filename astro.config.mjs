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
    optimizeDeps: {
      include: [
        '@codemirror/view',
        '@codemirror/state',
        '@codemirror/commands',
        '@codemirror/language',
        '@codemirror/autocomplete',
        '@lezer/highlight'
      ]
    },
    ssr: {
      noExternal: ['@codemirror/*', '@lezer/*', '@replit/codemirror-emacs']
    }
  }
});
