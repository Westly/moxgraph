import { defineConfig } from 'vite';

export default defineConfig({
  build: { target: 'es2022', outDir: 'dist', emptyOutDir: true },
  // This exact loopback origin is already allowed by the approved import relay.
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
});
