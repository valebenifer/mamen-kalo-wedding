# Mamen & Kalo · Web de boda

Web 100 % estática (Vite + React) pensada para **GitHub Pages**. Trilingüe: ES / EN / BG.
Las respuestas de los invitados se guardan en **Firebase Firestore** (plan gratuito) y el panel
de administración usa **Firebase Authentication**. No hay servidor propio.

```bash
npm install
npm run dev       # http://localhost:5183
npm run build     # genera dist/
```

Mientras Firebase no esté configurado la web funciona en **modo demo**: los datos se guardan solo
en tu navegador y el panel admite `mamen` / `mamen-demo` (también `kalo-demo`, `wedding-demo`).

## 1. Configurar Firebase (una sola vez, ~10 min, sin tarjeta)

1. Entra en <https://console.firebase.google.com> → **Crear proyecto** (puedes desactivar Analytics).
2. **Compilación → Firestore Database → Crear base de datos** (modo producción, región `eur3` o `europe-west`).
3. En la pestaña **Reglas** de Firestore pega el contenido de [`firestore.rules`](firestore.rules) y publica.
   - Si cambias el dominio de los correos admin en `src/firebaseConfig.js`, cámbialo también en las reglas.
4. **Compilación → Authentication → Comenzar → Método de acceso → Correo electrónico/contraseña → Habilitar**.
5. En **Authentication → Usuarios → Añadir usuario** crea estos tres (con la contraseña que quieras, larga):
   - `mamen@boda-mamen-kalo.app`
   - `kalo@boda-mamen-kalo.app`
   - `wedding@boda-mamen-kalo.app`

   Los correos no tienen que existir de verdad. En el login se escribe solo `mamen`, `kalo` o `wedding`.
6. **Configuración del proyecto (⚙️) → Tus apps → Web (`</>`)** → registra la app y copia `apiKey` y `projectId`
   en [`src/firebaseConfig.js`](src/firebaseConfig.js).
   Esa clave es pública por diseño; lo que protege los datos son las reglas.

### Seguridad
- Cualquiera puede **crear** una respuesta (validada por las reglas), pero **solo esos 3 correos** pueden leer o borrar.
- Opcional: en Firebase **App Check** o en Google Cloud → Credenciales puedes limitar la API key a tu dominio
  (`https://<usuario>.github.io/*`) para reducir spam.
- Haz una exportación CSV desde el panel de vez en cuando como copia de seguridad.

## 2. Publicar en GitHub Pages

1. Sube el repo a GitHub (rama `main`).
2. **Settings → Pages → Source: GitHub Actions**.
3. Cada `git push` a `main` ejecuta `.github/workflows/deploy.yml` y publica la web en
   `https://<usuario>.github.io/mamen-kalo-wedding/`.
4. Si el repositorio tiene otro nombre, o usas dominio propio, define la variable `VITE_BASE`
   (por ejemplo `VITE_BASE=/` para un dominio propio) o cambia el valor por defecto en `vite.config.js`.

El panel de administración está en `…/#/admin` (botón **Admin** arriba a la derecha).

## Personalizar
- Fecha y horarios: `src/config.js`.
- Textos y traducciones: `src/i18n/{es,en,bg}.js`.
- Fotos originales en `source-images/`; `npm run images` regenera las WebP de `public/images/`.
