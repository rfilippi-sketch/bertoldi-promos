-- Script de configuración para Bertoldi Promos Lab
-- Ejecutá esto en el "SQL Editor" de Supabase

-- 1. Crear la tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id BIGINT PRIMARY KEY, -- SKU del producto
  descripcion TEXT NOT NULL,
  marca TEXT,
  stock INT DEFAULT 0,
  costo NUMERIC(15, 2),
  precio_1 NUMERIC(15, 2),
  precio_2 NUMERIC(15, 2),
  precio_3 NUMERIC(15, 2),
  categoria TEXT,
  tipo TEXT,
  enriquecido_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- 3. Crear política para que CUALQUIERA (incluyendo usuarios sin loguear) pueda ver los productos
CREATE POLICY "Permitir lectura a todos" 
ON productos FOR SELECT 
USING (true);

-- 4. Crear política para permitir cambios (solo para cuando configuremos Auth, por ahora permitimos todo vía Anon Key para facilitar la migración)
CREATE POLICY "Permitir cambios con Anon Key" 
ON productos FOR ALL 
USING (true) 
WITH CHECK (true);

-- Nota: En una fase posterior podemos restringir la escritura solo a tu usuario de Supabase.
