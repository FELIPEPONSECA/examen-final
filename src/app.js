const express = require('express');
const cors = require('cors');
const path = require('path');

const librosRoutes = require('./routes/librosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const reservasRoutes = require('./routes/reservasRoutes');
const prestamosRoutes = require('./routes/prestamosRoutes');
const { noEncontrado, manejoErrores } = require('./middlewares/manejoErrores');

const app = express();

// ---------- Middlewares globales ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log simple de cada request
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ---------- Frontend estático ----------
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// ---------- Rutas de la API ----------
app.get('/api', (req, res) => {
  res.json({ ok: true, mensaje: 'API Biblioteca Digital funcionando correctamente' });
});

app.use('/api/libros', librosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/prestamos', prestamosRoutes);

// Servir index.html para cualquier ruta del navegador que no sea de la API
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// ---------- Manejo de errores ----------
app.use(noEncontrado);
app.use(manejoErrores);

module.exports = app;