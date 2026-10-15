-- Preparação apenas. Executar após backup restaurado e validado conforme PRODUCTION-SAFETY.md.
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS is_free boolean NOT NULL DEFAULT false;
-- As sessões usam configuracao_dias[nivel ou geral][dia].is_free (JSONB já existente).
