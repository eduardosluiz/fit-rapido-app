# Google Play — Fit & Rápido

Preparação em 29/09/2026.

## Arquivos visuais prontos

- `icone-512.png`: ícone de 512 × 512, sem transparência.
- `recurso-grafico-1024x500.png`: banner de 1024 × 500, sem transparência.
- Os arquivos SVG são fontes editáveis, não os arquivos para upload.

## Capturas pendentes

Precisamos de capturas reais do Android atualizado. As imagens antigas da App Store não foram copiadas para este pacote.

Após instalar o APK de teste e entrar com uma conta de demonstração com acesso completo, capture:

1. Início, com receitas e treinos carregados.
2. Lista de receitas.
3. Detalhe de uma receita, com ingredientes e preparo.
4. Lista de treinos ou detalhe de treino com o vídeo carregado.

Evite exibir dados pessoais, credenciais, alertas de erro e telas de carregamento. Envie os PNGs originais, sem recortar ou esticar. O mínimo indicado no Console é de duas capturas; quatro permitem apresentar melhor o app.

## Comparação das versões

- Último Android encontrado no Expo antes desta tarefa: APK de teste de 27/07/2026, versão 1.0.0 (1), commit d8a2c812.
- Base do iOS 23: commit 17710ff. O código mobile atual já inclui essas alterações.
- Android atualizado: bloqueia permissões de microfone, câmera, acesso amplo a mídia e ID de publicidade; usa o seletor do Android para a foto de perfil.
- A rota da calculadora pessoal de macros foi retirada da navegação. O cálculo de nutrientes das substituições de ingredientes foi preservado.
- Validação local: TypeScript sem erros; inspeção das dimensões, formato e aparência dos arquivos visuais.

## Compilações solicitadas

- AAB para Google Play, versão 1.0.0 (2): https://expo.dev/accounts/dudemkt2s-team/projects/fit-rapido/builds/142cc033-beff-4882-9728-1cb387c7f945
- APK para instalação e capturas, versão 1.0.0 (3): https://expo.dev/accounts/dudemkt2s-team/projects/fit-rapido/builds/8dfe95b0-9fad-43aa-8cef-f1a00fbb224a

Os números são independentes do build 23 do iOS. As duas compilações Android foram solicitadas com o mesmo código mobile; o Expo incrementa o número a cada compilação.

## Antes de publicar

Estas compilações não estão prontas para lançamento com assinaturas funcionando. O usuário confirmou que apenas a Apple foi conectada ao RevenueCat. Falta cadastrar os produtos Google Play, conectá-los ao RevenueCat e incluir EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY na configuração de produção, depois gerar novo build e testar compras/restauração/expiração.

O ambiente production do Expo não retornou variáveis configuradas nesta verificação. O login com Google depende de EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID e da configuração OAuth Android; não foi validado. Não declarar esse login como disponível sem testar. E-mail e senha continuam sendo o caminho para os testes.

Notificações Android também precisam de verificação da configuração Firebase/FCM: não foi localizado google-services.json no projeto nem configuração android.googleServicesFile. Testar antes de prometer entrega de notificações.

Confirmar no Play Console que a chave de assinatura aceita é a mesma configurada no Expo. Não foi alterada a chave remota existente.

Nenhuma versão foi enviada ao Google Play ou colocada em produção nesta tarefa.
