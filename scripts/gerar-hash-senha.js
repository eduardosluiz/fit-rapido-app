/**
 * Script para gerar hash bcrypt de uma senha
 * Gera o SQL pronto para executar no Supabase
 */

const bcrypt = require('bcrypt');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

async function gerarHashSenha(email, senha) {
  try {
    console.log(`${colors.cyan}🔐 Gerando hash da senha...${colors.reset}`);
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${senha.substring(0, 3)}***\n`);

    // Gerar hash bcrypt (10 rounds, padrão)
    const hash = await bcrypt.hash(senha, 10);

    console.log(`${colors.green}✅ Hash gerado com sucesso!${colors.reset}\n`);
    console.log(`${colors.cyan}📝 Execute este SQL no Supabase SQL Editor:${colors.reset}\n`);
    console.log(`${colors.yellow}═══════════════════════════════════════${colors.reset}`);
    console.log(`UPDATE usuarios`);
    console.log(`SET senha_hash = '${hash}'`);
    console.log(`WHERE email = '${email}';`);
    console.log(`${colors.yellow}═══════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.green}✅ Depois de executar o SQL, use essas credenciais no app:${colors.reset}`);
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${senha}\n`);

  } catch (error) {
    console.error(`${colors.red}❌ Erro:${colors.reset}`, error.message);
  }
}

// Pegar email e senha da linha de comando
const email = process.argv[2] || 'dudemkt@gmail.com';
const senha = process.argv[3] || 'Senha123!';

if (!process.argv[3]) {
  console.log(`${colors.yellow}⚠️  Uso: node scripts/gerar-hash-senha.js <email> <senha>${colors.reset}`);
  console.log(`${colors.yellow}   Exemplo: node scripts/gerar-hash-senha.js dudemkt@gmail.com MinhaNovaSenha123!${colors.reset}\n`);
  console.log(`${colors.cyan}💡 Usando valores padrão:${colors.reset}`);
  console.log(`   Email: ${email}`);
  console.log(`   Senha: ${senha}\n`);
}

gerarHashSenha(email, senha);




