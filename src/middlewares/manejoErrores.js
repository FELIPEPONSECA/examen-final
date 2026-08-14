/**
 * Middleware centralizado de manejo de errores.
 * Debe registrarse SIEMPRE al final de la cadena de middlewares en app.js.
 */

// 404 - ruta no encontrada
function noEncontrado(req, res, next) {
  res.status(404).json({ ok: false, mensaje: `Ruta no encontrada: ${req.originalUrl}` });
}

// Manejador general de errores (4 parámetros => Express lo reconoce como error handler)
function manejoErrores(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err.message);

  const codigo = err.statusCode || 500;
  res.status(codigo).json({
    ok: false,
    mensaje: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

module.exports = { noEncontrado, manejoErrores };
