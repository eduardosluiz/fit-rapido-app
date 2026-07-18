-- Adicionar as colunas subtitulo e ordem_modalidade na tabela treinos_modalidades
ALTER TABLE public.treinos_modalidades
ADD COLUMN subtitulo VARCHAR(255),
ADD COLUMN ordem_modalidade INTEGER DEFAULT 0;
