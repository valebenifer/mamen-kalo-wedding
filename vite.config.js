import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En Windows, si la terminal arranca con la unidad en minúscula (c:\...), Vite acaba
// mezclando "c:/" y "C:/" y empaqueta React dos veces. Normalizamos la letra de unidad.
const root = process.cwd().replace(/^[a-z]:/, (d) => d.toUpperCase());

export default defineConfig({
  root,
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { port: 5173, proxy: { '/api': 'http://localhost:3001' } },
});
