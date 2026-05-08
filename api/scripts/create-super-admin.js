/**
 * Script para criar usuário SUPER ADMIN
 * Execute: node api/scripts/create-super-admin.js
 * 
 * Requisitos:
 * - Ter bcrypt instalado: npm install bcrypt
 * - Ter acesso ao banco de dados configurado no .env
 */

require('dotenv').config({ path: '.env' });
const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function createSuperAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    const email = 'dai@gmail.com';
    const nome = 'Dai';
    const senha = 'Dai123';
    
    // Gerar hash da senha
    const senha_hash = await bcrypt.hash(senha, 10);
    console.log('✅ Hash da senha gerado');

    // Verificar se usuário já existe
    const checkUser = await client.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (checkUser.rows.length > 0) {
      console.log('⚠️  Usuário já existe. Atualizando...');
      
      // Atualizar usuário existente
      await client.query(
        `UPDATE usuarios 
         SET nome = $1, 
             senha_hash = $2, 
             role = 'admin'::usuarios_role_enum,
             subscription_tier = 'premium_fit'::usuarios_subscription_tier_enum,
             ativo = TRUE,
             updated_at = CURRENT_TIMESTAMP
         WHERE email = $3`,
        [nome, senha_hash, email]
      );
      
      console.log('✅ Usuário atualizado com sucesso!');
    } else {
      console.log('📝 Criando novo usuário...');
      
      // Criar novo usuário
      await client.query(
        `INSERT INTO usuarios (
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
          $1,
          $2,
          $3,
          'admin'::usuarios_role_enum,
          'premium_fit'::usuarios_subscription_tier_enum,
          TRUE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )`,
        [email, nome, senha_hash]
      );
      
      console.log('✅ Usuário criado com sucesso!');
    }

    console.log('\n📋 Credenciais do SUPER ADMIN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email: ${email}`);
    console.log(`Senha: ${senha}`);
    console.log(`Role: admin`);
    console.log(`Subscription: premium_fit`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Executar
createSuperAdmin();

