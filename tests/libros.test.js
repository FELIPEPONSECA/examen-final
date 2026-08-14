const request = require('supertest');

jest.mock('../src/config/supabaseClient', () => ({ from: jest.fn() }));

const supabase = require('../src/config/supabaseClient');
const { createSupabaseMock } = require('./utils/mockSupabase');
const app = require('../src/app');
const { normalizarTexto } = require('../src/controllers/librosController');

describe('Función síncrona normalizarTexto', () => {
  test('recorta espacios y pasa a minúsculas', () => {
    expect(normalizarTexto('  Cien Años DE Soledad  ')).toBe('cien años de soledad');
  });

  test('maneja texto vacío sin lanzar error', () => {
    expect(normalizarTexto()).toBe('');
  });
});

describe('GET /api/libros', () => {
  afterEach(() => jest.clearAllMocks());

  test('devuelve 200 y la lista de libros', async () => {
    const librosFalsos = [
      { id_libro: '1', titulo: 'Cien Años de Soledad', autor: 'García Márquez' },
    ];
    supabase.from.mockReturnValue(createSupabaseMock({ data: librosFalsos, error: null }));

    const res = await request(app).get('/api/libros');

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].titulo).toBe('Cien Años de Soledad');
  });
});

describe('GET /api/libros/:id', () => {
  afterEach(() => jest.clearAllMocks());

  test('devuelve 400 si el id no es un UUID válido', async () => {
    const res = await request(app).get('/api/libros/no-es-un-uuid');
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test('devuelve 404 si el libro no existe', async () => {
    supabase.from.mockReturnValue(createSupabaseMock({ data: null, error: { message: 'no encontrado' } }));
    const res = await request(app).get('/api/libros/11111111-1111-1111-1111-111111111111');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/libros', () => {
  afterEach(() => jest.clearAllMocks());

  test('rechaza la creación si faltan campos obligatorios', async () => {
    const res = await request(app).post('/api/libros').send({ titulo: 'Solo título' });
    expect(res.statusCode).toBe(400);
    expect(res.body.mensaje).toMatch(/autor/);
  });

  test('crea un libro correctamente con datos válidos', async () => {
    const libroCreado = { id_libro: '2', titulo: 'Rayuela', autor: 'Julio Cortázar' };
    supabase.from.mockReturnValue(createSupabaseMock({ data: libroCreado, error: null }));

    const res = await request(app)
      .post('/api/libros')
      .send({ titulo: 'Rayuela', autor: 'Julio Cortázar', stock_total: 3 });

    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.titulo).toBe('Rayuela');
  });
});

describe('DELETE /api/libros/:id', () => {
  afterEach(() => jest.clearAllMocks());

  test('elimina un libro correctamente', async () => {
    supabase.from.mockReturnValue(createSupabaseMock({ data: null, error: null }));
    const res = await request(app).delete('/api/libros/11111111-1111-1111-1111-111111111111');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
