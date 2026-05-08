import { IsString, IsEnum, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Plataforma } from '../entities/notification-token.entity';

export class RegisterTokenDto {
  @IsString()
  token: string;

  @IsEnum(Plataforma)
  plataforma: Plataforma;
}

export class SendNotificationDto {
  @IsString()
  @IsOptional()
  usuario_id?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  usuario_ids?: string[];

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsString()
  @IsOptional()
  data?: string; // JSON string com dados adicionais
}
