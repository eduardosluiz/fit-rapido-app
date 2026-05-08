-- Script SQL para atualizar usuário para admin
-- Execute este script no Supabase SQL Editor ou no seu cliente PostgreSQL

-- Substitua o email abaixo pelo email do usuário que você criou
UPDATE usuarios 
SET role = 'admin' 
WHERE email = 'admin@fitrapido.com';

-- Verificar se foi atualizado
SELECT id, email, nome, role FROM usuarios WHERE email = 'admin@fitrapido.com';




