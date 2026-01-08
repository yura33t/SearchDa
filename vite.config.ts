import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Ensuring the value is a valid JS string or "undefined"
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "undefined")
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  }
});