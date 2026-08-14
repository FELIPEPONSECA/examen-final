const supabase = require('../config/supabaseClient');

// GET /api/usuarios
async function listarUsuarios(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('fecha_registro', { ascending: false });

    if (error) throw error;
    res.json({ ok: true, total: data.length, data });
  } catch (err) {
    next(err);
  }
}

// GET /api/usuarios/:id
async function obtenerUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('usuarios').select('*').eq('id_usuario', id).single();

    if (error || !data) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

// POST /api/usuarios
async function crearUsuario(req, res, next) {
  try {
    const nuevoUsuario = {
      nombre: req.body.nombre,
      correo: req.body.correo,
      telefono: req.body.telefono || null,
      tipo_usuario: req.body.tipo_usuario || 'estudiante',
      estado: 'activo',
    };

    const { data, error } = await supabase.from('usuarios').insert(nuevoUsuario).select().single();

    if (error) {
      // Código 23505 = violación de restricción unique (correo duplicado) en Postgres
      if (error.code === '23505') {
        return res.status(409).json({ ok: false, mensaje: 'Ya existe un usuario con ese correo' });
      }
      throw error;
    }

    res.status(201).json({ ok: true, mensaje: 'Usuario creado correctamente', data });
  } catch (err) {
    next(err);
  }
}

// PUT /api/usuarios/:id
async function actualizarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const cambios = { ...req.body };
    delete cambios.id_usuario;

    const { data, error } = await supabase
      .from('usuarios')
      .update(cambios)
      .eq('id_usuario', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado o sin cambios aplicados' });
    }
    res.json({ ok: true, mensaje: 'Usuario actualizado correctamente', data });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/usuarios/:id
async function eliminarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('usuarios').delete().eq('id_usuario', id);
    if (error) throw error;

    res.json({ ok: true, mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
