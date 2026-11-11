// Genera config.js con las variables de entorno de Vercel. Así la URL y la clave de Supabase no se
// guardan en el repositorio (la clave "publishable" es pública por diseño, pero igual se mantiene fuera de git).
const fs = require('node:fs');
const path = require('node:path');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Faltan SUPABASE_URL y/o SUPABASE_PUBLISHABLE_KEY en las variables de entorno del proyecto.');
  process.exit(1);
}

const contenido = 'window.NEUROTRACK = ' + JSON.stringify({ url, key }) + ';\n';
fs.writeFileSync(path.join(__dirname, 'config.js'), contenido);
console.log('config.js generado.');
