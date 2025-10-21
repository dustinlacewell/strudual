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
    },
    build: {
      modulePreload: {
        polyfill: true
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: false,
          manualChunks: (id) => {
            // Keep all CodeMirror and Lezer packages together
            if (id.includes('@codemirror/') || id.includes('@lezer/')) {
              return 'vendor-codemirror';
            }
            // Keep Qwik together
            if (id.includes('@builder.io/qwik')) {
              return 'vendor-qwik';
            }
          }
        }
      }
    }
  }
});
