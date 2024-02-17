import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@images': resolve(__dirname, './src/assets/images'),
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [react()],
});
