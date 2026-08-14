-- =========================================================
-- BIBLIOTECA DIGITAL - ESQUEMA DE BASE DE DATOS (Supabase/PostgreSQL)
-- =========================================================
-- Ejecutar este script en: Supabase Dashboard > SQL Editor
-- =========================================================

-- Extensión para generar UUID automáticamente
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- Tabla: usuarios
-- ---------------------------------------------------------
create table if not exists usuarios (
    id_usuario      uuid primary key default uuid_generate_v4(),
    nombre          varchar(120) not null,
    correo          varchar(150) not null unique,
    telefono        varchar(20),
    tipo_usuario    varchar(20) not null default 'estudiante'
                        check (tipo_usuario in ('estudiante','docente','administrador')),
    estado          varchar(20) not null default 'activo'
                        check (estado in ('activo','inactivo','suspendido')),
    fecha_registro  timestamp with time zone default now()
);

-- ---------------------------------------------------------
-- Tabla: libros
-- ---------------------------------------------------------
create table if not exists libros (
    id_libro        uuid primary key default uuid_generate_v4(),
    titulo          varchar(200) not null,
    autor           varchar(150) not null,
    isbn            varchar(20) unique,
    categoria       varchar(80),
    editorial       varchar(120),
    anio_publicacion int,
    stock_total     int not null default 1 check (stock_total >= 0),
    stock_disponible int not null default 1 check (stock_disponible >= 0),
    portada_url     text,
    fecha_creacion  timestamp with time zone default now()
);

-- ---------------------------------------------------------
-- Tabla: reservas
-- (una reserva es la solicitud previa al préstamo físico)
-- ---------------------------------------------------------
create table if not exists reservas (
    id_reserva      uuid primary key default uuid_generate_v4(),
    id_usuario      uuid not null references usuarios(id_usuario) on delete cascade,
    id_libro        uuid not null references libros(id_libro) on delete cascade,
    fecha_reserva   timestamp with time zone default now(),
    fecha_limite    timestamp with time zone not null,
    estado          varchar(20) not null default 'pendiente'
                        check (estado in ('pendiente','confirmada','cancelada','vencida'))
);

-- ---------------------------------------------------------
-- Tabla: prestamos (historial de préstamos)
-- ---------------------------------------------------------
create table if not exists prestamos (
    id_prestamo     uuid primary key default uuid_generate_v4(),
    id_usuario      uuid not null references usuarios(id_usuario) on delete cascade,
    id_libro        uuid not null references libros(id_libro) on delete cascade,
    id_reserva      uuid references reservas(id_reserva) on delete set null,
    fecha_prestamo  timestamp with time zone default now(),
    fecha_devolucion_esperada timestamp with time zone not null,
    fecha_devolucion_real     timestamp with time zone,
    estado          varchar(20) not null default 'en_curso'
                        check (estado in ('en_curso','devuelto','atrasado'))
);

-- ---------------------------------------------------------
-- Índices para optimizar búsquedas frecuentes
-- ---------------------------------------------------------
create index if not exists idx_libros_titulo on libros (titulo);
create index if not exists idx_libros_categoria on libros (categoria);
create index if not exists idx_reservas_usuario on reservas (id_usuario);
create index if not exists idx_prestamos_usuario on prestamos (id_usuario);
create index if not exists idx_prestamos_estado on prestamos (estado);

-- ---------------------------------------------------------
-- Trigger: al confirmar un préstamo, reduce el stock disponible
-- ---------------------------------------------------------
create or replace function fn_descontar_stock()
returns trigger as $$
begin
    update libros
       set stock_disponible = stock_disponible - 1
     where id_libro = new.id_libro
       and stock_disponible > 0;
    return new;
end;
$$ language plpgsql;

create trigger trg_descontar_stock
after insert on prestamos
for each row execute function fn_descontar_stock();

-- ---------------------------------------------------------
-- Trigger: al devolver un libro, restaura el stock disponible
-- ---------------------------------------------------------
create or replace function fn_restaurar_stock()
returns trigger as $$
begin
    if new.estado = 'devuelto' and old.estado <> 'devuelto' then
        update libros
           set stock_disponible = stock_disponible + 1
         where id_libro = new.id_libro;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_restaurar_stock
after update on prestamos
for each row execute function fn_restaurar_stock();
