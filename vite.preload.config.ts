import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config
export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@images': resolve(__dirname, './src/assets/images'),
      '@': resolve(__dirname, './src'),
    },
  },
});
