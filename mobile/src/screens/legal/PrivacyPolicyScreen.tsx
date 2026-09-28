import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import { PRIVACY_POLICY_TEXT } from '../../constants/privacyPolicy';
import BackButton from '../../components/BackButton';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setContent(PRIVACY_POLICY_TEXT);
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

      const isMainTitle = firstLine.startsWith('POLÍTICA DE PRIVACIDADE') || firstLine === 'Política de Privacidade' || firstLine.startsWith('FIT & RÁPIDO');
      const isVersionInfo = firstLine.startsWith('Última atualização') || firstLine.startsWith('Aplicativo Fit & Rápido · Atualizada');
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
        <BackButton onPress={() => navigation.goBack()} />
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

