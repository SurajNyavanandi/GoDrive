import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is one level up from frontend/
const projectRoot = path.resolve(__dirname, '..');

// https://vite.dev/config/
export default defineConfig({
  envDir: projectRoot,
  plugins: [react(), tailwindcss()],
  server: {
    hmr: false,
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
  },
});
