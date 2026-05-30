import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Repo is a project page (https://sevabrov.github.io/zvyazok/),
// so assets must be served from the /zvyazok/ sub-path.
export default defineConfig({
  base: '/zvyazok/',
  plugins: [react(), tailwindcss()],
});
