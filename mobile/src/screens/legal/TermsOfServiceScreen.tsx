import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../services/api';

export default function TermsOfServiceScreen() {
  const navigation = useNavigation();
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setContent(`TERMOS DE USO, ISENÇÃO DE RESPONSABILIDADE E CONDIÇÕES GERAIS
APLICATIVO FIT & RÁPIDO — RECEITAS E TREINOS
Última atualização: 27 de Julho de 2026. Versão 1.0.

Estes Termos de Uso ("Termos") regulam a relação entre FIT E RAPIDO, titular e responsável ("Responsável") pela operação do aplicativo Fit & Rápido ("Aplicativo", "Plataforma"), e o usuário que realizar cadastro e assinatura do serviço ("Usuário", "Assinante"). Ao criar uma conta, contratar a assinatura ou utilizar qualquer funcionalidade do Aplicativo, o Usuário declara ter lido, compreendido e aceitado integralmente estes Termos. Caso não concorde com qualquer disposição aqui prevista, o Usuário não deverá utilizar o Aplicativo.

1. Objetivo do Aplicativo
O Aplicativo disponibiliza, mediante assinatura, conteúdos de:
- receitas culinárias e organização alimentar;
- vídeos de treinos físicos e conteúdos motivacionais;
- materiais educacionais sobre hábitos saudáveis e qualidade de vida.
Todo o conteúdo tem caráter exclusivamente informativo e educativo. O Aplicativo não presta serviços médicos, nutricionais, fisioterapêuticos ou de educação física, tampouco realiza consultas, avaliações, diagnósticos ou prescrições individualizadas.

2. Ausência de Atendimento Profissional
O Usuário declara estar ciente de que a Responsável:
- não é médica;
- não é nutricionista, nem possui registro em Conselho Regional de Nutricionistas (CRN);
- não é profissional de Educação Física, nem possui registro no CREF, atuando no conteúdo audiovisual apenas como executora/demonstradora dos treinos;
- não realiza consultas individuais, diagnósticos ou prescrições de tratamento.
Os treinos disponibilizados são elaborados por profissional de Educação Física terceirizado e devidamente habilitado, com caráter genérico, sem considerar histórico de saúde, lesões ou objetivos individuais de cada Usuário. As informações do Aplicativo não substituem, em nenhuma hipótese, acompanhamento presencial ou remoto por profissionais habilitados. Em caso de dúvida sobre saúde, alimentação, doenças, restrições alimentares, gestação, amamentação, lesões, uso de medicamentos ou qualquer condição clínica, o Usuário deverá procurar acompanhamento profissional individual antes de utilizar o conteúdo.

3. Receitas e Informações Nutricionais
As receitas têm finalidade culinária. As informações nutricionais apresentadas são estimativas calculadas automaticamente com auxílio de ferramenta de Inteligência Artificial a partir dos ingredientes e quantidades informados, podendo variar conforme marca, procedência, modo de preparo e porção efetivamente utilizada. O Aplicativo não garante precisão absoluta desses valores. Usuários com restrições alimentares, alergias, intolerâncias, diabetes ou qualquer outra condição clínica devem validar as receitas com nutricionista ou médico antes do consumo, sendo o Usuário integralmente responsável por essa verificação.

4. Treinos e Assunção de Risco
O Usuário declara compreender que não há garantia de resultados, que os exercícios podem não ser adequados ao seu caso específico, e que é recomendável realizar avaliação médica antes de iniciar qualquer atividade física. O Usuário deve interromper imediatamente qualquer exercício caso sinta dor, tontura, mal-estar ou qualquer sintoma incomum. A utilização dos treinos e das receitas ocorre por conta e risco exclusivo do Usuário, que assume de forma livre e esclarecida os riscos inerentes à prática de exercícios físicos e a qualquer alteração alimentar.

5. Ausência de Garantia de Resultados
O Aplicativo não promete emagrecimento, ganho de massa muscular, melhora estética, clínica ou de desempenho, nem qualquer resultado específico. Resultados dependem de fatores individuais como alimentação, genética, rotina, frequência, descanso, condições de saúde, disciplina e acompanhamento profissional próprio de cada Usuário.

6. Idade Mínima e Capacidade Civil
O uso do Aplicativo é destinado exclusivamente a maiores de 18 (dezoito) anos e civilmente capazes. Menores de idade somente poderão utilizá-lo mediante expressa autorização e sob supervisão de seus pais ou responsáveis legais, os quais assumem integral responsabilidade pelo uso do conteúdo pelo menor, inclusive quanto aos riscos descritos nas cláusulas 4 e 5. A Responsável poderá solicitar comprovação de idade e suspender contas em caso de suspeita de uso por menor não autorizado.

7. Cadastro, Conta e Segurança
O Usuário compromete-se a fornecer informações verdadeiras, completas e atualizadas no cadastro, sendo responsável por mantê-las corretas. O login e a senha são pessoais e intransferíveis, cabendo ao Usuário zelar por sua confidencialidade e por toda atividade realizada em sua conta. A Responsável não se responsabiliza por acessos não autorizados decorrentes de guarda inadequada das credenciais pelo Usuário, devendo eventual uso indevido ser comunicado imediatamente aos canais de atendimento.

8. Condutas Proibidas
É vedado ao Usuário, sem prejuízo de outras condutas incompatíveis com estes Termos:
- compartilhar login, senha ou acesso da assinatura com terceiros não autorizados;
- copiar, reproduzir, distribuir, revender ou disponibilizar o conteúdo do Aplicativo a terceiros;
- realizar engenharia reversa, extração de dados em massa (scraping) ou qualquer tentativa de burlar mecanismos técnicos ou de cobrança da Plataforma;
- utilizar o conteúdo para fins comerciais, incluindo revenda como se fosse acompanhamento profissional próprio;
- praticar qualquer ato ilícito, fraudulento ou que viole direitos de terceiros por meio do Aplicativo.
A violação desta cláusula autoriza a suspensão ou cancelamento imediato da conta, sem prejuízo das medidas cíveis e criminais cabíveis.

9. Responsabilidade do Usuário
Ao utilizar o Aplicativo, o Usuário declara possuir condições físicas compatíveis com o conteúdo, que buscará orientação profissional quando necessário, e que assume integral responsabilidade pelas decisões tomadas com base nas informações disponibilizadas.

10. Limitação de Responsabilidade
Na máxima extensão permitida pela legislação brasileira, a Responsável não responderá por lesões, acidentes, alergias, reações alimentares, danos físicos, morais ou materiais, tampouco por prejuízos decorrentes de uso inadequado ou fora de contexto do conteúdo, ou de indisponibilidade temporária da Plataforma por motivos técnicos, de terceiros ou de caso fortuito/força maior. Esta limitação não se aplica a casos de dolo, culpa grave, ou nas hipóteses em que a legislação consumerista vede expressamente a exclusão de responsabilidade.

11. Suspensão e Encerramento pela Responsável
A Responsável poderá suspender ou encerrar, a qualquer tempo, o acesso de Usuários que violem estes Termos, pratiquem fraude, condutas proibidas (cláusula 8) ou coloquem em risco a segurança da Plataforma ou de terceiros, mediante comunicação ao Usuário sempre que possível, ressalvadas as hipóteses de urgência que justifiquem ação imediata.

12. Propriedade Intelectual
Todo o conteúdo do Aplicativo — vídeos, fotografias, textos, receitas, identidade visual, logotipos, marca e demais materiais digitais — é protegido por lei e de propriedade exclusiva da Responsável e/ou de seus licenciadores. É proibido copiar, reproduzir, distribuir, revender, compartilhar login ou disponibilizar o conteúdo a terceiros sem autorização prévia e expressa, sob pena das sanções cíveis e criminais cabíveis.

13. Assinatura, Pagamento, Cancelamento e Arrependimento
A assinatura concede licença pessoal, individual, limitada e intransferível de uso do conteúdo, nos valores e periodicidade informados no ato da contratação;
O cancelamento pode ser feito a qualquer momento pelo Usuário, pelas configurações da conta ou da plataforma de pagamento utilizada, com efeitos ao fim do ciclo já pago;
Nos termos do art. 49 do Código de Defesa do Consumidor, o Usuário que contratar a assinatura fora do estabelecimento comercial (via internet) poderá exercer direito de arrependimento em até 7 (sete) dias corridos da contratação, com reembolso integral dos valores pagos, mediante solicitação pelos canais de atendimento do Aplicativo;
Fora do prazo de arrependimento, não há reembolso proporcional por período parcialmente utilizado, salvo outras hipóteses legais aplicáveis.

14. Proteção de Dados Pessoais (LGPD)
O tratamento de dados pessoais do Usuário observará a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e será realizado com finalidade específica de viabilizar a prestação do serviço, comunicação, processamento de pagamento e melhoria da experiência, pelo tempo necessário ao cumprimento dessas finalidades e das obrigações legais/regulatórias, findo o qual os dados serão eliminados ou anonimizados. O Usuário poderá exercer seus direitos de titular (acesso, correção, exclusão, portabilidade e revogação de consentimento) pelo canal de contato da plataforma, nos termos da Política de Privacidade do Aplicativo, parte integrante destes Termos.

15. Atualizações do Conteúdo e dos Termos
O conteúdo do Aplicativo poderá ser alterado, atualizado, removido ou ampliado a qualquer momento, sem necessidade de aviso prévio. Estes Termos poderão ser modificados periodicamente, sendo o Usuário comunicado pelo próprio Aplicativo ou por e-mail cadastrado; a continuidade do uso após a comunicação representa concordância com a versão mais recente.

16. Independência das Cláusulas
Caso qualquer disposição destes Termos seja considerada nula, inválida ou inexequível por autoridade competente, tal declaração não afetará a validade das demais cláusulas, que permanecerão em pleno vigor, devendo a disposição afetada ser reinterpretada de modo a preservar, na maior medida possível, a intenção original das partes.

17. Não Renúncia de Direitos
A tolerância da Responsável quanto ao eventual descumprimento de qualquer obrigação prevista nestes Termos não constituirá novação ou renúncia ao direito de exigir o cumprimento integral das obrigações em qualquer momento posterior.

18. Cessão do Contrato
A Responsável poderá ceder ou transferir, total ou parcialmente, os direitos e obrigações decorrentes destes Termos a terceiros, inclusive em razão de reorganização societária, venda do negócio ou do Aplicativo, mediante comunicação ao Usuário. É vedado ao Usuário ceder ou transferir sua condição de Assinante a terceiros sem autorização prévia da Responsável.

19. Lei Aplicável e Foro
Este contrato é regido pelas leis da República Federativa do Brasil. Fica eleito o foro para dirimir controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja, ressalvado o foro de domicílio do consumidor quando de aplicação obrigatória.

20. Declaração Final e Aceite Eletrônico
Ao clicar em "Li e Aceito" ou equivalente, o Usuário declara que leu integralmente estes Termos, compreendeu todas as disposições, reconhece que o conteúdo tem finalidade exclusivamente educativa e informativa, compreende que o Aplicativo não substitui acompanhamento médico, nutricional ou de educação física, assume a responsabilidade pelo uso das informações disponibilizadas e concorda integralmente com todas as condições aqui previstas. Esta manifestação eletrônica, registrada com data, hora e demais dados técnicos de identificação do aceite, produz os mesmos efeitos jurídicos de uma assinatura física, nos termos do art. 107 do Código Civil e da legislação consumerista aplicável.`);
    setLoading(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos de Uso</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : (
          <Text style={styles.text}>{content}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#c8921a',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#999',
    fontSize: 16,
  },
  text: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 24,
  },
});

