const axios = require('axios');

async function testLogin() {
  const emails = ['admin@fitrapido.com'];
  const senhas = ['Admin123!', 'admin123', 'Admin123'];
  
  for (const email of emails) {
    for (const senha of senhas) {
      try {
        const response = await axios.post('http://localhost:3001/auth/login', {
          email,
          senha,
        });
        console.log(`✅ SUCESSO! Email: ${email}, Senha: ${senha}`);
        console.log(`   Role: ${response.data.user.role}`);
        return;
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`❌ Falhou: ${email} / ${senha}`);
        } else {
          console.log(`⚠️  Erro: ${error.message}`);
        }
      }
    }
  }
}

testLogin();




