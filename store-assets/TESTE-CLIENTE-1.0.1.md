# Teste da cliente — 1.0.1 (25)

Preparação em 15/10/2026. Destino: TestFlight, sem publicação pública.

## Compilação

- Perfil EAS: `testflight`, distribuição `store`, canal `client-review`.
- iOS runtime: `1.0.1`, separado da versão pública `1.0.0`.
- Build: https://expo.dev/accounts/dudemkt2s-team/projects/fit-rapido/builds/e75e2399-e3bc-497c-a1c6-8c860040df86
- Envio agendado: https://expo.dev/accounts/dudemkt2s-team/projects/fit-rapido/submissions/9261d5bb-0494-4cde-abc8-fbdfdb647ed5
- Compilação concluída com sucesso; envio agendado não confirma processamento nem disponibilidade no TestFlight.

Após processamento na Apple, adicionar a compilação 1.0.1 (25) ao grupo Testes Externos. A Apple pode solicitar revisão beta antes de liberar para a cliente. Isso não publica uma atualização na App Store.

## Dependências ainda pendentes

O aplicativo consulta a API de produção. O envio do binário não publica a API nem o painel admin.

As novas regras de catálogo completo, cadeados e treinos Free dependem da implantação da API e da coluna `treinos.is_free`. Antes da implantação:

1. Consulta de leitura `api/migrations/20261015_check_workout_free.sql`: usuário informou em 15/10/2026 “Success. No rows returned”. A coluna não existe no banco consultado. A credencial local foi recusada (28P01).
2. Cumprir `PRODUCTION-SAFETY.md`, incluindo restauração e validação do backup isolado.
3. Se a coluna não existir, ensaiar e aplicar `api/migrations/20261013_workout_free.sql`. Se existir, conferir tipo boolean, NOT NULL e default false; não recriar nem sobrescrever valores existentes.
4. Publicar API e painel e testar o acesso Free, Receitas e Completo antes da aprovação final.

O assistente não executou SQL de alteração. Em 15/10/2026, o usuário confirmou que executou o ALTER TABLE com sucesso em produção e que há backup de aproximadamente 9 horas no Supabase. A restauração de teste e a cópia dos arquivos de Storage não foram confirmadas. Não é necessário repetir o ALTER TABLE. Sem atualizar o backend, a cliente consegue avaliar os ajustes visuais, mas não validar integralmente as novas regras de acesso.

## Conferência da cliente

- Sua Jornada: capas maiores, cards uniformes, Ver Vídeo.
- Exercícios: Concluir Exercício / Próximo Exercício, finalização do treino.
- Leitura: pinça para ampliar e reduzir em aparelho real.
- Receitas: filtros combinados e valores por porção.
- Após implantação do backend: conteúdo pago visível com cadeado e conteúdo Free acessível.

## Verificação local

- TypeScript do painel e mobile aprovado.
- 19 testes da API aprovados em 6 suítes de acesso, catálogo e assinaturas.
- Exportação do bundle iOS concluída.
- Listagens do painel verificadas com dados simulados em 320, 390, 768 e 1280 px: Modalidades, Receitas, Treinos, Biblioteca, Ingredientes, Usuários e Perfil.
- Nova Modalidade visível; abertura do editor verificada em 390 px.
- Formulários de nova receita e novo treino verificados em 320 e 390 px.
- Dashboard, categorias de receitas/treinos, glossário, banners, populares e documentação verificados em 320 e 390 px com dados simulados.
- Formulário de ingredientes conferido em 320×568 e 667×375, com ação de confirmação acessível.
- Nenhuma gravação no servidor de produção realizada nos testes de interface.
