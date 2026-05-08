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
        model: 'gpt-3.5-turbo', // ou gpt-4 se preferir
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
}
