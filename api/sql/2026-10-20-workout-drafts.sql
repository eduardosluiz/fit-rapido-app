-- Rascunhos editoriais: apenas cria uma NOVA tabela vazia.
-- Não copia, atualiza ou exclui treinos, modalidades, usuários ou mídias.
-- Execute o bloco completo. Se a tabela já existir, a operação falha e faz
-- rollback: não tenta alterar nem substituir a estrutura existente.
-- Criar esta tabela NÃO ativa o fluxo Salvar rascunho / Publicar no painel.
-- Esse fluxo ainda requer implementação e implantação da API e do admin.

BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '15s';

CREATE TABLE public.workout_drafts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type text NOT NULL CHECK (content_type IN ('modalidade', 'treino')),
    content_id uuid NOT NULL,
    payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
    revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
    base_published_updated_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workout_drafts_content_unique UNIQUE (content_type, content_id)
);

COMMENT ON TABLE public.workout_drafts IS
  'Rascunhos privados do editor. Modalidade inclui seus exercícios no payload. O mobile consulta somente as tabelas publicadas existentes.';
COMMENT ON COLUMN public.workout_drafts.content_id IS
  'Identificador estável do conteúdo novo ou publicado. Sem FK para permitir rascunhos ainda não publicados.';
COMMENT ON COLUMN public.workout_drafts.revision IS
  'Controle de concorrência: API deverá incrementar e comparar ao salvar/publicar.';
COMMENT ON COLUMN public.workout_drafts.base_published_updated_at IS
  'Versão publicada usada como base; permite detectar alterações concorrentes antes de publicar.';

-- Nenhuma leitura/escrita direta para visitantes ou usuários autenticados do app.
-- A API administrativa deve validar a permissão de editor antes de acessar.
ALTER TABLE public.workout_drafts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.workout_drafts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.workout_drafts TO service_role;

COMMIT;

-- Conferência somente leitura: esperado true / true / 0.
SELECT
  to_regclass('public.workout_drafts') IS NOT NULL AS tabela_criada,
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.workout_drafts'::regclass) AS rls_ativado,
  (SELECT count(*) FROM public.workout_drafts) AS quantidade_rascunhos;
