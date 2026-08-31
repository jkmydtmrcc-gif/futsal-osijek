import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import apiPlugin from './dev-server/api-plugin';

export default defineConfig({
  // `apiPlugin` lokalno poslužuje funkcije iz `api/`, isto kao Vercel u
  // produkciji — pa se prijava i objava mogu isprobati prije deploya.
  plugins: [react(), apiPlugin()],
  server: { port: 5173 },
});
