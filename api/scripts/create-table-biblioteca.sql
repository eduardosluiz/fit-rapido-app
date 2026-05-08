CREATE TABLE IF NOT EXISTS exercicios_biblioteca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  video_url TEXT NOT NULL,
  imagem_url TEXT,
  grupo_muscular VARCHAR(255),
  equipamento VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
