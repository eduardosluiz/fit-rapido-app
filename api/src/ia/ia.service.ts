import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class IAService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async responderDuvidaIngredientes(pergunta: string, receita: any) {
    const ingredientesTexto = receita.ingredientes
      .map((ing: any) => `${ing.quantidade} ${ing.nome}`)
      .join(', ');

    const prompt = `Frase da Daiane sobre substituições: "A substituição é uma aliada, mas a base da receita é o que garante o resultado planejado. Se for trocar, faça com consciência nutricional."

    Você é o Assistente Nutricional do Fit & Rápido. Sua função é EXCLUSIVAMENTE responder sobre a receita atual: "${receita.titulo}".
    Ingredientes da receita: ${ingredientesTexto}.
    Informações nutricionais: ${receita.informacoes_nutricionais || 'Não informadas'}.

    REGRAS CRÍTICAS:
    1. Responda APENAS sobre os ingredientes, preparo ou substituições desta receita específica.
    2. Se o usuário perguntar algo que NÃO seja sobre esta receita (ex: outras receitas, política, esportes, ou dicas gerais fora deste contexto), responda educadamente: "Desculpe, como seu assistente Fit & Rápido, estou aqui para te ajudar exclusivamente com as dúvidas sobre a receita de ${receita.titulo}."
    3. Seja conciso, profissional e use termos de nutrição saudável.
    4. Comece sua primeira resposta sempre reforçando a importância do equilíbrio, mas sem repetir a frase da Daiane literalmente se não for necessário.

    Dúvida do Usuário: "${pergunta}"`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente especializado em nutrição e culinária saudável.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      return {
        resposta: response.choices[0].message.content,
      };
    } catch (error) {
      console.error('Erro na OpenAI:', error);
      throw new Error('Não foi possível processar sua dúvida agora.');
    }
  }

  async calcularDeltaSubstituicoes(ingredientes: string[], substituicoes: any[]) {
    const prompt = `Você é um calculista nutricional. Dada uma lista de ingredientes e uma lista de substituições sugeridas, calcule a diferença (delta) aproximada de macronutrientes para cada substituição.
A diferença deve ser o (Valor do Substituto) - (Valor do Ingrediente Original).
Retorne ESTRITAMENTE um objeto JSON onde a chave é o nome exato do ingrediente original, e o valor é um objeto contendo "substituto" (string) e "delta" (objeto com calorias, proteinas, carboidratos, gorduras, fibras, sodio - todos numéricos).

Ingredientes originais:
${ingredientes.join('\n')}

Substituições:
${JSON.stringify(substituicoes, null, 2)}

Exemplo de retorno JSON:
{
  "2 fatias de muçarela de búfala": {
    "substituto": "Tradicional",
    "delta": {
      "calorias": 30,
      "proteinas": 2,
      "carboidratos": 0,
      "gorduras": 4,
      "fibras": 0,
      "sodio": 120
    }
  }
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Você é uma API que retorna apenas JSON válido.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content || '{}');
    } catch (error) {
      console.error('Erro ao calcular deltas com IA:', error);
      return {};
    }
  }
}
