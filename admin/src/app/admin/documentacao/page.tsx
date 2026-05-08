'use client';

import { useAuth } from '@/lib/useAuth';
import { Card } from '@/components/admin/Card';

export default function DocumentacaoPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c8921a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6 sm:p-8 bg-gray-50 dark:bg-[#0f0f0f] min-h-screen">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">
        {/* Header padronizado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-gray-200 dark:border-[#333]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#c8921a]/10 to-[#c8921a]/5 dark:from-[#c8921a]/20 dark:to-[#c8921a]/10 rounded-xl shadow-sm">
              <i className="bx bx-book text-[#c8921a] text-2xl sm:text-3xl"></i>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Documentação
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1.5">
                Guia completo do sistema Fit & Rápido
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Seção: Introdução */}
          <Card>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <i className="bx bx-info-circle text-[#c8921a]" style={{ fontSize: '24px' }}></i>
                  Sobre o Sistema
                </h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Bem-vindo à documentação do sistema <strong>Fit & Rápido</strong>. Este painel administrativo permite gerenciar receitas, treinos, categorias e usuários do sistema.
                </p>
              </div>
            </div>
          </Card>

          {/* Seção: Funcionalidades */}
          <Card>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <i className="bx bx-list-ul text-[#c8921a]" style={{ fontSize: '24px' }}></i>
                  Funcionalidades do Sistema
                </h2>
              </div>
              
              <div className="space-y-6">
                {/* Receitas */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="bx bx-food-menu text-[#c8921a]"></i>
                    Gerenciamento de Receitas
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Criar, editar e excluir receitas</li>
                    <li>Buscar receitas por palavras-chave ou categoria</li>
                    <li>Definir dificuldade, tempo de preparo e porções</li>
                    <li>Adicionar imagens e vídeos às receitas</li>
                    <li>Marcar receitas como Premium ou Ativas/Inativas</li>
                    <li>Gerenciar ingredientes e modo de preparo</li>
                  </ul>
                </div>

                {/* Treinos */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="bx bx-dumbbell text-[#c8921a]"></i>
                    Gerenciamento de Treinos
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Criar, editar e excluir treinos</li>
                    <li>Definir nível de dificuldade (iniciante, intermediário, avançado)</li>
                    <li>Adicionar grupos musculares trabalhados</li>
                    <li>Definir duração e intensidade do treino</li>
                    <li>Adicionar imagens e vídeos demonstrativos</li>
                    <li>Marcar treinos como Premium ou Ativos/Inativos</li>
                  </ul>
                </div>

                {/* Categorias */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="bx bx-category text-[#c8921a]"></i>
                    Gerenciamento de Categorias
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Organizar receitas e treinos por categorias</li>
                    <li>Criar categorias personalizadas</li>
                    <li>Usar categorias padrão do sistema</li>
                    <li>Editar e excluir categorias existentes</li>
                  </ul>
                </div>

                {/* Usuários */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="bx bx-user text-[#c8921a]"></i>
                    Gerenciamento de Usuários
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Visualizar todos os usuários cadastrados</li>
                    <li>Buscar usuários por nome, email ou tipo</li>
                    <li>Ver informações de perfil, plano e status</li>
                    <li>Gerenciar permissões e níveis de acesso</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Seção: Guias Rápidos */}
          <Card>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <i className="bx bx-book-open text-[#c8921a]" style={{ fontSize: '24px' }}></i>
                  Guias Rápidos
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h4 className="font-bold text-blue-900 mb-2">Como criar uma receita:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800 ml-2">
                    <li>Acesse o menu "Receitas"</li>
                    <li>Clique no botão "+ Nova Receita"</li>
                    <li>Preencha todos os campos obrigatórios (marcados com *)</li>
                    <li>Adicione ingredientes (um por linha)</li>
                    <li>Descreva o modo de preparo passo a passo</li>
                    <li>Adicione uma imagem da receita</li>
                    <li>Clique em "Salvar Receita"</li>
                  </ol>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h4 className="font-bold text-green-900 mb-2">Como criar um treino:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-green-800 ml-2">
                    <li>Acesse o menu "Treinos"</li>
                    <li>Clique no botão "+ Novo Treino"</li>
                    <li>Preencha as informações básicas</li>
                    <li>Adicione os exercícios e descrições</li>
                    <li>Defina o nível de dificuldade e duração</li>
                    <li>Adicione grupos musculares trabalhados</li>
                    <li>Clique em "Salvar Treino"</li>
                  </ol>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <h4 className="font-bold text-purple-900 mb-2">Como buscar receitas:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-purple-800 ml-2">
                    <li>Na página de Receitas, use o campo "Buscar por palavras-chave"</li>
                    <li>Digite o nome da receita, ingrediente ou palavra relacionada</li>
                    <li>Ou selecione uma categoria no filtro "Filtrar por categoria"</li>
                    <li>Use "Limpar filtros" para resetar a busca</li>
                  </ol>
                </div>
              </div>
            </div>
          </Card>

          {/* Seção: Dicas e Boas Práticas */}
          <Card>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <i className="bx bx-bulb text-[#c8921a]" style={{ fontSize: '24px' }}></i>
                  Dicas e Boas Práticas
                </h2>
              </div>
              
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <i className="bx bx-check-circle text-green-600 text-xl mt-0.5"></i>
                  <div>
                    <strong>Imagens de qualidade:</strong> Use imagens claras e atrativas para aumentar o engajamento dos usuários.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="bx bx-check-circle text-green-600 text-xl mt-0.5"></i>
                  <div>
                    <strong>Descrições detalhadas:</strong> Quanto mais informações, melhor a experiência do usuário.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="bx bx-check-circle text-green-600 text-xl mt-0.5"></i>
                  <div>
                    <strong>Organização por categorias:</strong> Mantenha receitas e treinos bem categorizados para facilitar a navegação.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="bx bx-check-circle text-green-600 text-xl mt-0.5"></i>
                  <div>
                    <strong>Status Ativo/Inativo:</strong> Use receitas e treinos inativos para conteúdo em desenvolvimento ou descontinuado.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="bx bx-check-circle text-green-600 text-xl mt-0.5"></i>
                  <div>
                    <strong>Conteúdo Premium:</strong> Marque conteúdo exclusivo como Premium para usuários com assinatura.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Seção: Suporte */}
          <Card>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <i className="bx bx-support text-[#c8921a]" style={{ fontSize: '24px' }}></i>
                  Suporte e Contato
                </h2>
              </div>
              
              <div className="text-gray-700">
                <p className="mb-3">
                  Em caso de dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
                </p>
                <p className="text-sm text-gray-600">
                  <i className="bx bx-info-circle mr-2"></i>
                  Esta documentação pode ser atualizada conforme novas funcionalidades forem adicionadas ao sistema.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

