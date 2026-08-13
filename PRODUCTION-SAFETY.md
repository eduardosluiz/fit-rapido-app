# Proteção do ambiente de produção

Este documento define os bloqueios obrigatórios antes de qualquer migration,
limpeza ou correção de dados do Fit & Rápido.

## Regra principal

Nenhuma operação de escrita em massa pode ser executada em produção até que
um backup recente tenha sido restaurado e validado em um ambiente isolado.

## Escopo do backup

O backup precisa conter, separadamente:

1. PostgreSQL completo, incluindo schemas de aplicação e autenticação.
2. Objetos de todos os buckets do Storage.
3. Inventário dos objetos com bucket, caminho, tamanho e checksum.
4. Versão do código e migrations correspondente ao momento do backup.
5. Configuração necessária para reconstrução, sem armazenar segredos no Git.

Backups do PostgreSQL não substituem o backup dos objetos do Storage.

## Validação obrigatória

Um arquivo de backup só é considerado válido depois de:

- restaurar sem erros em outro banco;
- comparar a contagem de linhas das tabelas críticas;
- verificar chaves estrangeiras e registros órfãos;
- validar uma amostra de receitas, treinos, modalidades e usuários;
- conferir o inventário e checksums dos arquivos do Storage;
- testar login e leitura de mídias no ambiente restaurado.

## Mudanças permitidas antes da validação

- alterações locais de código;
- builds e testes locais;
- consultas somente leitura;
- criação de documentação;
- preparação de migrations ainda não executadas.

## Mudanças bloqueadas antes da validação

- DELETE ou UPDATE em massa;
- remoção ou renomeação de colunas e tabelas;
- aplicação de migrations em produção;
- exclusão ou sobrescrita de objetos no Storage;
- limpeza automática de duplicidades;
- restauração sobre o projeto de produção.

## Procedimento de mudança

1. Registrar o backup utilizado e o horário.
2. Ensaiar a mudança sobre a cópia restaurada.
3. Medir e registrar o estado antes e depois.
4. Preparar rollback compatível com a mudança.
5. Aplicar em uma janela controlada.
6. Validar os fluxos críticos imediatamente.
7. Interromper e executar rollback diante de divergência.

## Duplicidades de mídia

A primeira etapa é somente detectar e produzir um relatório. Nenhum registro ou
arquivo deve ser excluído automaticamente. A consolidação exige confirmar quais
IDs estão referenciados por treinos e modalidades e qual cópia deve permanecer.

## Estado da auditoria de 13/08/2026

- Storage inventariado em modo somente leitura.
- 1 bucket, 1.747 objetos e 27.536.686.911 bytes catalogados.
- A cópia integral exige um destino com pelo menos 35–40 GB livres.
- A credencial `DATABASE_URL` local foi recusada pelo PostgreSQL e precisa ser
  atualizada antes da geração do dump lógico.
- Nenhum backup parcial deve ser usado ou descrito como recuperável.
- Auditoria da biblioteca: 308 registros, 68 grupos com nomes repetidos e 143
  registros envolvidos. Não houve exclusão nem consolidação automática.
