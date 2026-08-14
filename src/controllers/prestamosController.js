const supabase = require('../config/supabaseClient');
const { ejecutarReporteEnWorker } = require('../workers/workerPool');

// GET /api/prestamos?id_usuario=
async function listarPrestamos(req, res, next) {
  try {
    const { id_usuario, estado } = req.query;
    let query = supabase
      .from('prestamos')
      .select('*, libros(titulo, autor), usuarios(nombre, correo)')
      .order('fecha_prestamo', { ascending: false });

    if (id_usuario) query = query.eq('id_usuario', id_usuario);
    if (estado) query = query.eq('estado', estado);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ ok: true, total: data.length, data });
  } catch (err) {
    next(err);
  }
}

// POST /api/prestamos  (registrar un préstamo, opcionalmente a partir de una reserva)
async function crearPrestamo(req, res, next) {
  try {
    const { id_usuario, id_libro, id_reserva = null, dias_prestamo = 7 } = req.body;

    const fechaEsperada = new Date();
    fechaEsperada.setDate(fechaEsperada.getDate() + Number(dias_prestamo));

    const { data, error } = await supabase
      .from('prestamos')
      .insert({
        id_usuario,
        id_libro,
        id_reserva,
        fecha_devolucion_esperada: fechaEsperada.toISOString(),
        estado: 'en_curso',
      })
      .select()
      .single();

    if (error) throw error;

    // Si el préstamo viene de una reserva, la marcamos como confirmada
    if (id_reserva) {
      await supabase.from('reservas').update({ estado: 'confirmada' }).eq('id_reserva', id_reserva);
    }

    res.status(201).json({ ok: true, mensaje: 'Préstamo registrado correctamente', data });
  } catch (err) {
    next(err);
  }
}

// PUT /api/prestamos/:id/devolver
async function devolverPrestamo(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('prestamos')
      .update({ estado: 'devuelto', fecha_devolucion_real: new Date().toISOString() })
      .eq('id_prestamo', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ ok: false, mensaje: 'Préstamo no encontrado' });
    }
    res.json({ ok: true, mensaje: 'Devolución registrada correctamente', data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/prestamos/reporte
 * -----------------------------------------------------------------------
 * Endpoint que demuestra el uso de MULTIHILOS (worker_threads):
 * 1) Trae el historial completo de préstamos desde Supabase (I/O asíncrono).
 * 2) Delega el cálculo de estadísticas a un hilo separado (workerPool),
 *    para no bloquear el event loop principal mientras Node atiende
 *    otras peticiones HTTP concurrentes.
 */
async function reportePrestamos(req, res, next) {
  try {
    const { data: prestamos, error } = await supabase.from('prestamos').select('*');
    if (error) throw error;

    const estadisticas = await ejecutarReporteEnWorker(prestamos);

    res.json({ ok: true, mensaje: 'Reporte generado en un hilo independiente', data: estadisticas });
  } catch (err) {
    next(err);
  }
}

module.exports = { listarPrestamos, crearPrestamo, devolverPrestamo, reportePrestamos };
