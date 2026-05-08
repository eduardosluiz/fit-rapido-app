/**
 * Script para resetar senha de usuário
 * 
 * Uso: node scripts/resetar-senha.js <email> <nova-senha>
 * Exemplo: node scripts/resetar-senha.js dudemkt@gmail.com MinhaNovaSenha123!
 */

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fitrapido.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

async function resetarSenha(emailUsuario, novaSenha) {
  try {
    console.log(`${colors.cyan}🔐 Fazendo login como admin...${colors.reset}`);
    
    // Login como admin
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD,
    });

    const token = loginResponse.data.access_token;
    console.log(`${colors.green}✅ Login realizado!${colors.reset}\n`);

    // Buscar usuário
    console.log(`${colors.cyan}📚 Buscando usuário...${colors.reset}`);
    const usersResponse = await axios.get(`${API_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const usuarios = usersResponse.data;
    const usuario = Array.isArray(usuarios) 
      ? usuarios.find(u => u.email === emailUsuario)
      : usuarios;

    if (!usuario) {
      console.log(`${colors.red}❌ Usuário não encontrado: ${emailUsuario}${colors.reset}`);
      console.log(`${colors.yellow}💡 Usuários disponíveis:${colors.reset}`);
      if (Array.isArray(usuarios)) {
        usuarios.forEach(u => console.log(`   - ${u.email}`));
      }
      return;
    }

    console.log(`   Usuário encontrado: ${usuario.nome} (${usuario.email})\n`);

    // Atualizar senha (precisa fazer hash no backend)
    // Como não temos endpoint direto, vamos usar SQL ou criar um endpoint
    console.log(`${colors.yellow}⚠️  Não há endpoint direto para resetar senha${colors.reset}`);
    console.log(`${colors.cyan}💡 Opções:${colors.reset}`);
    console.log(`   1. Criar um novo usuário com o mesmo email (vai dar erro de duplicado)`);
    console.log(`   2. Executar SQL diretamente no Supabase`);
    console.log(`   3. Usar o endpoint de atualização de usuário (se existir)\n`);

    // Tentar atualizar via endpoint de usuários
    try {
      // Primeiro, vamos verificar se existe endpoint de atualização
      const updateResponse = await axios.patch(
        `${API_URL}/auth/users/${usuario.id}`,
        { senha: novaSenha },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log(`${colors.green}✅ Senha atualizada com sucesso!${colors.reset}\n`);
    } catch (updateError) {
      if (updateError.response?.status === 400 || updateError.response?.status === 404) {
        console.log(`${colors.yellow}⚠️  Endpoint de atualização não suporta senha diretamente${colors.reset}`);
        console.log(`${colors.cyan}📝 Execute este SQL no Supabase SQL Editor:${colors.reset}\n`);
        
        // Gerar hash da senha (simplificado - na prática precisa usar bcrypt)
        console.log(`${colors.yellow}SQL para resetar senha:${colors.reset}`);
        console.log(`${colors.cyan}-- Execute no Supabase SQL Editor${colors.reset}`);
        console.log(`${colors.cyan}-- IMPORTANTE: Substitua 'HASH_DA_SENHA' pelo hash bcrypt da nova senha${colors.reset}\n`);
        console.log(`UPDATE usuarios SET senha_hash = 'HASH_DA_SENHA' WHERE email = '${emailUsuario}';\n`);
        
        console.log(`${colors.yellow}💡 Ou use o script de criar usuário para criar um novo:${colors.reset}`);
        console.log(`${colors.cyan}   node scripts/criar-usuario.js${colors.reset}\n`);
      } else {
        throw updateError;
      }
    }

  } catch (error) {
    if (error.response) {
      console.error(`${colors.red}❌ Erro:${colors.reset}`, error.response.data || error.message);
    } else {
      console.error(`${colors.red}❌ Erro:${colors.reset}`, error.message);
    }
  }
}

// Pegar email e senha da linha de comando
const emailUsuario = process.argv[2];
const novaSenha = process.argv[3];

if (!emailUsuario || !novaSenha) {
  console.log(`${colors.yellow}⚠️  Uso: node scripts/resetar-senha.js <email> <nova-senha>${colors.reset}`);
  console.log(`${colors.yellow}   Exemplo: node scripts/resetar-senha.js dudemkt@gmail.com MinhaNovaSenha123!${colors.reset}\n`);
  console.log(`${colors.cyan}💡 IMPORTANTE:${colors.reset}`);
  console.log(`${colors.cyan}   - A senha deve ter pelo menos 6 caracteres${colors.reset}`);
  console.log(`${colors.cyan}   - Deve conter pelo menos uma letra maiúscula, uma minúscula e um número${colors.reset}\n`);
  process.exit(1);
}

resetarSenha(emailUsuario, novaSenha);




