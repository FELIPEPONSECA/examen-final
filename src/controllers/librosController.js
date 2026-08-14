const supabase = require('../config/supabaseClient');

/**
 * Función SÍNCRONA de apoyo: normaliza el texto de búsqueda.
 * No involucra I/O, por eso se resuelve en el mismo tick (síncrona),
 * a diferencia de los métodos de abajo que sí dependen de I/O de red
 * hacia Supabase y por tanto son asíncronos.
 */
function normalizarTexto(texto = '') {
  return texto.trim().toLowerCase();
}

// GET /api/libros  (con filtros opcionales ?busqueda=&categoria=)
async function listarLibros(req, res, next) {
  try {
    const { busqueda, categoria } = req.query;
    let query = supabase.from('libros').select('*').order('titulo', { ascending: true });

    if (busqueda) {
      const texto = normalizarTexto(busqueda);
      query = query.or(`titulo.ilike.%${texto}%,autor.ilike.%${texto}%`);
    }
    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ ok: true, total: data.length, data });
  } catch (err) {
    next(err);
  }
}

// GET /api/libros/:id
async function obtenerLibro(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('libros').select('*').eq('id_libro', id).single();

    if (error || !data) {
      return res.status(404).json({ ok: false, mensaje: 'Libro no encontrado' });
    }
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

// POST /api/libros
async function crearLibro(req, res, next) {
  try {
    const nuevoLibro = {
      titulo: req.body.titulo,
      autor: req.body.autor,
      isbn: req.body.isbn || null,
      categoria: req.body.categoria || null,
      editorial: req.body.editorial || null,
      anio_publicacion: req.body.anio_publicacion || null,
      stock_total: req.body.stock_total ?? 1,
      stock_disponible: req.body.stock_total ?? 1,
      portada_url: req.body.portada_url || null,
    };

    const { data, error } = await supabase.from('libros').insert(nuevoLibro).select().single();
    if (error) throw error;

    res.status(201).json({ ok: true, mensaje: 'Libro creado correctamente', data });
  } catch (err) {
    next(err);
  }
}

// PUT /api/libros/:id
async function actualizarLibro(req, res, next) {
  try {
    const { id } = req.params;
    const cambios = { ...req.body };
    delete cambios.id_libro; // nunca se sobrescribe la PK

    const { data, error } = await supabase
      .from('libros')
      .update(cambios)
      .eq('id_libro', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ ok: false, mensaje: 'Libro no encontrado o sin cambios aplicados' });
    }
    res.json({ ok: true, mensaje: 'Libro actualizado correctamente', data });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/libros/:id
async function eliminarLibro(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('libros').delete().eq('id_libro', id);
    if (error) throw error;

    res.json({ ok: true, mensaje: 'Libro eliminado correctamente' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarLibros,
  obtenerLibro,
  crearLibro,
  actualizarLibro,
  eliminarLibro,
  normalizarTexto, // se exporta para poder probarla en unit tests (función síncrona)
};
