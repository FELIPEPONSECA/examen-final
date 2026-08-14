/**
 * asyncHandler
 * -----------------------------------------------------------------------
 * Envuelve controladores async para capturar automáticamente cualquier
 * excepción (o promesa rechazada) y enviarla al middleware de manejo de
 * errores, evitando repetir try/catch en cada controlador.
 *
 * Uso:
 *   router.get('/', asyncHandler(controlador.listar));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
