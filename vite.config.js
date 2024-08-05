import { defineConfig } from 'vite';
import glob from 'glob';
import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';

export default defineConfig(({ command }) => {
  return {
    define: {
      [command === 'serve' ? 'global' : '_global']: {},
    },
    root: 'src',
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          main: './src/index.html', // основний HTML-файл
          donation: './src/donation.html', // інший HTML-файл
          modal: './src/modal.html', // інший HTML-файл
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          entryFileNames: '[name].js',
        },
      },
      outDir: '../dist', // директорія для збірки
    },
    plugins: [injectHTML(), FullReload(['./src/*.html'])],
  };
});
