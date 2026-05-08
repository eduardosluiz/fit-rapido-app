# Contexto Fit-Rápido App

Este arquivo contém as diretrizes de desenvolvimento e decisões de design tomadas para este projeto específico.

## Padrões de UI (Admin Corporativo)
- **Botões:** Devem ser retangulares com `border-radius: 6px`. Evitar formato "pílula".
- **Inputs e Textareas:** Usar caixas completas (border total) com `border-gray-400` e fundo sutil `bg-gray-100`.
- **Tipografia:** Labels em `UPPERCASE`, `text-[9px]` e `font-bold`. Placeholders em `text-gray-500`.
- **Contraste:** Priorizar legibilidade alta contra fundos brancos.
## Regras de API e Backend
- **Uploads:** No frontend (`lib/upload.ts`), sempre verificar se a URL retornada começa com `http` antes de concatenar a `API_URL`.
- **Status:** O campo de status ativo para modalidades deve ser sempre `ativo` (booleano), nunca `ativa`.
- **Storage:** O backend usa `SERVICE_ROLE_KEY` para uploads e o bucket padrão é `treinos`.
- **IA Nutricional:** O prompt da IA deve começar com a frase da Daiane sobre substituições e processar kcal, proteínas, carbos, gorduras, fibras e sódio.
- **Assinaturas:** Planos Mensal, Trimestral e Anual ativos. Plano Semestral removido.

## Organização de Páginas
- **Receitas (Mobile):** 
    - Estrelas (topo esquerdo) e Favoritos (topo direito) sobre a imagem.
    - Títulos de seção em 18px com ícones; conteúdo em 16px.
    - Vídeo com thumbnail automática e fullscreen nativo.
- **Botões de Ação:** Usar botões simples "Salvar" e "Cancelar" no final dos formulários, integrados ao fluxo da página. No Mobile, botões de assinatura usam gradiente dourado e formato pílula.

## Roadmap de Próximas Melhorias
- **UI Categorias:** Tornar botões de categorias mais visíveis com efeito 3D/relevo.
- **Layout de Cards:** Centralizar e ajustar o redimensionamento das imagens de capa das receitas para melhor exibição.
- **Filtros:** Corrigir bug onde o filtro de "Receitas de 10 minutos" não respeita outros filtros de categoria/refeição selecionados.
- **Cadastro:** Adicionar checkbox de aceite de Termos de Uso e Política de Privacidade no fluxo de registro.
- **IA Restrita:** Implementar travas no prompt para que a IA responda exclusivamente sobre a receita atual que está sendo visualizada.
- **A estética Geral:** Adicionar mais elementos visuais e imagens de apoio para tornar o aplicativo mais colorido e vibrante.

---
**Última Atualização:** 20/03/2026 - Correção da navegação de abas (reset stack), atualização dos planos de assinatura e definição do roadmap de melhorias.
