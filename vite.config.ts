import { defineConfig } from 'vite';

export default defineConfig({
  base: '/CMPM-121-Final-TypeScript', 
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