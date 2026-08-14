/**
 * Middlewares de validación de datos (capa previa a los controladores).
 * Se usan esquemas simples "a mano" para no añadir dependencias pesadas,
 * pero siguen el mismo principio que librerías como Joi o express-validator:
 * detener la petición antes de llegar a la lógica de negocio si el body
 * no cumple el formato esperado.
 */

const camposFaltantes = (body, requeridos) =>
  requeridos.filter((campo) => body[campo] === undefined || body[campo] === '' || body[campo] === null);

function validarLibro(req, res, next) {
  const requeridos = ['titulo', 'autor'];
  const faltantes = camposFaltantes(req.body, requeridos);

  if (faltantes.length > 0) {
    return res.status(400).json({
      ok: false,
      mensaje: `Faltan campos obligatorios: ${faltantes.join(', ')}`,
    });
  }

  if (req.body.stock_total !== undefined && Number(req.body.stock_total) < 0) {
    return res.status(400).json({ ok: false, mensaje: 'stock_total no puede ser negativo' });
  }

  next();
}

function validarUsuario(req, res, next) {
  const requeridos = ['nombre', 'correo'];
  const faltantes = camposFaltantes(req.body, requeridos);

  if (faltantes.length > 0) {
    return res.status(400).json({
      ok: false,
      mensaje: `Faltan campos obligatorios: ${faltantes.join(', ')}`,
    });
  }

  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correoRegex.test(req.body.correo)) {
    return res.status(400).json({ ok: false, mensaje: 'El correo no tiene un formato válido' });
  }

  next();
}

function validarReserva(req, res, next) {
  const requeridos = ['id_usuario', 'id_libro'];
  const faltantes = camposFaltantes(req.body, requeridos);

  if (faltantes.length > 0) {
    return res.status(400).json({
      ok: false,
      mensaje: `Faltan campos obligatorios: ${faltantes.join(', ')}`,
    });
  }

  next();
}

function validarUUID(paramName) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return (req, res, next) => {
    const valor = req.params[paramName];
    if (!uuidRegex.test(valor)) {
      return res.status(400).json({ ok: false, mensaje: `El parámetro ${paramName} no es un UUID válido` });
    }
    next();
  };
}

module.exports = { validarLibro, validarUsuario, validarReserva, validarUUID };
