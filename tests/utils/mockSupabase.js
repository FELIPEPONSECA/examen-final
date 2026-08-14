/**
 * Crea un "query builder" falso que imita la API encadenable de
 * @supabase/supabase-js (from().select().eq().single(), etc.) para poder
 * probar los controladores sin necesidad de una conexión real a la base
 * de datos.
 */
function createSupabaseMock(resolvedValue) {
  const builder = {};
  const metodosEncadenables = [
    'select', 'eq', 'order', 'or', 'insert', 'update', 'delete',
  ];

  metodosEncadenables.forEach((metodo) => {
    builder[metodo] = jest.fn(() => builder);
  });

  // .single() resuelve inmediatamente (como lo hace supabase-js)
  builder.single = jest.fn(() => Promise.resolve(resolvedValue));

  // Hace que el propio builder sea "thenable" para soportar
  // `await supabase.from('x').select('*')` sin llamar a .single()
  builder.then = (resolve) => resolve(resolvedValue);

  return builder;
}

module.exports = { createSupabaseMock };
