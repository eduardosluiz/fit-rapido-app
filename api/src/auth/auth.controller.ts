import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
  UseFilters,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateUserDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ThrottleExceptionFilter } from '../common/guards/throttle-exception.filter';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getAuthInfo() {
    return {
      message: 'API de Autenticação - Fit & Rápido',
      endpoints: {
        'POST /auth/register': 'Cadastrar novo usuário',
        'POST /auth/login': 'Fazer login',
        'GET /auth/profile': 'Obter perfil do usuário (requer autenticação)',
        'GET /auth/users': 'Listar todos os usuários (requer admin)',
      },
      exemplo: {
        register: {
          method: 'POST',
          url: '/auth/register',
          body: {
            email: 'usuario@example.com',
            nome: 'Nome do Usuário',
            senha: 'senha123',
          },
        },
        login: {
          method: 'POST',
          url: '/auth/login',
          body: {
            email: 'usuario@example.com',
            senha: 'senha123',
          },
        },
      },
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { ttl: 60000, limit: 3 } }) // 3 tentativas por minuto
  @UseFilters(ThrottleExceptionFilter)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 tentativas por minuto
  @UseFilters(ThrottleExceptionFilter)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.authService.findById(req.user.sub);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    const { senha_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  async getAllUsers(@Request() req) {
    // Verificar se o usuário é admin
    const currentUser = await this.authService.findById(req.user.sub);
    if (!currentUser) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    
    // Se não houver nenhum admin no sistema, permitir que qualquer usuário autenticado veja a lista
    // Isso permite criar o primeiro admin
    const adminCount = await this.authService.countAdmins();
    if (adminCount === 0) {
      // Se não há admins, retornar todos os usuários para permitir criar o primeiro admin
      return this.authService.findAll();
    }
    
    // Se já existem admins, apenas admins podem ver
    if (currentUser.role !== 'admin') {
      throw new UnauthorizedException('Acesso negado. Apenas administradores podem ver usuários.');
    }
    
    return this.authService.findAll();
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string, @Request() req) {
    // Verificar se o usuário é admin
    const currentUser = await this.authService.findById(req.user.sub);
    if (!currentUser) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    
    // Se não houver nenhum admin no sistema, permitir acesso
    const adminCount = await this.authService.countAdmins();
    if (adminCount === 0 || currentUser.role === 'admin') {
      const user = await this.authService.findById(id);
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }
      const { senha_hash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    
    throw new UnauthorizedException('Acesso negado. Apenas administradores podem ver usuários.');
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    // Verificar se o usuário é admin
    const currentUser = await this.authService.findById(req.user.sub);
    if (!currentUser) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    
    // Se não houver nenhum admin no sistema, permitir que qualquer usuário autenticado edite
    // Isso permite criar o primeiro admin
    const adminCount = await this.authService.countAdmins();
    if (adminCount === 0 || currentUser.role === 'admin') {
      return this.authService.updateUser(id, updateUserDto, currentUser.role);
    }
    
    throw new UnauthorizedException('Acesso negado. Apenas administradores podem editar usuários.');
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@Request() req) {
    await this.authService.deleteUser(req.user.sub);
  }
}
