import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './src/index.html',
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
    
      },
    },
    outDir: '../dist',
  },
});
