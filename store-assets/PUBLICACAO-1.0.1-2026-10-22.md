# Publicação 1.0.1 — 22/10/2026

Código preparado na main: `6172d0d`. Inclui as melhorias da Revisão 20/10-D.
Canal dos pacotes: `production`. O canal `client-review` continua separado.

## Pacotes solicitados

- iOS: versão 1.0.1, compilação 26. Build Expo: `87c5c0d1-b562-485d-a262-708a23653ed8`.
- Android: versão 1.0.1, código 9, formato AAB. Build Expo: `86c01743-66e0-4793-92e4-111502c3447b`.

Gerar um pacote no Expo não envia o aplicativo para revisão nem o publica nas lojas.

O build iOS terminou com sucesso e o envio ao App Store Connect foi agendado:
https://expo.dev/accounts/dudemkt2s-team/projects/fit-rapido/submissions/0c9cefad-82a6-47dc-b73d-31347d7c8bc3
Não repetir o comando de envio enquanto essa submissão estiver em andamento.

## Apple

1. Acompanhar o envio já agendado da compilação 26 ao App Store Connect. Apenas se for necessário repetir um envio que falhou, no diretório `mobile`, o comando é:

   `eas submit --platform ios --profile production --id 87c5c0d1-b562-485d-a262-708a23653ed8`

2. Aguardar o processamento da Apple e selecionar 1.0.1 (26) no TestFlight para validar o pacote final.
3. Em Distribuição, criar ou abrir a versão 1.0.1 e selecionar a compilação 26.
4. Conferir metadados, capturas, privacidade, classificação etária, assinaturas, países e informações de revisão. Fornecer uma conta de demonstração que continue acessível durante a revisão; uma conta cujo teste gratuito expira em três dias pode impedir a análise.
5. Selecionar a liberação manual da versão e enviar para revisão da App Store.
6. Depois da aprovação, liberar a versão na data desejada.

A aprovação de testes externos no TestFlight não substitui a revisão da App Store.

## Google Play

1. Baixar o AAB do build Android concluído.
2. No Play Console, abrir Testar e lançar > Teste interno, criar uma versão e enviar o AAB código 9.
3. Validar login, receitas, treinos, vídeos, conclusão de exercício, compra e restauração de assinatura em um dispositivo Android.
4. Promover o mesmo pacote validado à faixa de produção. Conferir os requisitos e avisos do Console, segurança dos dados, acesso ao app, classificação, países, assinaturas e página da loja.
5. Enviar as alterações para revisão quando estiver pronto para o lançamento.

A publicação gerenciada não está disponível para a primeira publicação do aplicativo. Se o Console permitir ativá-la para este app, usá-la para controlar a liberação após a aprovação; caso contrário, considerar que a publicação pode ocorrer automaticamente após a aprovação.

## Observação de configuração

O ambiente EAS production não tem variáveis do login Google configuradas. O componente atual oculta esse login quando não configurado. Se o lançamento precisa incluir login Google, configurar os clientes OAuth e gerar novos pacotes antes da publicação.

## Referências

- Apple: https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app
- Liberação manual: https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/select-an-app-store-version-release-option/
- Google: https://support.google.com/googleplay/android-developer/answer/9859654?hl=pt-BR
