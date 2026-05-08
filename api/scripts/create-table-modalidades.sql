-- Criar tabela de modalidades
CREATE TABLE IF NOT EXISTS treinos_modalidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT,
  icone VARCHAR(255),
  ordem INT DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar coluna de relação na tabela de treinos
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS modalidade_id UUID REFERENCES treinos_modalidades(id);

-- Inserir modalidades iniciais
INSERT INTO treinos_modalidades (nome, icone) 
VALUES ('Treino em Casa', 'bx-home'), ('Treino Academia', 'bx-dumbbell') 
ON CONFLICT (nome) DO NOTHING;
