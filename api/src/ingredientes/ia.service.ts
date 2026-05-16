import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ConsultaIA } from './entities/consulta-ia.entity';
import { Receita } from '../receitas/entities/receita.entity';
import { ReceitaIngrediente } from './entities/receita-ingrediente.entity';
import { Ingrediente } from './entities/ingrediente.entity';
import { CreateConsultaIADto } from './dto/consulta-ia.dto';

@Injectable()
export class IAService {
  private readonly logger = new Logger(IAService.name);
  private openai: OpenAI | null = null;

  constructor(
    @InjectRepository(ConsultaIA)
    private consultaIARepository: Repository<ConsultaIA>,
    @InjectRepository(Receita)
    private receitaRepository: Repository<Receita>,
    @InjectRepository(ReceitaIngrediente)
    private receitaIngredienteRepository: Repository<ReceitaIngrediente>,
    @InjectRepository(Ingrediente)
    private ingredienteRepository: Repository<Ingrediente>,
    private configService: ConfigService,
  ) {
    // Inicializar OpenAI apenas se a chave estiver configurada
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      this.logger.log('✅ OpenAI configurado com sucesso');
    } else {
      this.logger.warn('⚠️ OPENAI_API_KEY não configurada. Funcionalidade de IA desabilitada.');
    }
  }

  async consultarIA(
    usuarioId: string,
    createDto: CreateConsultaIADto,
  ): Promise<ConsultaIA> {
    // Verificar se receita existe
    const receita = await this.receitaRepository.findOne({
      where: { id: createDto.receita_id },
      relations: ['categorias'],
    });

    if (!receita) {
      throw new NotFoundException('Receita não encontrada');
    }

    // Buscar ingredientes da receita
    const ingredientesReceita = await this.receitaIngredienteRepository.find({
      where: { receita_id: createDto.receita_id },
      relations: ['ingrediente'],
      order: { ordem: 'ASC' },
    });

    // Criar consulta no banco
    const consulta = this.consultaIARepository.create({
      usuario_id: usuarioId,
      receita_id: createDto.receita_id,
      pergunta: createDto.pergunta,
    });

    // Se OpenAI não estiver configurado, retornar mensagem padrão
    if (!this.openai) {
      consulta.resposta_ia =
        'Funcionalidade de IA temporariamente indisponível. Por favor, entre em contato com o suporte.';
      return await this.consultaIARepository.save(consulta);
    }

    try {
      // Preparar contexto da receita
      const contextoReceita = this.prepararContextoReceita(
        receita,
        ingredientesReceita,
      );
      // Chamar OpenAI
      const resposta = await this.chamarOpenAI(
        createDto.pergunta,
        contextoReceita,
        receita,
      );

      consulta.resposta_ia = resposta.texto;
      consulta.substituicao_sugerida = resposta.substituicao;

      this.logger.log(`✅ Consulta IA processada para receita ${receita.id}`);
    } catch (error) {
      this.logger.error(`❌ Erro ao processar consulta IA: ${error.message}`, error.stack);
      consulta.resposta_ia =
        'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente mais tarde.';
      throw error;
    }

    return await this.consultaIARepository.save(consulta);
  }

  private prepararContextoReceita(
    receita: Receita,
    ingredientesReceita: ReceitaIngrediente[],
  ): string {
    const ingredientesTexto = ingredientesReceita
      .map((ri) => {
        const nome = ri.ingrediente?.nome || ri.ingrediente_texto;
        const quantidade = ri.quantidade;
        const unidade = ri.unidade || 'g';
        return `- ${nome}: ${quantidade}${unidade}`;
      })
      .join('\n');

    return `
RECEITA: ${receita.titulo}
${receita.descricao ? `DESCRIÇÃO: ${receita.descricao}` : ''}

INGREDIENTES:
${ingredientesTexto}

PORÇÕES: ${receita.porcoes}
TEMPO DE PREPARO: ${receita.tempo_preparo} minutos
DIFICULDADE: ${receita.dificuldade}
${receita.calorias ? `CALORIAS POR PORÇÃO: ${receita.calorias} kcal` : ''}
${receita.proteinas ? `PROTEÍNAS POR PORÇÃO: ${receita.proteinas}g` : ''}
${receita.carboidratos ? `CARBOIDRATOS POR PORÇÃO: ${receita.carboidratos}g` : ''}
${receita.gorduras ? `GORDURAS POR PORÇÃO: ${receita.gorduras}g` : ''}
${receita.fibras ? `FIBRAS POR PORÇÃO: ${receita.fibras}g` : ''}
${receita.sodio ? `SÓDIO POR PORÇÃO: ${receita.sodio}mg` : ''}
`.trim();
  }

  private async chamarOpenAI(
    pergunta: string,
    contextoReceita: string,
    receita: Receita,
  ): Promise<{
    texto: string;
    substituicao?: {
      ingrediente_original: string;
      ingrediente_substituto: string;
      quantidade_original: number;
      quantidade_substituto: number;
      unidade: string;
      razao: string;
    } | null;
  }> {
    const systemPrompt = `Você é um assistente especializado em nutrição e culinária saudável do aplicativo Fit & Rápido.
Sua função é ajudar usuários a fazer substituições de ingredientes em receitas, mantendo o sabor e a qualidade nutricional.

DIRETRIZES DE RESPOSTA:
1. IDENTIDADE: Se houver sugestões de substituições pré-definidas na receita, comece SEMPRE sua resposta com: "A Daiane indica usar [ingrediente_sugerido] para essa receita, alterar ingrediente por outro de sua vontade, pode mudar o resultado final da receita". Substitua [ingrediente_sugerido] pelos ingredientes sugeridos no contexto.
2. ANÁLISE: Analise a receita e os ingredientes fornecidos.
3. SUBSTITUIÇÕES: Sugira substituições adequadas considerando sabor, textura e propriedades nutricionais.
4. CÁLCULO NUTRICIONAL: Tente estimar como a substituição afetará as calorias e os macros (proteínas, carboidratos, gorduras, fibras e sódio). Use os dados nutricionais fornecidos como base.
5. TOM DE VOZ: Seja amigável, profissional e objetivo. Responda em português brasileiro.

REGRAS CRÍTICAS DE RESTRIÇÃO:
- Responda APENAS sobre os ingredientes, preparo ou substituições desta receita específica.
- Se o usuário perguntar algo que NÃO seja sobre esta receita (ex: outras receitas, política, esportes, ou dicas gerais fora deste contexto), responda educadamente: "Desculpe, como seu assistente Fit & Rápido, estou aqui para te ajudar exclusivamente com as dúvidas sobre a receita atual."

Se o usuário perguntar sobre algo que já tem uma substituição sugerida na receita, reforce a indicação da Daiane primeiro.`;

    const userPrompt = `
CONTEXTO DA RECEITA:
${contextoReceita}

SUBSTITUIÇÕES SUGERIDAS PELA DAIANE:
${JSON.stringify(receita.substituicoes_ingredientes || {}, null, 2)}

PERGUNTA DO USUÁRIO: ${pergunta}

Por favor, forneça uma resposta completa seguindo as diretrizes.`;

    try {
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini', // Modelo mais econômico e rápido
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const respostaTexto = completion.choices[0]?.message?.content || 'Não foi possível gerar uma resposta.';

      // Tentar extrair informações de substituição da resposta (opcional)
      // Por enquanto, retornamos apenas o texto
      return {
        texto: respostaTexto,
        substituicao: null, // Pode ser melhorado no futuro para extrair automaticamente
      };
    } catch (error: any) {
      this.logger.error(`Erro ao chamar OpenAI: ${error.message}`);
      throw new BadRequestException(
        `Erro ao processar consulta com IA: ${error.message}`,
      );
    }
  }

  async findByUsuario(usuarioId: string, receitaId?: string): Promise<ConsultaIA[]> {
    const where: any = { usuario_id: usuarioId };
    if (receitaId) {
      where.receita_id = receitaId;
    }

    return await this.consultaIARepository.find({
      where,
      relations: ['receita'],
      order: { created_at: 'DESC' },
      take: 50, // Limitar últimas 50 consultas
    });
  }

  async marcarComoAplicada(consultaId: string, usuarioId: string): Promise<ConsultaIA> {
    const consulta = await this.consultaIARepository.findOne({
      where: { id: consultaId, usuario_id: usuarioId },
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    consulta.aplicada = true;
    return await this.consultaIARepository.save(consulta);
  }
}



