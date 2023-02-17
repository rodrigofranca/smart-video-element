// @ts-nocheck
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import svg from '@poppanator/sveltekit-svg';
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      emitCss: false,
      exclude: ['./src/export/**/*.svelte']
    }),
    svg(),
    mkcert()
  ],
  server: {
    host: 'dev.rfranca.com.br',
    port: 443,
    https: true
  },
  resolve: {
    alias: {
      $: path.resolve('./src')
    }
  }
});
