/**
 * workerPool.js
 * -----------------------------------------------------------------------
 * Helper que crea un Worker Thread bajo demanda y expone su resultado
 * como una Promesa, para poder usarlo con async/await desde los
 * controladores igual que cualquier otra operación asíncrona.
 */
const { Worker } = require('worker_threads');
const path = require('path');

function ejecutarReporteEnWorker(prestamos) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'reporteWorker.js'), {
      workerData: { prestamos },
    });

    worker.on('message', (resultado) => {
      resolve(resultado);
      worker.terminate();
    });

    worker.on('error', (err) => reject(err));

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`El worker de reportes terminó con código ${code}`));
      }
    });
  });
}

module.exports = { ejecutarReporteEnWorker };
