import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
  },
});
