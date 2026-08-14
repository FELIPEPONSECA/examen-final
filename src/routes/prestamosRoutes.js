const express = require('express');
const router = express.Router();

const {
  listarPrestamos,
  crearPrestamo,
  devolverPrestamo,
  reportePrestamos,
} = require('../controllers/prestamosController');

const { validarUUID } = require('../middlewares/validar');
const asyncHandler = require('../middlewares/asyncHandler');

// OJO: la ruta /reporte debe ir ANTES de /:id/devolver para que Express
// no la confunda con un parámetro dinámico.
router.get('/reporte', asyncHandler(reportePrestamos));

router.get('/', asyncHandler(listarPrestamos));
router.post('/', asyncHandler(crearPrestamo));
router.put('/:id/devolver', validarUUID('id'), asyncHandler(devolverPrestamo));

module.exports = router;
