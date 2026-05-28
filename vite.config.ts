import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: { manualChunks: undefined, inlineDynamicImports: true },
    },
    chunkSizeWarningLimit: 10000,
  },
});
