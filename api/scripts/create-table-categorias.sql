CREATE TABLE IF NOT EXISTS exercicios_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir as categorias iniciais
INSERT INTO exercicios_categorias (nome) VALUES ('abdomen'), ('superiores'), ('inferiores'), ('Geral') ON CONFLICT DO NOTHING;
