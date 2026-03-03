-- SCRIPT PARA CREAR LA TABLA DE USUARIOS
-- Ejecutar esto en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS usuarios_app (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  usuario TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  rol TEXT DEFAULT 'user', -- 'admin' o 'user'
  estado TEXT DEFAULT 'pendiente', -- 'activo', 'bloqueado', 'pendiente'
  ultimo_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar el administrador inicial (Bertoldi)
-- Puedes cambiar la contraseña después
INSERT INTO usuarios_app (nombre, usuario, password, rol, estado)
VALUES ('Administrador', 'admin', 'bertoldi2026', 'admin', 'activo')
ON CONFLICT (usuario) DO NOTHING;
