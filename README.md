# Mamen & Kalo · Web de boda

Vite + React (frontend) y Express (API + panel admin). Trilingüe: ES / EN / BG.

## Arrancar

```bash
npm install
npm run dev      # web en http://localhost:5183, API en :3011
```

Producción:

```bash
cp .env.example .env   # define AUTH_SECRET y las 3 contraseñas
npm run build
NODE_ENV=production npm start   # sirve web + API en el puerto 3011
```

## Personalizar
- Fecha y horarios: `src/config.js`.
- Textos y traducciones: `src/i18n/{es,en,bg}.js`.
- Fotos originales en `source-images/`; `npm run images` regenera las WebP de `public/images/`.

## Panel admin
Botón "Admin" arriba a la derecha (`/admin`). Usuarios: `mamen`, `kalo`, `wedding`, con
contraseñas `ADMIN_<USUARIO>_PASSWORD` del `.env`. En desarrollo, si faltan, se usa `<usuario>-dev`.
Las respuestas se guardan en `data/rsvps.json` (haz copia de seguridad; en un hosting efímero usa un volumen persistente o `DATA_DIR`).
