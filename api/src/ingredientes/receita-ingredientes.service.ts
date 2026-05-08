import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceitaIngrediente } from './entities/receita-ingrediente.entity';
import { Receita } from '../receitas/entities/receita.entity';
import { CreateReceitaIngredienteDto, UpdateReceitaIngredienteDto } from './dto/receita-ingrediente.dto';

@Injectable()
export class ReceitaIngredientesService {
  constructor(
    @InjectRepository(ReceitaIngrediente)
    private receitaIngredienteRepository: Repository<ReceitaIngrediente>,
    @InjectRepository(Receita)
    private receitaRepository: Repository<Receita>,
  ) {}

  async create(createDto: CreateReceitaIngredienteDto): Promise<ReceitaIngrediente> {
    // Verificar se receita existe
    const receita = await this.receitaRepository.findOne({
      where: { id: createDto.receita_id },
    });

    if (!receita) {
      throw new NotFoundException('Receita não encontrada');
    }

    // Verificar se ingrediente existe (se fornecido)
    if (createDto.ingrediente_id) {
      // Validação será feita pela foreign key
    }

    const receitaIngrediente = this.receitaIngredienteRepository.create({
      ...createDto,
      ordem: createDto.ordem || 0,
    });

    return await this.receitaIngredienteRepository.save(receitaIngrediente);
  }

  async findByReceita(receitaId: string): Promise<ReceitaIngrediente[]> {
    return await this.receitaIngredienteRepository.find({
      where: { receita_id: receitaId },
      relations: ['ingrediente'],
      order: { ordem: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ReceitaIngrediente> {
    const receitaIngrediente = await this.receitaIngredienteRepository.findOne({
      where: { id },
      relations: ['ingrediente', 'receita'],
    });

    if (!receitaIngrediente) {
      throw new NotFoundException('Ingrediente da receita não encontrado');
    }

    return receitaIngrediente;
  }

  async update(id: string, updateDto: UpdateReceitaIngredienteDto): Promise<ReceitaIngrediente> {
    const receitaIngrediente = await this.findOne(id);
    Object.assign(receitaIngrediente, updateDto);
    return await this.receitaIngredienteRepository.save(receitaIngrediente);
  }

  async remove(id: string): Promise<void> {
    const receitaIngrediente = await this.findOne(id);
    await this.receitaIngredienteRepository.remove(receitaIngrediente);
  }

  async removeByReceita(receitaId: string): Promise<void> {
    await this.receitaIngredienteRepository.delete({ receita_id: receitaId });
  }

  async updateOrdem(receitaId: string, ingredientesIds: string[]): Promise<void> {
    const receitaIngredientes = await this.findByReceita(receitaId);

    for (let i = 0; i < ingredientesIds.length; i++) {
      const ri = receitaIngredientes.find((r) => r.id === ingredientesIds[i]);
      if (ri) {
        ri.ordem = i;
        await this.receitaIngredienteRepository.save(ri);
      }
    }
  }
}

