const request = require('supertest');

jest.mock('../src/config/supabaseClient', () => ({ from: jest.fn() }));

const supabase = require('../src/config/supabaseClient');
const { createSupabaseMock } = require('./utils/mockSupabase');
const app = require('../src/app');

afterEach(() => jest.clearAllMocks());

describe('POST /api/prestamos', () => {
  test('crea un préstamo correctamente', async () => {
    const prestamoCreado = { id_prestamo: 'p1', id_usuario: 'u1', id_libro: 'l1', estado: 'en_curso' };
    supabase.from.mockReturnValue(createSupabaseMock({ data: prestamoCreado, error: null }));

    const res = await request(app)
      .post('/api/prestamos')
      .send({ id_usuario: 'u1', id_libro: 'l1', dias_prestamo: 5 });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.estado).toBe('en_curso');
  });
});

describe('PUT /api/prestamos/:id/devolver', () => {
  test('registra la devolución correctamente', async () => {
    const prestamoDevuelto = { id_prestamo: 'p1', estado: 'devuelto' };
    supabase.from.mockReturnValue(createSupabaseMock({ data: prestamoDevuelto, error: null }));

    const res = await request(app).put('/api/prestamos/11111111-1111-1111-1111-111111111111/devolver');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.estado).toBe('devuelto');
  });

  test('devuelve 404 si el préstamo no existe', async () => {
    supabase.from.mockReturnValue(createSupabaseMock({ data: null, error: null }));
    const res = await request(app).put('/api/prestamos/11111111-1111-1111-1111-111111111111/devolver');
    expect(res.statusCode).toBe(404);
  });
});

describe('GET /api/prestamos/reporte', () => {
  test('devuelve estadísticas generadas por el worker thread', async () => {
    supabase.from.mockReturnValue(createSupabaseMock({ data: [], error: null }));
    const res = await request(app).get('/api/prestamos/reporte');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalPrestamos).toBe(0);
  }, 10000);
});

describe('Manejo de errores', () => {
  test('devuelve 404 para una ruta inexistente', async () => {
    const res = await request(app).get('/api/ruta-que-no-existe');
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
  });

  test('devuelve 500 si Supabase lanza un error inesperado', async () => {
    supabase.from.mockImplementation(() => {
      throw new Error('Fallo de conexión simulado');
    });
    const res = await request(app).get('/api/libros');
    expect(res.statusCode).toBe(500);
    expect(res.body.ok).toBe(false);
  });
});
