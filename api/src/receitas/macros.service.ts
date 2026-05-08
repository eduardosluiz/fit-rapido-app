import { Injectable } from '@nestjs/common';
import { Receita } from './entities/receita.entity';

export interface MacrosCalculados {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras?: number;
  sodio?: number;
}

export interface MacrosPorPorcao {
  caloriasPorPorcao: number;
  proteinasPorPorcao: number;
  carboidratosPorPorcao: number;
  gordurasPorPorcao: number;
  fibrasPorPorcao?: number;
  sodioPorPorcao?: number;
}

@Injectable()
export class MacrosService {
  /**
   * Calcula macros para uma receita baseado no número de porções
   */
  calcularMacrosPorPorcao(
    receita: Receita,
    numeroPorcoes: number = 1,
  ): MacrosPorPorcao | null {
    if (!receita.calorias && !receita.proteinas && !receita.carboidratos && !receita.gorduras) {
      return null;
    }

    const porcoesOriginais = receita.porcoes || 1;
    const fatorMultiplicacao = numeroPorcoes / porcoesOriginais;

    return {
      caloriasPorPorcao: receita.calorias
        ? Number((receita.calorias * fatorMultiplicacao).toFixed(2))
        : 0,
      proteinasPorPorcao: receita.proteinas
        ? Number((receita.proteinas * fatorMultiplicacao).toFixed(2))
        : 0,
      carboidratosPorPorcao: receita.carboidratos
        ? Number((receita.carboidratos * fatorMultiplicacao).toFixed(2))
        : 0,
      gordurasPorPorcao: receita.gorduras
        ? Number((receita.gorduras * fatorMultiplicacao).toFixed(2))
        : 0,
      fibrasPorPorcao: receita.fibras
        ? Number((receita.fibras * fatorMultiplicacao).toFixed(2))
        : undefined,
      sodioPorPorcao: receita.sodio
        ? Number((receita.sodio * fatorMultiplicacao).toFixed(2))
        : undefined,
    };
  }

  /**
   * Calcula macros totais para múltiplas receitas
   */
  calcularMacrosTotais(receitas: Array<{ receita: Receita; porcoes: number }>): MacrosCalculados {
    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarboidratos = 0;
    let totalGorduras = 0;
    let totalFibras = 0;
    let totalSodio = 0;

    receitas.forEach(({ receita, porcoes }) => {
      const macros = this.calcularMacrosPorPorcao(receita, porcoes);
      if (macros) {
        totalCalorias += macros.caloriasPorPorcao;
        totalProteinas += macros.proteinasPorPorcao;
        totalCarboidratos += macros.carboidratosPorPorcao;
        totalGorduras += macros.gordurasPorPorcao;
        if (macros.fibrasPorPorcao) totalFibras += macros.fibrasPorPorcao;
        if (macros.sodioPorPorcao) totalSodio += macros.sodioPorPorcao;
      }
    });

    return {
      calorias: Number(totalCalorias.toFixed(2)),
      proteinas: Number(totalProteinas.toFixed(2)),
      carboidratos: Number(totalCarboidratos.toFixed(2)),
      gorduras: Number(totalGorduras.toFixed(2)),
      fibras: totalFibras > 0 ? Number(totalFibras.toFixed(2)) : undefined,
      sodio: totalSodio > 0 ? Number(totalSodio.toFixed(2)) : undefined,
    };
  }

  /**
   * Calcula percentual de cada macro em relação ao total de calorias
   */
  calcularPercentuaisMacros(macros: MacrosCalculados): {
    percentualProteinas: number;
    percentualCarboidratos: number;
    percentualGorduras: number;
  } {
    // 1g proteína = 4 kcal
    // 1g carboidrato = 4 kcal
    // 1g gordura = 9 kcal
    const caloriasProteinas = macros.proteinas * 4;
    const caloriasCarboidratos = macros.carboidratos * 4;
    const caloriasGorduras = macros.gorduras * 9;
    const totalCaloriasMacros = caloriasProteinas + caloriasCarboidratos + caloriasGorduras;

    if (totalCaloriasMacros === 0) {
      return {
        percentualProteinas: 0,
        percentualCarboidratos: 0,
        percentualGorduras: 0,
      };
    }

    return {
      percentualProteinas: Number(
        ((caloriasProteinas / totalCaloriasMacros) * 100).toFixed(1),
      ),
      percentualCarboidratos: Number(
        ((caloriasCarboidratos / totalCaloriasMacros) * 100).toFixed(1),
      ),
      percentualGorduras: Number(
        ((caloriasGorduras / totalCaloriasMacros) * 100).toFixed(1),
      ),
    };
  }

  /**
   * Calcula macros diários recomendados baseado em objetivos
   */
  calcularMacrosDiariosRecomendados(
    peso: number, // kg
    altura: number, // cm
    idade: number,
    genero: 'masculino' | 'feminino',
    nivelAtividade: 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso',
    objetivo: 'perder_peso' | 'manter_peso' | 'ganhar_peso',
  ): MacrosCalculados {
    // Cálculo de TMB (Taxa Metabólica Basal) usando fórmula de Mifflin-St Jeor
    let tmb: number;
    if (genero === 'masculino') {
      tmb = 10 * peso + 6.25 * altura - 5 * idade + 5;
    } else {
      tmb = 10 * peso + 6.25 * altura - 5 * idade - 161;
    }

    // Fatores de atividade
    const fatoresAtividade = {
      sedentario: 1.2,
      leve: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      muito_intenso: 1.9,
    };

    // Calorias totais diárias
    let caloriasDiarias = tmb * fatoresAtividade[nivelAtividade];

    // Ajuste por objetivo
    const ajustesObjetivo = {
      perder_peso: -500, // Déficit de 500 kcal
      manter_peso: 0,
      ganhar_peso: 500, // Superávit de 500 kcal
    };

    caloriasDiarias += ajustesObjetivo[objetivo];

    // Distribuição de macros (padrão: 30% proteínas, 40% carboidratos, 30% gorduras)
    const percentualProteinas = 0.3;
    const percentualCarboidratos = 0.4;
    const percentualGorduras = 0.3;

    const caloriasProteinas = caloriasDiarias * percentualProteinas;
    const caloriasCarboidratos = caloriasDiarias * percentualCarboidratos;
    const caloriasGorduras = caloriasDiarias * percentualGorduras;

    return {
      calorias: Math.round(caloriasDiarias),
      proteinas: Number((caloriasProteinas / 4).toFixed(1)), // 1g proteína = 4 kcal
      carboidratos: Number((caloriasCarboidratos / 4).toFixed(1)), // 1g carboidrato = 4 kcal
      gorduras: Number((caloriasGorduras / 9).toFixed(1)), // 1g gordura = 9 kcal
    };
  }
}

