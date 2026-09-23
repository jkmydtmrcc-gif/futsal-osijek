import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sitemapPlugin from './dev-server/sitemap-plugin';

export default defineConfig({
  plugins: [react(), sitemapPlugin()],
  server: { port: 5173 },
});
