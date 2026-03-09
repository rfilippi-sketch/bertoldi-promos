-- Tabla para guardar las promociones configuradas
CREATE TABLE IF NOT EXISTS promociones_guardadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'bundle' o 'individual'
    datos JSONB NOT NULL, -- Array de items con sus cantidades y descuentos
    totales JSONB, -- Objeto con precio lista, precio final, ahorro, etc.
    veces_usada INT DEFAULT 1,
    creado_por TEXT, -- ID del usuario que la creó
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE promociones_guardadas ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes para evitar errores de duplicación
DROP POLICY IF EXISTS "Permitir lectura a todos" ON promociones_guardadas;
DROP POLICY IF EXISTS "Permitir inserción a todos" ON promociones_guardadas;
DROP POLICY IF EXISTS "Permitir actualización a todos" ON promociones_guardadas;

-- Re-crear políticas
CREATE POLICY "Permitir lectura a todos" ON promociones_guardadas FOR SELECT USING (true);
CREATE POLICY "Permitir inserción a todos" ON promociones_guardadas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización a todos" ON promociones_guardadas FOR UPDATE USING (true);

-- Función para incrementar el contador de uso
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE promociones_guardadas
    SET veces_usada = veces_usada + 1
    WHERE id = promo_id;
END;
$$ LANGUAGE plpgsql;
