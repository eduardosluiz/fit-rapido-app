import { 
  IsEmail, 
  IsNotEmpty, 
  MinLength, 
  IsOptional, 
  IsString, 
  IsBoolean,
  MaxLength,
  Matches,
  IsEnum,
  IsArray,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @MaxLength(255, { message: 'Email muito longo' })
  email: string;

  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, { message: 'Nome deve conter apenas letras e espaços' })
  nome: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  @MaxLength(100, { message: 'Senha deve ter no máximo 100 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
  })
  senha: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @MaxLength(255, { message: 'Email muito longo' })
  email: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MaxLength(100, { message: 'Senha muito longa' })
  senha: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  dieta_atual?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alergias?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @IsEnum(['user', 'admin', 'personal_trainer'], { message: 'Role inválido' })
  role?: 'user' | 'admin' | 'personal_trainer';

  @IsOptional()
  @IsEnum(['none', 'basic', 'free', 'premium', 'premium_fit'], { message: 'Subscription tier inválido' })
  subscription_tier?: 'none' | 'basic' | 'free' | 'premium' | 'premium_fit';

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsString()
  dieta_atual?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alergias?: string[];
}

