-- Migration: Sistema de Ingredientes e Substituições
-- Data: 2025-01-XX
-- Descrição: Cria tabelas para sistema de ingredientes, substituições e cálculo de macros

-- 1. Criar enum para fonte de ingrediente
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fonte_ingrediente_enum') THEN
        CREATE TYPE fonte_ingrediente_enum AS ENUM ('manual', 'api', 'ia');
    END IF;
END $$;

-- 2. Criar enum para fonte de cache
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fonte_cache_enum') THEN
        CREATE TYPE fonte_cache_enum AS ENUM ('ia', 'api_usda', 'api_nutritionix');
    END IF;
END $$;

-- 3. Criar tabela ingredientes
CREATE TABLE IF NOT EXISTS ingredientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL UNIQUE,
    nome_variacoes TEXT[] DEFAULT '{}',
    unidade_base VARCHAR(50) DEFAULT '100g',
    calorias DECIMAL(8,2) NOT NULL,
    proteinas DECIMAL(8,2) NOT NULL,
    carboidratos DECIMAL(8,2) NOT NULL,
    gorduras DECIMAL(8,2) NOT NULL,
    fibras DECIMAL(8,2),
    sodio DECIMAL(8,2),
    ativo BOOLEAN DEFAULT TRUE,
    fonte fonte_ingrediente_enum DEFAULT 'manual',
    data_importacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criar índices para ingredientes
CREATE INDEX IF NOT EXISTS idx_ingredientes_nome ON ingredientes(nome);
CREATE INDEX IF NOT EXISTS idx_ingredientes_ativo ON ingredientes(ativo) WHERE ativo = TRUE;

-- 5. Criar tabela receita_ingredientes
CREATE TABLE IF NOT EXISTS receita_ingredientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receita_id UUID NOT NULL REFERENCES receitas(id) ON DELETE CASCADE,
    ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE SET NULL,
    ingrediente_texto VARCHAR(255),
    quantidade DECIMAL(10,2) NOT NULL,
    unidade VARCHAR(50) DEFAULT 'g',
    ordem INTEGER DEFAULT 0,
    observacao TEXT,
    substitutos_sugeridos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_ingrediente CHECK (
        (ingrediente_id IS NOT NULL) OR (ingrediente_texto IS NOT NULL)
    )
);

-- 6. Criar índices para receita_ingredientes
CREATE INDEX IF NOT EXISTS idx_receita_ingredientes_receita ON receita_ingredientes(receita_id);
CREATE INDEX IF NOT EXISTS idx_receita_ingredientes_ingrediente ON receita_ingredientes(ingrediente_id);
CREATE INDEX IF NOT EXISTS idx_receita_ingredientes_ordem ON receita_ingredientes(receita_id, ordem);

-- 7. Criar tabela substituicoes_usuario
CREATE TABLE IF NOT EXISTS substituicoes_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    receita_id UUID NOT NULL REFERENCES receitas(id) ON DELETE CASCADE,
    ingrediente_original_id UUID NOT NULL REFERENCES ingredientes(id) ON DELETE CASCADE,
    ingrediente_substituto_id UUID NOT NULL REFERENCES ingredientes(id) ON DELETE CASCADE,
    quantidade DECIMAL(10,2) NOT NULL,
    unidade VARCHAR(50) DEFAULT 'g',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Criar índices para substituicoes_usuario
CREATE INDEX IF NOT EXISTS idx_substituicoes_usuario ON substituicoes_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_substituicoes_receita ON substituicoes_usuario(receita_id);
CREATE INDEX IF NOT EXISTS idx_substituicoes_usuario_receita ON substituicoes_usuario(usuario_id, receita_id);

-- 9. Criar tabela ingredientes_cache
CREATE TABLE IF NOT EXISTS ingredientes_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_normalizado VARCHAR(255) NOT NULL UNIQUE,
    ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE SET NULL,
    calorias DECIMAL(8,2) NOT NULL,
    proteinas DECIMAL(8,2) NOT NULL,
    carboidratos DECIMAL(8,2) NOT NULL,
    gorduras DECIMAL(8,2) NOT NULL,
    fibras DECIMAL(8,2),
    sodio DECIMAL(8,2),
    fonte fonte_cache_enum NOT NULL,
    confianca DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Criar índice para ingredientes_cache
CREATE INDEX IF NOT EXISTS idx_ingredientes_cache_nome ON ingredientes_cache(nome_normalizado);

-- 11. Criar tabela consultas_ia
CREATE TABLE IF NOT EXISTS consultas_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    receita_id UUID REFERENCES receitas(id) ON DELETE SET NULL,
    pergunta TEXT NOT NULL,
    resposta_ia TEXT,
    substituicao_sugerida JSONB,
    aplicada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Criar índices para consultas_ia
CREATE INDEX IF NOT EXISTS idx_consultas_ia_usuario ON consultas_ia(usuario_id);
CREATE INDEX IF NOT EXISTS idx_consultas_ia_receita ON consultas_ia(receita_id);
CREATE INDEX IF NOT EXISTS idx_consultas_ia_usuario_receita ON consultas_ia(usuario_id, receita_id);

