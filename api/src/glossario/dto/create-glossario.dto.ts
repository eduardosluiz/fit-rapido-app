import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGlossarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;
}
