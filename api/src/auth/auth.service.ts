import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole, SubscriptionTier } from './entities/user.entity';
import { RegisterDto, LoginDto, UpdateUserDto } from './dto/auth.dto';
import { canManuallyChangeSubscription, getSubscriptionChangeErrorMessage } from '../common/helpers/subscription-validation.helper';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, nome, senha } = registerDto;

    // Verificar se usuário já existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const now = new Date();
    const trialExpiresAt = new Date(now);
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 7); // 7 dias após cadastro

    const user = this.userRepository.create({
      email,
      nome,
      senha_hash,
      role: UserRole.USER,
      subscription_tier: SubscriptionTier.FREE, // Iniciar como FREE (trial)
      trial_expires_at: trialExpiresAt,
    });

    await this.userRepository.save(user);

    // Gerar token JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    // Remover senha_hash da resposta
    const { senha_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, senha } = loginDto;

    // Buscar usuário
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !user.senha_hash) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar token JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    // Remover senha_hash da resposta
    const { senha_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Omit<User, 'senha_hash'>[]> {
    const users = await this.userRepository.find({
      order: { created_at: 'DESC' },
    });
    // Remover senha_hash de todos os usuários
    return users.map(({ senha_hash: _, ...userWithoutPassword }) => userWithoutPassword as Omit<User, 'senha_hash'>);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, requestingUserRole?: UserRole): Promise<Omit<User, 'senha_hash'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o email já está em uso por outro usuário
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Atualizar campos
    if (updateUserDto.nome !== undefined) user.nome = updateUserDto.nome;
    if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
    if (updateUserDto.avatar_url !== undefined) user.avatar_url = updateUserDto.avatar_url;
    if (updateUserDto.role !== undefined) {
      user.role = updateUserDto.role as UserRole;
    }
    
    // Validar alteração de plano por ambiente
    if (updateUserDto.subscription_tier !== undefined) {
      const newTier = updateUserDto.subscription_tier as SubscriptionTier;
      
      // Verificar se pode alterar manualmente (validação por ambiente)
      const canChange = canManuallyChangeSubscription(user, newTier, requestingUserRole);
      
      if (!canChange) {
        throw new BadRequestException(getSubscriptionChangeErrorMessage(newTier));
      }
      
      user.subscription_tier = newTier;
    }
    
    if (updateUserDto.ativo !== undefined) {
      user.ativo = updateUserDto.ativo;
    }

    await this.userRepository.save(user);

    // Remover senha_hash da resposta
    const { senha_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'senha_hash'>;
  }

  async countAdmins(): Promise<number> {
    return this.userRepository.count({
      where: { role: UserRole.ADMIN },
    });
  }

  async checkTrialStatus(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.trial_expires_at) {
      return false;
    }
    return new Date() < new Date(user.trial_expires_at);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    await this.userRepository.delete(id);
  }
}

