/**
 * reporteWorker.js
 * -----------------------------------------------------------------------
 * Este script se ejecuta en un hilo (thread) separado del hilo principal
 * de Node.js usando el módulo nativo "worker_threads". Se usa para tareas
 * que consumen CPU (por ejemplo, calcular estadísticas de préstamos sobre
 * un volumen grande de registros) sin bloquear el event loop que atiende
 * las peticiones HTTP.
 */
const { parentPort, workerData } = require('worker_threads');

function calcularEstadisticas(prestamos) {
  // Simulación de un cálculo intensivo: libros más prestados,
  // usuarios con más préstamos y promedio de días de préstamo.
  const conteoLibros = {};
  const conteoUsuarios = {};
  let sumaDias = 0;
  let conDevolucion = 0;

  for (const p of prestamos) {
    conteoLibros[p.id_libro] = (conteoLibros[p.id_libro] || 0) + 1;
    conteoUsuarios[p.id_usuario] = (conteoUsuarios[p.id_usuario] || 0) + 1;

    if (p.fecha_devolucion_real) {
      const dias =
        (new Date(p.fecha_devolucion_real) - new Date(p.fecha_prestamo)) / (1000 * 60 * 60 * 24);
      sumaDias += dias;
      conDevolucion += 1;
    }
  }

  const libroMasPrestado = Object.entries(conteoLibros).sort((a, b) => b[1] - a[1])[0];
  const usuarioMasActivo = Object.entries(conteoUsuarios).sort((a, b) => b[1] - a[1])[0];

  return {
    totalPrestamos: prestamos.length,
    libroMasPrestado: libroMasPrestado ? { id_libro: libroMasPrestado[0], veces: libroMasPrestado[1] } : null,
    usuarioMasActivo: usuarioMasActivo ? { id_usuario: usuarioMasActivo[0], veces: usuarioMasActivo[1] } : null,
    promedioDiasPrestamo: conDevolucion > 0 ? Number((sumaDias / conDevolucion).toFixed(2)) : 0,
  };
}

const resultado = calcularEstadisticas(workerData.prestamos || []);
parentPort.postMessage(resultado);
