const express = require('express');
const router = express.Router();

const {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controllers/usuariosController');

const { validarUsuario, validarUUID } = require('../middlewares/validar');
const asyncHandler = require('../middlewares/asyncHandler');

router.get('/', asyncHandler(listarUsuarios));
router.get('/:id', validarUUID('id'), asyncHandler(obtenerUsuario));
router.post('/', validarUsuario, asyncHandler(crearUsuario));
router.put('/:id', validarUUID('id'), asyncHandler(actualizarUsuario));
router.delete('/:id', validarUUID('id'), asyncHandler(eliminarUsuario));

module.exports = router;
