const express = require('express');
const router = express.Router();

const {
  listarLibros,
  obtenerLibro,
  crearLibro,
  actualizarLibro,
  eliminarLibro,
} = require('../controllers/librosController');

const { validarLibro, validarUUID } = require('../middlewares/validar');
const asyncHandler = require('../middlewares/asyncHandler');

// GET    /api/libros           -> listar (con filtros ?busqueda= &categoria=)
// GET    /api/libros/:id       -> obtener un libro
// POST   /api/libros           -> crear libro
// PUT    /api/libros/:id       -> actualizar libro
// DELETE /api/libros/:id       -> eliminar libro

router.get('/', asyncHandler(listarLibros));
router.get('/:id', validarUUID('id'), asyncHandler(obtenerLibro));
router.post('/', validarLibro, asyncHandler(crearLibro));
router.put('/:id', validarUUID('id'), asyncHandler(actualizarLibro));
router.delete('/:id', validarUUID('id'), asyncHandler(eliminarLibro));

module.exports = router;
