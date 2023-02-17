import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import svg from '@poppanator/sveltekit-svg';
import path from 'path';
import mkcert from 'vite-plugin-mkcert';

const project = 'my-project';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log(mode);
  return {
    plugins: [
      svelte({ emitCss: false, compilerOptions: { dev: mode === 'development' } }),
      mkcert()
    ],
    build: {
      target: ['chrome58'],
      manifest: true,
      ssr: false,
      minify: mode !== 'development',
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: path.resolve(__dirname, 'src/lib/Video.wc.ts'),
        name: 'SmartPlayer',
        formats: ['iife'],
        // the proper extensions will be added
        fileName: 'smart-player'
        // minify: true,
        // rollupOptions: {
        //   // name: `${project}`,
        //   input: "./src/App.wc.ts",
        //   output: {
        //     inlineDynamicImports: true,
        //     entryFileNames: `${project}.js`,
        //     dir: "./packages/",
        //   },
      }
    },
    resolve: {
      alias: {
        $: path.resolve('./src')
      }
    }
  };
});
