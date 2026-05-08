import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface USDANutritionalData {
  nome: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras?: number;
  sodio?: number;
}

@Injectable()
export class USDAService {
  private readonly logger = new Logger(USDAService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.nal.usda.gov/fdc/v1';

  constructor(private configService: ConfigService) {
    // API Key do USDA (gratuita, mas precisa cadastrar)
    // Por enquanto, vamos tentar sem API key (pode funcionar para algumas buscas)
    this.apiKey = this.configService.get<string>('USDA_API_KEY') || '';
  }

  /**
   * Busca ingrediente na API USDA FoodData Central
   */
  async buscarIngrediente(nomeIngrediente: string): Promise<USDANutritionalData | null> {
    try {
      const searchQuery = nomeIngrediente.toLowerCase().trim();
      
      // Buscar alimentos
      const searchUrl = `${this.baseUrl}/foods/search`;
      const searchParams: any = {
        query: searchQuery,
        pageSize: 1,
        dataType: ['Foundation', 'SR Legacy'], // Tipos de dados mais confiáveis
      };

      if (this.apiKey) {
        searchParams.api_key = this.apiKey;
      }

      this.logger.log(`Buscando "${nomeIngrediente}" na API USDA...`);

      const searchResponse = await axios.get(searchUrl, {
        params: searchParams,
        timeout: 10000, // 10 segundos
      });

      if (!searchResponse.data || !searchResponse.data.foods || searchResponse.data.foods.length === 0) {
        this.logger.warn(`Nenhum resultado encontrado para "${nomeIngrediente}"`);
        return null;
      }

      const food = searchResponse.data.foods[0];
      const fdcId = food.fdcId;

      // Buscar detalhes nutricionais completos
      const detailsUrl = `${this.baseUrl}/food/${fdcId}`;
      const detailsParams: any = {};
      if (this.apiKey) {
        detailsParams.api_key = this.apiKey;
      }

      const detailsResponse = await axios.get(detailsUrl, {
        params: detailsParams,
        timeout: 10000,
      });

      const foodData = detailsResponse.data;

      // Extrair valores nutricionais (por 100g)
      const nutrients = foodData.foodNutrients || [];
      
      const getNutrientValue = (nutrientId: number): number => {
        const nutrient = nutrients.find((n: any) => n.nutrient?.id === nutrientId || n.nutrientId === nutrientId);
        return nutrient ? (nutrient.amount || 0) : 0;
      };

      // IDs de nutrientes do USDA (padrão)
      // 1008 = Energy (kcal)
      // 1003 = Protein
      // 1005 = Carbohydrate, by difference
      // 1004 = Total lipid (fat)
      // 1079 = Fiber, total dietary
      // 1093 = Sodium, Na

      const calorias = getNutrientValue(1008) || 0;
      const proteinas = getNutrientValue(1003) || 0;
      const carboidratos = getNutrientValue(1005) || 0;
      const gorduras = getNutrientValue(1004) || 0;
      const fibras = getNutrientValue(1079) || undefined;
      const sodio = getNutrientValue(1093) || undefined; // em mg

      if (calorias === 0 && proteinas === 0 && carboidratos === 0 && gorduras === 0) {
        this.logger.warn(`Ingrediente "${nomeIngrediente}" encontrado mas sem dados nutricionais válidos`);
        return null;
      }

      this.logger.log(`✅ Dados encontrados para "${nomeIngrediente}": ${calorias} kcal`);

      return {
        nome: foodData.description || nomeIngrediente,
        calorias: Number(calorias.toFixed(2)),
        proteinas: Number(proteinas.toFixed(2)),
        carboidratos: Number(carboidratos.toFixed(2)),
        gorduras: Number(gorduras.toFixed(2)),
        fibras: fibras ? Number(fibras.toFixed(2)) : undefined,
        sodio: sodio ? Number(sodio.toFixed(2)) : undefined,
      };

    } catch (error: any) {
      this.logger.error(`Erro ao buscar "${nomeIngrediente}" na API USDA:`, error.message);
      
      // Se for erro de API key, avisar mas não quebrar
      if (error.response?.status === 403 || error.response?.status === 401) {
        this.logger.warn('API Key do USDA não configurada ou inválida. Algumas buscas podem falhar.');
      }
      
      return null;
    }
  }

  /**
   * Verifica se a API está disponível
   */
  async verificarDisponibilidade(): Promise<boolean> {
    try {
      const testUrl = `${this.baseUrl}/foods/search`;
      const params: any = {
        query: 'apple',
        pageSize: 1,
      };
      
      if (this.apiKey) {
        params.api_key = this.apiKey;
      }

      await axios.get(testUrl, { params, timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

