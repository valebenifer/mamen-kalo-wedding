// Configuración pública de Firebase (no es secreta: la seguridad la dan las reglas de firestore.rules).
// Cópiala desde Firebase Console → Configuración del proyecto → Tus apps → Web.
// Mientras apiKey esté vacío, la web funciona en MODO DEMO (datos solo en el navegador, útil para probar).
export const FIREBASE = {
  apiKey: 'AIzaSyCAIN_c3qeGsfsiC3ZhJPqC35Ka1A6chzs',
  projectId: 'mamen-kalo-wedding',
};

// Los usuarios del panel se crean en Firebase Authentication con estos correos (ver README).
// En el login se escribe solo "mamen", "kalo" o "wedding".
export const ADMIN_EMAIL_DOMAIN = 'boda-mamen-kalo.app';
export const ADMIN_USERS = ['mamen', 'kalo', 'wedding'];
