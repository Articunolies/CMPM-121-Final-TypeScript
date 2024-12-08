import { defineConfig } from 'vite';

export default defineConfig({
  base: '/CMPM-121-Final-TypeScript/', // Ensure this matches your repository name
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  publicDir: 'public', // If you have a public directory for static files
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