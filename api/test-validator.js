const { validateSync } = require('class-validator');
const { plainToInstance } = require('class-transformer');
const { IsArray, IsString, IsOptional } = require('class-validator');

class UpdateTreinoDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoria_ids;

  @IsOptional()
  @IsArray()
  exercicios_detalhados;
  
  @IsOptional()
  @IsArray()
  grupos_musculares;
  
  @IsOptional()
  @IsArray()
  tags;
}

const payload1 = {
  categoria_ids: [""],
  exercicios_detalhados: [],
  grupos_musculares: [""],
  tags: [""]
};

const payload2 = {
  categoria_ids: "",
  exercicios_detalhados: "",
  grupos_musculares: "",
  tags: ""
};

const instance1 = plainToInstance(UpdateTreinoDto, payload1);
console.log('Payload 1 errors:', validateSync(instance1).map(e => e.constraints));

const instance2 = plainToInstance(UpdateTreinoDto, payload2);
console.log('Payload 2 errors:', validateSync(instance2).map(e => e.constraints));
