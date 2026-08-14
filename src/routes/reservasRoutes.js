const express = require('express');
const router = express.Router();

const { listarReservas, crearReserva, cancelarReserva } = require('../controllers/reservasController');
const { validarReserva, validarUUID } = require('../middlewares/validar');
const asyncHandler = require('../middlewares/asyncHandler');

router.get('/', asyncHandler(listarReservas));
router.post('/', validarReserva, asyncHandler(crearReserva));
router.put('/:id/cancelar', validarUUID('id'), asyncHandler(cancelarReserva));

module.exports = router;
