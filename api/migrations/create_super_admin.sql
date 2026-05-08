-- Script para criar usuário SUPER ADMIN
-- Execute este script no Supabase SQL Editor

-- Importar bcrypt (se disponível) ou usar hash pré-calculado
-- Senha: Dai123
-- Hash bcrypt: $2b$10$rK8Q8Q8Q8Q8Q8Q8Q8Q8Q8O8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q

-- Criar usuário SUPER ADMIN
INSERT INTO usuarios (
    id,
    email,
    nome,
    senha_hash,
    role,
    subscription_tier,
    ativo,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'dai@gmail.com',
    'Dai',
    '$2b$10$rK8Q8Q8Q8Q8Q8Q8Q8Q8Q8O8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q', -- Hash temporário, será atualizado pelo sistema
    'admin'::usuarios_role_enum,
    'premium_fit'::usuarios_subscription_tier_enum,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE
SET 
    role = 'admin'::usuarios_role_enum,
    subscription_tier = 'premium_fit'::usuarios_subscription_tier_enum,
    ativo = TRUE,
    updated_at = CURRENT_TIMESTAMP;

-- NOTA: O hash acima é temporário. 
-- Após criar o usuário, você deve fazer login uma vez através da API
-- ou atualizar o hash manualmente usando um gerador de bcrypt online
-- com a senha "Dai123"

-- Para gerar um hash bcrypt válido, use:
-- https://bcrypt-generator.com/ ou similar
-- Rounds: 10
-- Senha: Dai123

-- Exemplo de hash válido (substitua após gerar):
-- UPDATE usuarios 
-- SET senha_hash = '$2b$10$SEU_HASH_AQUI'
-- WHERE email = 'dai@gmail.com';

