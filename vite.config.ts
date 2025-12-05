import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use relative base path to support proxying via Cloudflare Worker (orin.work)
  base: './',
  build: {
    // Build Speed Optimizations
    target: 'esnext',
    reportCompressedSize: false, // Disabling gzip calculation speeds up build
    chunkSizeWarningLimit: 1000,

    // Terser Minification as requested
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2, // Aggressive compression
      },
    },

    // Aggressive Tree-shaking & Manual Chunking
    rollupOptions: {
      treeshake: {
        preset: 'smallest', // Most aggressive tree-shaking preset
        moduleSideEffects: false, // Assumes modules have no side effects (safe here as CSS is in HTML)
        propertyReadSideEffects: false,
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['lucide-react'],
          'vendor-genai': ['@google/genai'],
        },
      },
    },
  },
});