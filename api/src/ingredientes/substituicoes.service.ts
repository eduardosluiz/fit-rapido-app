import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubstituicaoUsuario } from './entities/substituicao-usuario.entity';
import { ReceitaIngrediente } from './entities/receita-ingrediente.entity';
import { Receita } from '../receitas/entities/receita.entity';
import { Ingrediente } from './entities/ingrediente.entity';
import { CreateSubstituicaoDto } from './dto/substituicao.dto';

export interface Macros {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras: number;
  sodio: number;
}

@Injectable()
export class SubstituicoesService {
  constructor(
    @InjectRepository(SubstituicaoUsuario)
    private substituicaoRepository: Repository<SubstituicaoUsuario>,
    @InjectRepository(ReceitaIngrediente)
    private receitaIngredienteRepository: Repository<ReceitaIngrediente>,
    @InjectRepository(Receita)
    private receitaRepository: Repository<Receita>,
    @InjectRepository(Ingrediente)
    private ingredienteRepository: Repository<Ingrediente>,
  ) {}

  async create(usuarioId: string, createDto: CreateSubstituicaoDto): Promise<SubstituicaoUsuario> {
    const substituicao = this.substituicaoRepository.create({
      ...createDto,
      usuario_id: usuarioId,
      unidade: createDto.unidade || 'g',
    });

    return await this.substituicaoRepository.save(substituicao);
  }

  async findByUsuario(usuarioId: string, receitaId?: string): Promise<SubstituicaoUsuario[]> {
    const where: any = { usuario_id: usuarioId };
    if (receitaId) {
      where.receita_id = receitaId;
    }

    return await this.substituicaoRepository.find({
      where,
      relations: ['ingrediente_original', 'ingrediente_substituto', 'receita'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Busca histórico de substituições do usuário (todas as receitas)
   */
  async findHistorico(usuarioId: string, limit: number = 20): Promise<SubstituicaoUsuario[]> {
    return await this.substituicaoRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['ingrediente_original', 'ingrediente_substituto', 'receita'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Busca substituições frequentes do usuário
   */
  async findFrequentes(usuarioId: string, limit: number = 5): Promise<
    Array<{
      ingrediente_original: Ingrediente;
      ingrediente_substituto: Ingrediente;
      count: number;
    }>
  > {
    const substituicoes = await this.substituicaoRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['ingrediente_original', 'ingrediente_substituto'],
    });

    // Agrupar por par de ingredientes
    const frequencias = new Map<string, {
      ingrediente_original: Ingrediente;
      ingrediente_substituto: Ingrediente;
      count: number;
    }>();

    substituicoes.forEach((sub) => {
      const key = `${sub.ingrediente_original_id}-${sub.ingrediente_substituto_id}`;
      if (!frequencias.has(key)) {
        frequencias.set(key, {
          ingrediente_original: sub.ingrediente_original,
          ingrediente_substituto: sub.ingrediente_substituto,
          count: 0,
        });
      }
      frequencias.get(key)!.count++;
    });

    return Array.from(frequencias.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async remove(id: string, usuarioId: string): Promise<void> {
    const substituicao = await this.substituicaoRepository.findOne({
      where: { id, usuario_id: usuarioId },
    });

    if (!substituicao) {
      throw new NotFoundException('Substituição não encontrada');
    }

    await this.substituicaoRepository.remove(substituicao);
  }

  /**
   * Calcula macros da receita original baseado nos ingredientes cadastrados
   */
  async calcularMacrosReceita(
    receitaId: string,
  ): Promise<Macros> {
    const receita = await this.receitaRepository.findOne({
      where: { id: receitaId },
    });

    if (!receita) {
      throw new NotFoundException('Receita não encontrada');
    }

    const receitaIngredientes = await this.receitaIngredienteRepository.find({
      where: { receita_id: receitaId },
      relations: ['ingrediente'],
      order: { ordem: 'ASC' },
    });

    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarboidratos = 0;
    let totalGorduras = 0;
    let totalFibras = 0;
    let totalSodio = 0;

    for (const ri of receitaIngredientes) {
      // Se ingrediente está cadastrado, usar dados do banco
      if (ri.ingrediente_id && ri.ingrediente) {
        const ingrediente = ri.ingrediente;
        const unidadeBase = parseFloat(ingrediente.unidade_base.replace('g', '').replace('ml', ''));
        const fator = ri.quantidade / unidadeBase;

        totalCalorias += Number(ingrediente.calorias) * fator;
        totalProteinas += Number(ingrediente.proteinas) * fator;
        totalCarboidratos += Number(ingrediente.carboidratos) * fator;
        totalGorduras += Number(ingrediente.gorduras) * fator;
        totalFibras += (Number(ingrediente.fibras) || 0) * fator;
        totalSodio += (Number(ingrediente.sodio) || 0) * fator;
      }
      // Se não está cadastrado, não pode calcular (mas não quebra)
    }

    // Dividir pelo número de porções
    const porcoes = receita.porcoes || 1;

    return {
      calorias: Number((totalCalorias / porcoes).toFixed(2)),
      proteinas: Number((totalProteinas / porcoes).toFixed(2)),
      carboidratos: Number((totalCarboidratos / porcoes).toFixed(2)),
      gorduras: Number((totalGorduras / porcoes).toFixed(2)),
      fibras: Number((totalFibras / porcoes).toFixed(2)),
      sodio: Number((totalSodio / porcoes).toFixed(2)),
    };
  }

  /**
   * Calcula macros com substituições aplicadas
   */
  async calcularMacrosComSubstituicao(
    receitaId: string,
    usuarioId?: string,
  ): Promise<{
    macrosOriginal: Macros;
    macrosModificado: Macros;
    diferenca: Macros;
  }> {
    // Calcular macros originais
    const macrosOriginal = await this.calcularMacrosReceita(receitaId);

    // Buscar substituições do usuário (se fornecido)
    let substituicoes: SubstituicaoUsuario[] = [];
    if (usuarioId) {
      substituicoes = await this.findByUsuario(usuarioId, receitaId);
    }

    // Calcular macros modificados
    const macrosModificado = { ...macrosOriginal };

    for (const sub of substituicoes) {
      const ingredienteOriginal = sub.ingrediente_original;
      const ingredienteSubstituto = sub.ingrediente_substituto;

      // Remover macros do ingrediente original
      const unidadeBaseOriginal = parseFloat(
        ingredienteOriginal.unidade_base.replace('g', '').replace('ml', ''),
      );
      const fatorOriginal = sub.quantidade / unidadeBaseOriginal;

      macrosModificado.calorias -= Number(ingredienteOriginal.calorias) * fatorOriginal;
      macrosModificado.proteinas -= Number(ingredienteOriginal.proteinas) * fatorOriginal;
      macrosModificado.carboidratos -= Number(ingredienteOriginal.carboidratos) * fatorOriginal;
      macrosModificado.gorduras -= Number(ingredienteOriginal.gorduras) * fatorOriginal;
      macrosModificado.fibras -= (Number(ingredienteOriginal.fibras) || 0) * fatorOriginal;
      macrosModificado.sodio -= (Number(ingredienteOriginal.sodio) || 0) * fatorOriginal;

      // Adicionar macros do substituto
      const unidadeBaseSubstituto = parseFloat(
        ingredienteSubstituto.unidade_base.replace('g', '').replace('ml', ''),
      );
      const fatorSubstituto = sub.quantidade / unidadeBaseSubstituto;

      macrosModificado.calorias += Number(ingredienteSubstituto.calorias) * fatorSubstituto;
      macrosModificado.proteinas += Number(ingredienteSubstituto.proteinas) * fatorSubstituto;
      macrosModificado.carboidratos += Number(ingredienteSubstituto.carboidratos) * fatorSubstituto;
      macrosModificado.gorduras += Number(ingredienteSubstituto.gorduras) * fatorSubstituto;
      macrosModificado.fibras += (Number(ingredienteSubstituto.fibras) || 0) * fatorSubstituto;
      macrosModificado.sodio += (Number(ingredienteSubstituto.sodio) || 0) * fatorSubstituto;
    }

    // Arredondar valores
    macrosModificado.calorias = Number(macrosModificado.calorias.toFixed(2));
    macrosModificado.proteinas = Number(macrosModificado.proteinas.toFixed(2));
    macrosModificado.carboidratos = Number(macrosModificado.carboidratos.toFixed(2));
    macrosModificado.gorduras = Number(macrosModificado.gorduras.toFixed(2));
    macrosModificado.fibras = Number(macrosModificado.fibras.toFixed(2));
    macrosModificado.sodio = Number(macrosModificado.sodio.toFixed(2));

    // Calcular diferença
    const diferenca: Macros = {
      calorias: Number((macrosModificado.calorias - macrosOriginal.calorias).toFixed(2)),
      proteinas: Number((macrosModificado.proteinas - macrosOriginal.proteinas).toFixed(2)),
      carboidratos: Number((macrosModificado.carboidratos - macrosOriginal.carboidratos).toFixed(2)),
      gorduras: Number((macrosModificado.gorduras - macrosOriginal.gorduras).toFixed(2)),
      fibras: Number((macrosModificado.fibras - macrosOriginal.fibras).toFixed(2)),
      sodio: Number((macrosModificado.sodio - macrosOriginal.sodio).toFixed(2)),
    };

    return {
      macrosOriginal,
      macrosModificado,
      diferenca,
    };
  }
}

