import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import { api } from '../../services/api';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setContent(`POLÍTICA DE PRIVACIDADE — APLICATIVO FIT & RÁPIDO
Última atualização: 27 de Julho de 2026. Versão 1.0.

1. INTRODUÇÃO
A Fit & Rápido respeita sua privacidade e está comprometida em proteger seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos suas informações quando você utiliza nosso aplicativo móvel e serviços relacionados.

Ao usar o Fit & Rápido, você concorda com as práticas descritas nesta política. Se não concordar, por favor, não utilize nossos serviços.

2. INFORMAÇÕES QUE COLETAMOS

2.1. Informações Fornecidas por Você
- Dados de Cadastro: Nome completo, endereço de e-mail, senha (armazenada de forma criptografada)
- Dados de Perfil: Foto de perfil (opcional), preferências alimentares, objetivos de treino
- Dados de Assinatura: Informações sobre planos contratados, histórico de pagamentos (processados pelas lojas Apple App Store e Google Play Store)
- Dados de Consentimento: Registro de aceitação de termos e políticas

2.2. Informações Coletadas Automaticamente
- Dados de Uso: Receitas e treinos visualizados, favoritos marcados, histórico de atividades, tempo de uso
- Dados de Dispositivo: Tipo de dispositivo, sistema operacional, identificador único do dispositivo
- Dados de Notificações: Token para notificações push, preferências de notificação
- Dados de Localização: Apenas se você permitir (para funcionalidades futuras de localização)

2.3. Informações de Terceiros
- Dados de Pagamento: Processados exclusivamente pelas lojas Apple e Google, não armazenamos informações de cartão de crédito
- Dados de Analytics: Informações agregadas e anonimizadas sobre uso do aplicativo

3. COMO USAMOS SUAS INFORMAÇÕES
Utilizamos suas informações pessoais para as seguintes finalidades:

3.1. Prestação de Serviços
- Criar e gerenciar sua conta
- Fornecer acesso a receitas e treinos
- Personalizar sua experiência no aplicativo
- Processar assinaturas e pagamentos
- Enviar notificações sobre novos conteúdos

3.2. Melhoria dos Serviços
- Analisar padrões de uso para melhorar funcionalidades
- Desenvolver novos recursos e conteúdos
- Corrigir bugs e problemas técnicos
- Realizar pesquisas e análises

3.3. Comunicação
- Enviar notificações push sobre novos conteúdos
- Responder a suas solicitações e dúvidas
- Enviar informações importantes sobre o serviço
- Comunicar mudanças em termos e políticas

3.4. Conformidade Legal
- Cumprir obrigações legais e regulatórias
- Responder a solicitações de autoridades competentes
- Proteger nossos direitos e propriedade
- Prevenir fraudes e atividades ilegais

4. BASE LEGAL PARA PROCESSAMENTO (LGPD)
Processamos seus dados pessoais com base nas seguintes bases legais:
- Consentimento: Quando você nos dá permissão explícita (ex: notificações push, marketing)
- Execução de Contrato: Para fornecer os serviços solicitados
- Obrigação Legal: Para cumprir requisitos legais e regulatórios
- Legítimo Interesse: Para melhorar nossos serviços e segurança

5. COMPARTILHAMENTO DE DADOS

5.1. Não Vendemos Seus Dados
Não vendemos, alugamos ou comercializamos seus dados pessoais para terceiros.

5.2. Compartilhamento com Prestadores de Serviços
Podemos compartilhar dados com:
- Provedores de Hospedagem: Para armazenar e processar dados
- Provedores de Analytics: Para análise de uso (dados anonimizados)
- Provedores de Notificações: Para enviar notificações push (Firebase/Expo)
- Processadores de Pagamento: Apple e Google (para assinaturas)

Todos os prestadores de serviço são obrigados a manter a confidencialidade e segurança dos dados.

5.3. Compartilhamento por Obrigação Legal
Podemos divulgar informações se exigido por lei, ordem judicial ou autoridade competente.

5.4. Transferências Internacionais
Seus dados podem ser processados em servidores localizados fora do Brasil. Garantimos que tais transferências seguem padrões adequados de proteção de dados.

6. SEUS DIREITOS (LGPD)
Conforme a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018), você tem os seguintes direitos:

6.1. Direito de Acesso
Você pode solicitar uma cópia dos dados pessoais que mantemos sobre você.

6.2. Direito de Correção
Você pode solicitar a correção de dados incompletos, inexatos ou desatualizados.

6.3. Direito de Exclusão
Você pode solicitar a exclusão de dados pessoais desnecessários, excessivos ou tratados em desconformidade com a LGPD.

6.4. Direito de Portabilidade
Você pode solicitar a portabilidade de seus dados para outro prestador de serviço.

6.5. Direito de Revogação de Consentimento
Você pode revogar consentimentos anteriormente dados a qualquer momento.

6.6. Direito de Oposição
Você pode se opor ao tratamento de dados pessoais em certas circunstâncias.

6.7. Direito de Informação
Você tem direito a informações claras sobre o tratamento de seus dados.

Como Exercer Seus Direitos
Para exercer qualquer um desses direitos, entre em contato conosco através de:
- E-mail: privacidade@fitrapido.com.br
- Formulário no aplicativo: Configurações > Privacidade

Responderemos sua solicitação em até 15 (quinze) dias úteis.

7. RETENÇÃO DE DADOS
Mantemos seus dados pessoais apenas pelo tempo necessário para:
- Fornecer os serviços solicitados
- Cumprir obrigações legais
- Resolver disputas
- Aplicar nossos acordos

Após o período de retenção, excluímos ou anonimizamos seus dados de forma segura.

8. SEGURANÇA DOS DADOS
Implementamos medidas técnicas e organizacionais para proteger seus dados:

8.1. Medidas Técnicas
- Criptografia: Senhas são armazenadas usando hash seguro (bcrypt)
- HTTPS: Todas as comunicações são criptografadas
- Autenticação: Sistema de autenticação JWT seguro
- Rate Limiting: Proteção contra ataques e abuso
- Validação de Inputs: Sanitização de dados de entrada

8.2. Medidas Organizacionais
- Acesso restrito a dados pessoais apenas para funcionários autorizados
- Treinamento regular sobre proteção de dados
- Políticas internas de segurança
- Auditorias periódicas de segurança

9. COOKIES E TECNOLOGIAS SIMILARES
Utilizamos tecnologias para melhorar sua experiência:
- Tokens de Autenticação: Para manter sua sessão ativa
- Local Storage: Para preferências do aplicativo
- Analytics: Para entender como você usa o aplicativo (dados anonimizados)

Você pode gerenciar essas preferências nas configurações do aplicativo.

10. DADOS DE MENORES DE IDADE
Nossos serviços são destinados a usuários com 18 anos ou mais. Não coletamos intencionalmente dados de menores de 18 anos. Se descobrirmos que coletamos dados de um menor, excluiremos essas informações imediatamente.

11. ALTERAÇÕES NESTA POLÍTICA
Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas através de:
- Notificação no aplicativo
- E-mail (se você tiver cadastrado)
- Atualização da data de "Última atualização" no topo desta política

A continuação do uso do aplicativo após mudanças significa que você aceita a política atualizada.

12. CONTATO E ENCARREGADO DE DADOS (DPO)
Para questões relacionadas a privacidade e proteção de dados:
Encarregado de Proteção de Dados (DPO)
E-mail: privacidade@fitrapido.com.br
Horário de Atendimento: Segunda a Sexta, 9h às 18h

13. AUTORIDADE DE FISCALIZAÇÃO
Se você acredita que seus dados pessoais foram tratados de forma inadequada, você pode apresentar uma reclamação à Autoridade Nacional de Proteção de Dados (ANPD):
ANPD
Site: www.gov.br/anpd
E-mail: ouvidoria@anpd.gov.br

14. DISPOSIÇÕES FINAIS
Esta Política de Privacidade é regida pela legislação brasileira, especialmente pela Lei Geral de Proteção de Dados (Lei 13.709/2018).

Ao usar o Fit & Rápido, você declara ter lido, compreendido e concordado com esta Política de Privacidade.`);
    setLoading(false);
  }, []);

  const renderParagraphBody = (text: string) => {
    if (text.startsWith('-')) {
      const listItems = text.split('\n').map((item, itemIdx) => {
        const itemText = item.replace(/^-\s*/, '').trim();
        return (
          <View key={itemIdx} style={styles.listItemRow}>
            <Text style={styles.listBullet}>•</Text>
            <Text style={styles.listItemText}>{itemText}</Text>
          </View>
        );
      });
      return <View style={styles.listContainer}>{listItems}</View>;
    }

    return (
      <Text style={styles.paragraph}>
        {text}
      </Text>
    );
  };

  const renderContent = () => {
    if (!content) return null;

    return content.split('\n\n').map((p, index) => {
      const trimmed = p.trim();
      if (!trimmed) return null;

      const lines = trimmed.split('\n');
      const firstLine = lines[0].trim();

      const isMainTitle = firstLine.startsWith('POLÍTICA DE PRIVACIDADE') || firstLine.startsWith('FIT & RÁPIDO');
      const isVersionInfo = firstLine.startsWith('Última atualização');
      const isSectionHeader = firstLine.match(/^\d+\.\s/) || firstLine.match(/^\d+\.\d+\.\s/);

      if (isMainTitle) {
        return (
          <Text key={index} style={styles.mainTitle}>
            {trimmed}
          </Text>
        );
      }

      if (isVersionInfo) {
        return (
          <Text key={index} style={styles.versionInfo}>
            {trimmed}
          </Text>
        );
      }

      if (isSectionHeader) {
        const remainingText = lines.slice(1).join('\n').trim();
        return (
          <View key={index} style={{ marginBottom: 16 }}>
            <Text style={styles.sectionHeader}>{firstLine}</Text>
            {remainingText ? renderParagraphBody(remainingText) : null}
          </View>
        );
      }

      return (
        <View key={index}>
          {renderParagraphBody(trimmed)}
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header Premium */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Política de Privacidade</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {renderContent()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(28, 27, 30, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 196, 138, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 210, 111, 0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.title,
    color: '#ffffff',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: 'rgba(35, 33, 41, 0.3)',
    borderRadius: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(231, 196, 138, 0.08)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#8A8892',
    fontFamily: fonts.body,
    fontSize: 16,
  },
  mainTitle: {
    fontSize: 18,
    fontFamily: fonts.title,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  versionInfo: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: '#8A8892',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
    lineHeight: 20,
  },
  subsectionHeader: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
    marginTop: 14,
    marginBottom: 6,
    lineHeight: 18,
  },
  paragraph: {
    fontSize: 13.5,
    fontFamily: fonts.body,
    color: '#ffffff',
    lineHeight: 21,
    marginBottom: 14,
    textAlign: 'justify',
  },
  listContainer: {
    marginBottom: 14,
    paddingLeft: 8,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  listBullet: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 8,
    lineHeight: 18,
  },
  listItemText: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: fonts.body,
    color: '#ffffff',
    lineHeight: 19,
  },
});

