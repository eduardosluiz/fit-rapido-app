# Liberação Free de treinos

Implementação preparada localmente. A migration SQL não foi executada em produção.

## Configuração no painel

- Treino solto: Treinos → criar/editar → Disponível para Free.
- Modalidade: Modalidades → editar → nível (se houver) → dia/sessão → Disponível para Free. Todos os exercícios ativos dessa sessão e seus substitutos ficam acessíveis.
- Desmarcar revoga o acesso nas próximas consultas. Não remove vídeos já baixados ou conteúdo previamente carregado no aparelho.
- O padrão dos cadastros existentes continua restrito. `is_premium=false` não implica acesso Free.

## Ativação

1. Cumprir PRODUCTION-SAFETY.md: restaurar e validar backup completo em ambiente isolado antes de executar migrations em produção.
2. Ensaiar `20261013_workout_free.sql` nesse banco isolado. A coluna é aditiva, com default false; as sessões usam `configuracao_dias` já existente.
3. Subir a API contra o banco isolado e testar com administrador, Free, assinatura vigente e vencida: treino solto, sessão por dia/nível, substituto, favoritos e revogação.
4. Na implantação autorizada, executar SQL antes de publicar a API. Publicar painel e nova versão mobile após a API. O app antigo ainda possui bloqueios gerais e precisa ser atualizado.
5. Confirmar leitura e gravação das opções no painel e acesso pelo aplicativo. Nenhum conteúdo deve ser marcado Free automaticamente.

## Reversão

Reverter os binários da API, painel e mobile, mantendo a coluna aditiva e as chaves JSON. Não apagar dados para reverter código. As versões antigas não concedem acesso por essas marcações.

## Validação local

Testes de regras, guards e respostas de modalidades em `api/src/treinos/workout-*.spec.ts`; TypeScript da API, painel e mobile. Testes automatizados usam repositórios simulados: não substituem o ensaio da migration e do SQL de filtragem em PostgreSQL isolado.
