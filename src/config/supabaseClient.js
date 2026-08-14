/**
 * Configuración de la conexión a Supabase.
 * Las credenciales se leen de variables de entorno (.env) para no exponerlas
 * en el código fuente. Ver .env.example para las claves requeridas.
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // No detenemos el proceso para permitir levantar el proyecto en modo demo,
  // pero avisamos claramente en consola.
  console.warn(
    '[Supabase] Faltan SUPABASE_URL y/o SUPABASE_KEY en el archivo .env. ' +
    'Configura las credenciales antes de usar las rutas de la API.'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

module.exports = supabase;
