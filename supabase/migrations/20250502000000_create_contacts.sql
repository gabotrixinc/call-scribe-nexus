
-- Crear tabla de contactos si no existe
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company TEXT,
  last_contact TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Añadir política de RLS (Row Level Security)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir el acceso solo a usuarios autenticados
CREATE POLICY "Permitir acceso completo a usuarios autenticados" ON contacts
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Añadir algunos contactos de ejemplo
INSERT INTO contacts (name, phone, email, company, last_contact, created_at)
VALUES 
  ('Juan Pérez', '+34612345678', 'juan@empresa.com', 'Empresa ABC', now() - INTERVAL '3 days', now() - INTERVAL '30 days'),
  ('María López', '+34623456789', 'maria@outlook.com', NULL, NULL, now() - INTERVAL '45 days'),
  ('Carlos Rodríguez', '+34634567890', NULL, 'Consultores XYZ', now() - INTERVAL '1 day', now() - INTERVAL '15 days'),
  ('Ana Martínez', '+34645678901', 'ana.martinez@gmail.com', 'Distribuciones Rápidas', NULL, now() - INTERVAL '60 days'),
  ('Roberto Fernández', '+34656789012', 'roberto@empresa.net', NULL, now() - INTERVAL '5 days', now() - INTERVAL '90 days')
ON CONFLICT DO NOTHING;
