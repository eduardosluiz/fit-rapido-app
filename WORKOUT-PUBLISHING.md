# Rascunhos de modalidades e treinos

## Uso no painel

- **Salvar rascunho** guarda o formulário, inclusive exercícios incompletos. Não altera o catálogo do aplicativo.
- **Publicar edições** salva a edição atual, valida os campos necessários e publica o conjunto. Se a validação falhar, o rascunho permanece disponível.
- **Descartar rascunho** remove apenas a edição pendente após confirmação. A versão publicada permanece intacta.
- Modalidades mostram “Rascunho”, “Edições não publicadas” ou “Publicado”. Treinos possuem a seção “Rascunhos e edições pendentes”.
- Vídeos de uma modalidade são editados e publicados juntos no editor de modalidades. Treinos avulsos têm publicação independente.
- A escolha Free/Premium de cada vídeo da Sua Jornada faz parte do rascunho e só muda no aplicativo ao publicar. O período Free continua sendo de três dias.

## Banco e implantação

Requer a tabela criada por `api/sql/2026-10-20-workout-drafts.sql`, já executada manualmente pelo responsável. Esta implementação não requer outro SQL nem copia o catálogo existente. `synchronize` continua desativado.

Implantar API e painel da mesma versão. As rotas `/workout-drafts` exigem JWT e o guard administrativo existente (admin/personal_trainer). O mobile continua lendo exclusivamente `treinos` e `treinos_modalidades`; nenhum build mobile é necessário para esse fluxo editorial.

Os rascunhos têm IDs estáveis, revisão e uma assinatura da versão publicada usada como base. Edições concorrentes retornam HTTP 409 em vez de sobrescrever dados. Reabra o editor para carregar o rascunho mais recente. Se a versão publicada mudou por outra ferramenta, confira as diferenças antes de descartar e refazer o rascunho sobre a versão atual.

Publicar usa uma transação SERIALIZABLE: modalidade, vídeos, categorias e remoção do rascunho são confirmados juntos. Vídeos retirados de uma modalidade ficam inativos, preservando IDs usados por histórico/favoritos. Falhas deixam o conteúdo publicado anterior e o rascunho intactos. Uploads não são apagados ao descartar.

Listagens de rascunhos carregam apenas títulos/status; payloads completos são carregados ao editar. O catálogo mobile não faz consultas adicionais. Vídeos inalterados não são regravados durante uma publicação.

## Verificação

- Testes automatizados da API cobrem isolamento do catálogo, rascunhos incompletos, publicação, Free por vídeo, concorrência, conflito com alterações externas, falha durante publicação, IDs de outra modalidade e descarte.
- Testes de repositório usam um gerenciador transacional em memória; não substituem um ensaio com PostgreSQL isolado.
- Verificação visual local usa dados fictícios e a implementação real do serviço com repositórios em memória. Nenhum conteúdo real foi publicado para testar.
- Não executar migrations, limpeza ou ensaios de escrita em produção sem seguir `PRODUCTION-SAFETY.md`.
