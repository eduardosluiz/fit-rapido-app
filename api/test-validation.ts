import { validateSync, IsArray, IsString, IsOptional } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import 'reflect-metadata';

class UpdateTreinoDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoria_ids?: string[];

  @IsOptional()
  @IsArray()
  exercicios_detalhados?: any[];
  
  @IsOptional()
  @IsArray()
  grupos_musculares?: string[];
  
  @IsOptional()
  @IsArray()
  tags?: string[];
}

const payload = {
  categoria_ids: [],
  exercicios_detalhados: [],
  grupos_musculares: [],
  tags: []
};

const instance = plainToInstance(UpdateTreinoDto, payload);
const errors = validateSync(instance);
console.log('Errors:', JSON.stringify(errors.map(e => e.constraints), null, 2));
