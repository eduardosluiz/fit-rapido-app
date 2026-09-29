# Teste interno Android — versão 1.0.0 (5)

Build com chave pública Google RevenueCat e identificação de produtos com plano básico.
Compilação: https://expo.dev/accounts/dudemkt2s-team/projects/fit-rapido/builds/7254ccd8-de9e-43a3-bd85-2162ef90e925
Use somente o build 5 ou posterior. O build 4 foi substituído durante a revisão.

## Envio manual
1. Aguarde o status Finished no Expo e baixe o arquivo AAB.
2. Play Console > Fit & Rápido > Testar e lançar > Teste interno > Criar nova versão.
3. Envie o AAB e confirme versionCode 5.
4. Nome da versão: 1.0.0 (5).
5. Notas: Testes de assinaturas Google Play, restauração de compras e acesso a receitas e treinos.
6. Salve, revise os erros apresentados e disponibilize apenas para teste interno.
7. Em Testadores, cadastre os e-mails Google dos celulares e salve a lista selecionada.
8. Na configuração da conta de desenvolvedor > Teste de licença, adicione os mesmos e-mails.
9. Abra o link de participação no celular com a conta cadastrada, aceite participar e instale pela Play Store.

## Validação
- Use conta do app sem acesso premium concedido manualmente.
- Confira seis planos, moedas, preços totais e períodos na tela e no pagamento Google.
- A compra precisa mostrar que é teste/cartão de teste; não confirme cobrança real.
- Premium libera receitas; Premium Fit libera receitas e treinos.
- Confirme cliente e compra sandbox no RevenueCat e sincronização do acesso no app.
- Teste restauração com a mesma conta, cancelamento e expiração. Cancelar renovação não deve remover acesso antes do vencimento.
- Teste login por e-mail, receitas, vídeos e foto de perfil no Android.

As notificações Google > RevenueCat foram confirmadas por teste no painel pelo usuário. Compras reais/sandbox e atualização do backend ainda precisam ser validadas no dispositivo. Testar push e login Google separadamente; esses recursos não foram validados nesta entrega.
