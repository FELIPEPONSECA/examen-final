const request = require('supertest');

jest.mock('../src/config/supabaseClient', () => ({ from: jest.fn() }));

const supabase = require('../src/config/supabaseClient');
const { createSupabaseMock } = require('./utils/mockSupabase');
const app = require('../src/app');
const { ejecutarReporteEnWorker } = require('../src/workers/workerPool');

afterEach(() => jest.clearAllMocks());

describe('POST /api/reservas', () => {
  test('rechaza la reserva si faltan datos obligatorios', async () => {
    const res = await request(app).post('/api/reservas').send({ id_usuario: '1' });
    expect(res.statusCode).toBe(400);
  });

  test('rechaza la reserva si no hay stock disponible', async () => {
    supabase.from.mockReturnValue(
      createSupabaseMock({ data: { stock_disponible: 0 }, error: null })
    );

    const res = await request(app)
      .post('/api/reservas')
      .send({ id_usuario: '1', id_libro: '2' });

    expect(res.statusCode).toBe(409);
  });
});

describe('Worker thread de reportes (multihilos)', () => {
  test('calcula estadísticas de préstamos en un hilo separado', async () => {
    const prestamosFalsos = [
      {
        id_libro: 'libro-1',
        id_usuario: 'user-1',
        fecha_prestamo: '2026-01-01T00:00:00Z',
        fecha_devolucion_real: '2026-01-05T00:00:00Z',
      },
      {
        id_libro: 'libro-1',
        id_usuario: 'user-2',
        fecha_prestamo: '2026-01-02T00:00:00Z',
        fecha_devolucion_real: null,
      },
    ];

    const resultado = await ejecutarReporteEnWorker(prestamosFalsos);

    expect(resultado.totalPrestamos).toBe(2);
    expect(resultado.libroMasPrestado.id_libro).toBe('libro-1');
    expect(resultado.promedioDiasPrestamo).toBe(4);
  }, 10000);
});
