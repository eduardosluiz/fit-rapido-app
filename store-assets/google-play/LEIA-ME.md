# Google Play — Fit & Rápido

Preparação em 29/09/2026.

## Arquivos visuais prontos

- `icone-512.png`: ícone de 512 × 512, sem transparência.
- `recurso-grafico-1024x500.png`: banner de 1024 × 500, sem transparência.
- Os arquivos SVG são fontes editáveis, não os arquivos para upload.

## Capturas prontas em formato mobile

A pasta capturas-web-mobile contém quatro capturas reais da versão atual do app executada no navegador, em viewport 432 × 768 (9:16):

1. 01-inicio.png — início com receitas e treinos.
2. 02-receitas.png — lista de receitas e categorias.
3. 03-receita.png — receita e nutrientes por porção.
4. 04-treinos.png — lista de treinos.

São capturas da versão web em formato mobile, como no processo anterior do iOS; não são capturas de um dispositivo Android. Conferir a correspondência visual com o APK antes da publicação. A resolução atende ao mínimo de 320 px indicado no Console, mas não à recomendação de 1080 px para promoção. Não foram esticadas artificialmente.

Faça upload dos quatro PNGs em “Capturas de tela do telefone”. O ZIP inclui também o ícone, o banner e estas instruções. Os SVGs editáveis ficam fora do ZIP.

## Comparação das versões

- Último Android encontrado no Expo antes desta tarefa: APK de teste de 27/07/2026, versão 1.0.0 (1), commit d8a2c812.
- Base do iOS 23: commit 17710ff. O código mobile atual já inclui essas alterações.
- Android atualizado: bloqueia permissões de microfone, câmera, acesso amplo a mídia e ID de publicidade; usa o seletor do Android para a foto de perfil.
- A rota da calculadora pessoal de macros foi retirada da navegação. O cálculo de nutrientes das substituições de ingredientes foi preservado.
- Validação local: TypeScript sem erros; inspeção das dimensões, formato e aparência dos arquivos visuais.

## Compilações solicitadas — ainda na fila do Expo

- AAB para Google Play, versão 1.0.0 (2): https://expo.dev/accounts/dudemkt2s-team/projects/fit-rapido/builds/142cc033-beff-4882-9728-1cb387c7f945
- APK para instalação e capturas, versão 1.0.0 (3): https://expo.dev/accounts/dudemkt2s-team/projects/fit-rapido/builds/8dfe95b0-9fad-43aa-8cef-f1a00fbb224a

Os números são independentes do build 23 do iOS. As duas compilações Android foram solicitadas com o mesmo código mobile; o Expo incrementa o número a cada compilação.

## Antes de publicar

Estas compilações não estão prontas para lançamento com assinaturas funcionando. O usuário confirmou que apenas a Apple foi conectada ao RevenueCat. Falta cadastrar os produtos Google Play, conectá-los ao RevenueCat e incluir EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY na configuração de produção, depois gerar novo build e testar compras/restauração/expiração.

O ambiente production do Expo não retornou variáveis configuradas nesta verificação. O login com Google depende de EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID e da configuração OAuth Android; não foi validado. Não declarar esse login como disponível sem testar. E-mail e senha continuam sendo o caminho para os testes.

Notificações Android também precisam de verificação da configuração Firebase/FCM: não foi localizado google-services.json no projeto nem configuração android.googleServicesFile. Testar antes de prometer entrega de notificações.

Confirmar no Play Console que a chave de assinatura aceita é a mesma configurada no Expo. Não foi alterada a chave remota existente.

Nenhuma versão foi enviada ao Google Play ou colocada em produção nesta tarefa.
