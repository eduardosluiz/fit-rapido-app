import { IsEnum, IsBoolean, IsString, IsOptional } from 'class-validator';
import { TipoConsentimento } from '../entities/consentimento.entity';

export class CreateConsentimentoDto {
  @IsEnum(TipoConsentimento)
  tipo: TipoConsentimento;

  @IsBoolean()
  aceito: boolean;

  @IsString()
  @IsOptional()
  versao?: string;
}

