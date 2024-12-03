import { defineConfig } from 'vite';

export default defineConfig({
  base: 'CMPM121-Final', // e.g., /CMPM121-Final/
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@assets': '/assets'
    }
  },
  server: {
    fs: {
      allow: ['..']
    },
  },
});