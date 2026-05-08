import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { User, UserRole, SubscriptionTier } from '../auth/entities/user.entity';
import * as path from 'path';
import * as fs from 'fs';

// Carregar variáveis de ambiente
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else {
  console.warn('⚠️  Arquivo .env não encontrado. Usando variáveis de ambiente do sistema.');
}

async function createAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado ao banco de dados');

    const userRepository = dataSource.getRepository(User);

    // Credenciais do admin
    const adminEmail = 'dai@gmail.com';
    const adminPassword = 'Senha123';
    const adminName = 'Daiane Admin';

    // Verificar se o usuário já existe
    const existingUser = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log(`⚠️  Usuário com email ${adminEmail} já existe!`);
      
      // Verificar se a senha está correta
      if (existingUser.senha_hash) {
        const isPasswordValid = await bcrypt.compare(adminPassword, existingUser.senha_hash);
        
        if (isPasswordValid) {
          console.log('✅ Senha está correta!');
          
          // Verificar se é admin
          if (existingUser.role === UserRole.ADMIN) {
            console.log('✅ Usuário já é admin!');
            console.log(`📧 Email: ${existingUser.email}`);
            console.log(`👤 Nome: ${existingUser.nome}`);
            console.log(`🔑 Role: ${existingUser.role}`);
          } else {
            console.log('⚠️  Usuário existe mas não é admin. Atualizando para admin...');
            existingUser.role = UserRole.ADMIN;
            await userRepository.save(existingUser);
            console.log('✅ Usuário atualizado para admin!');
          }
        } else {
          console.log('❌ Senha está incorreta!');
          console.log('💡 Atualizando senha...');
          
          // Atualizar senha
          const senha_hash = await bcrypt.hash(adminPassword, 10);
          existingUser.senha_hash = senha_hash;
          existingUser.role = UserRole.ADMIN;
          await userRepository.save(existingUser);
          console.log('✅ Senha atualizada e usuário promovido a admin!');
        }
      } else {
        console.log('⚠️  Usuário existe mas não tem senha. Criando senha...');
        const senha_hash = await bcrypt.hash(adminPassword, 10);
        existingUser.senha_hash = senha_hash;
        existingUser.role = UserRole.ADMIN;
        await userRepository.save(existingUser);
        console.log('✅ Senha criada e usuário promovido a admin!');
      }
    } else {
      console.log(`📝 Criando usuário admin: ${adminEmail}`);
      
      // Hash da senha
      const senha_hash = await bcrypt.hash(adminPassword, 10);

      // Criar usuário admin
      const adminUser = userRepository.create({
        email: adminEmail,
        nome: adminName,
        senha_hash,
        role: UserRole.ADMIN,
        subscription_tier: SubscriptionTier.PREMIUM_FIT,
        email_verificado: true,
        ativo: true,
      });

      await userRepository.save(adminUser);
      console.log('✅ Usuário admin criado com sucesso!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Senha: ${adminPassword}`);
      console.log(`👤 Nome: ${adminName}`);
      console.log(`🔐 Role: admin`);
    }

    await dataSource.destroy();
    console.log('✅ Conexão fechada');
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

createAdmin();
