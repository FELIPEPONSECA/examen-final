const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// Regex para validar formato de correo
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/usuarios - Obtener lista de usuarios
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('usuarios').select('*');

    if (error) {
      console.error('Error Supabase:', error);
      return res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }

    // Devuelve la estructura requerida por el frontend y los tests (total y data)
    return res.status(200).json({
      total: data ? data.length : 0,
      data: data || []
    });
  } catch (err) {
    console.error('Error en GET /api/usuarios:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// POST /api/usuarios - Crear un nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, nombre_completo, correo, email, telefono, tipo_usuario, estado } = req.body;

    const correoUsar = correo || email;

    // 1. Validar que exista el correo
    if (!correoUsar) {
      return res.status(400).json({ mensaje: 'El correo es obligatorio' });
    }

    // 2. Validar formato de correo
    if (!EMAIL_REGEX.test(correoUsar)) {
      return res.status(400).json({ mensaje: 'El formato del correo es inválido' });
    }

    const nombreUsar = nombre || nombre_completo || 'Usuario';

    // 3. Insertar usuario en Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre: nombreUsar,
          nombre_completo: nombre_completo || nombreUsar,
          correo: correoUsar,
          email: correoUsar,
          telefono: telefono || null,
          tipo_usuario: tipo_usuario || 'Estudiante',
          estado: estado || 'activo'
        }
      ])
      .select()
      .single();

    if (error) {
      // Código Postgres 23505 = Registro duplicado (Unique Constraint)
      if (error.code === '23505') {
        return res.status(409).json({ mensaje: 'El correo ya existe' });
      }
      console.error('Error Supabase:', error);
      return res.status(500).json({ mensaje: error.message || 'Error al crear usuario' });
    }

    return res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      data: data
    });
  } catch (err) {
    console.error('Error en POST /api/usuarios:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;