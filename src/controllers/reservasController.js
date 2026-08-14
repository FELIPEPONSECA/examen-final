const supabase = require('../config/supabaseClient');

// GET /api/reservas?id_usuario=
async function listarReservas(req, res, next) {
  try {
    const { id_usuario } = req.query;
    let query = supabase
      .from('reservas')
      .select('*, libros(titulo, autor), usuarios(nombre, correo)')
      .order('fecha_reserva', { ascending: false });

    if (id_usuario) query = query.eq('id_usuario', id_usuario);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ ok: true, total: data.length, data });
  } catch (err) {
    next(err);
  }
}

// POST /api/reservas
// Ejemplo de operación que combina DOS llamadas asíncronas encadenadas con
// async/await: primero valida stock disponible y luego crea la reserva.
async function crearReserva(req, res, next) {
  try {
    const { id_usuario, id_libro, dias_limite = 3 } = req.body;

    const { data: libro, error: errorLibro } = await supabase
      .from('libros')
      .select('stock_disponible')
      .eq('id_libro', id_libro)
      .single();

    if (errorLibro || !libro) {
      return res.status(404).json({ ok: false, mensaje: 'El libro indicado no existe' });
    }
    if (libro.stock_disponible <= 0) {
      return res.status(409).json({ ok: false, mensaje: 'No hay ejemplares disponibles para reservar' });
    }

    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + Number(dias_limite));

    const { data, error } = await supabase
      .from('reservas')
      .insert({
        id_usuario,
        id_libro,
        fecha_limite: fechaLimite.toISOString(),
        estado: 'pendiente',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ ok: true, mensaje: 'Reserva creada correctamente', data });
  } catch (err) {
    next(err);
  }
}

// PUT /api/reservas/:id/cancelar
async function cancelarReserva(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('reservas')
      .update({ estado: 'cancelada' })
      .eq('id_reserva', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
    }
    res.json({ ok: true, mensaje: 'Reserva cancelada', data });
  } catch (err) {
    next(err);
  }
}

module.exports = { listarReservas, crearReserva, cancelarReserva };
