import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En Windows, si la terminal arranca con la unidad en minúscula (c:\...), Vite acaba
// mezclando "c:/" y "C:/" y empaqueta React dos veces. Normalizamos la letra de unidad.
const root = process.cwd().replace(/^[a-z]:/, (d) => d.toUpperCase());

// GitHub Pages sirve el proyecto en https://<usuario>.github.io/<repo>/
// Con dominio propio (o <usuario>.github.io a secas) define VITE_BASE=/ al compilar.
const base = process.env.VITE_BASE || '/mamen-kalo-wedding/';

export default defineConfig(({ command }) => ({
  root,
  base: command === 'serve' && !process.argv.includes('preview') ? '/' : base,
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { port: 5183, strictPort: true },
}));
