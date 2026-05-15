import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { api, Receita, getImageUrl } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import VideoPlayer from '../../components/VideoPlayer';
import ImageCarousel from '../../components/ImageCarousel';
import { useAuth } from '../../contexts/AuthContext';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import { getVideoThumbnail } from '../../utils/videoThumbnail';
import { Ionicons } from '@expo/vector-icons';

export default function ReceitaDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { receitaId } = route.params as { receitaId: string };
  const [receita, setReceita] = useState<Receita | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorito, setIsFavorito] = useState(false);
  const [loadingFavorito, setLoadingFavorito] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  
  // Substituições e IA (inline ao invés de modal)
  const [showSubstituicaoExpanded, setShowSubstituicaoExpanded] = useState(false);
  const [showIAExpanded, setShowIAExpanded] = useState(false);
  const [ingredientesReceita, setIngredientesReceita] = useState<any[]>([]);
  const [substituicoes, setSubstituicoes] = useState<any[]>([]);
  const [macrosModificados, setMacrosModificados] = useState<any>(null);
  const [loadingMacros, setLoadingMacros] = useState(false);
  const [selectedIngrediente, setSelectedIngrediente] = useState<any>(null);
  const [ingredientesDisponiveis, setIngredientesDisponiveis] = useState<any[]>([]);
  const [sugestoesAutomaticas, setSugestoesAutomaticas] = useState<any[]>([]);
  const [loadingSugestoes, setLoadingSugestoes] = useState(false);
  const [searchIngrediente, setSearchIngrediente] = useState('');
  const [loadingIngredientes, setLoadingIngredientes] = useState(false);
  const [validacaoCompatibilidade, setValidacaoCompatibilidade] = useState<any>(null);
  const [substituicoesFrequentes, setSubstituicoesFrequentes] = useState<any[]>([]);
  const [historicoSubstituicoes, setHistoricoSubstituicoes] = useState<any[]>([]);
  
  // IA
  const [perguntaIA, setPerguntaIA] = useState('');
  const [respostaIA, setRespostaIA] = useState('');
  const [loadingIA, setLoadingIA] = useState(false);
  const [chatIAAberto, setChatIAAberto] = useState(false);
  
  // Select de substituições (inline)
  const [ingredienteComSelectAberto, setIngredienteComSelectAberto] = useState<string | null>(null);
  
  // Rastrear ingredientes substituídos: { ingredienteOriginal: ingredienteSubstituto }
  const [ingredientesSubstituidos, setIngredientesSubstituidos] = useState<Record<string, string>>({});
  
  // Atividades e avaliações
  const [fizReceita, setFizReceita] = useState(false);
  const [avaliacaoUsuario, setAvaliacaoUsuario] = useState<number | null>(null);
  const [loadingAtividade, setLoadingAtividade] = useState(false);
  const [loadingAvaliacao, setLoadingAvaliacao] = useState(false);
  
  const isPremiumFit = user?.subscription_tier === 'premium_fit';

  // Configurar header com botão de voltar
  useLayoutEffect(() => {
    const handleGoBack = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Se não pode voltar, navegar para a aba de Receitas
        try {
          (navigation as any).navigate('Tabs', { screen: 'Receitas' });
        } catch (error) {
          // Fallback: tentar navegar diretamente para Receitas
          try {
            (navigation as any).navigate('Receitas');
          } catch (e) {
            console.error('Erro ao navegar:', e);
          }
        }
      }
    };

    navigation.setOptions({
      headerShown: true,
      title: 'Detalhes da Receita',
      headerStyle: { backgroundColor: '#1a1a1a' },
      headerTintColor: '#c8921a',
      headerTitleStyle: { color: '#c8921a' },
      headerBackTitleVisible: false,
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleGoBack}
          style={{ marginLeft: 8, padding: 8 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#c8921a" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Listener para quando a tela perde o foco (usuário clicou em outra aba)
  useFocusEffect(
    React.useCallback(() => {
      // Quando a tela ganha foco, garantir que o header está configurado
      return () => {
        // Quando a tela perde o foco (usuário navegou para outra aba)
        // Não fazer nada aqui, deixar a navegação funcionar normalmente
      };
    }, [])
  );

  useEffect(() => {
    loadReceita();
    checkFavorito();
    if (isPremiumFit) {
      loadIngredientesReceita();
      loadSubstituicoes();
    }
    verificarFezReceita();
    carregarAvaliacaoUsuario();
  }, [receitaId, isPremiumFit]);
  
  useEffect(() => {
    if (isPremiumFit && substituicoes.length > 0) {
      calcularMacros();
    }
  }, [substituicoes, isPremiumFit]);
  
  useEffect(() => {
    if (searchIngrediente.length > 2) {
      const timer = setTimeout(() => {
        buscarIngredientes();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIngredientesDisponiveis([]);
    }
  }, [searchIngrediente]);

  useEffect(() => {
    // Carregar sugestões automáticas quando um ingrediente é selecionado
    if (selectedIngrediente?.ingrediente_id && isPremiumFit) {
      carregarSugestoesAutomaticas();
    } else {
      setSugestoesAutomaticas([]);
    }
  }, [selectedIngrediente, isPremiumFit]);

  useEffect(() => {
    // Carregar histórico e frequentes quando expandir substituição
    if (showSubstituicaoExpanded && isPremiumFit && !selectedIngrediente) {
      carregarHistoricoEFrequentes();
    }
  }, [showSubstituicaoExpanded, isPremiumFit, selectedIngrediente]);

  // Limpar estado quando fechar substituição
  useEffect(() => {
    if (!showSubstituicaoExpanded) {
      setSelectedIngrediente(null);
      setSearchIngrediente('');
      setIngredientesDisponiveis([]);
      setSugestoesAutomaticas([]);
      setValidacaoCompatibilidade(null);
    }
  }, [showSubstituicaoExpanded]);

  // Limpar estado quando fechar chat de IA
  useEffect(() => {
    if (!chatIAAberto) {
      setPerguntaIA('');
      setRespostaIA('');
    }
  }, [chatIAAberto]);

  const loadReceita = async () => {
    try {
      setLoading(true);
      const data = await api.getReceita(receitaId);
      console.log('📱 Receita carregada no mobile:', JSON.stringify(data, null, 2));
      console.log('📱 Substituições recebidas:', JSON.stringify(data.substituicoes_ingredientes, null, 2));
      console.log('📱 Informações nutricionais:', data.informacoes_nutricionais);
      setReceita(data);
    } catch (error) {
      console.error('Erro ao carregar receita:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorito = async () => {
    try {
      const result = await api.checkIsFavorito('receita', receitaId);
      setIsFavorito(result.is_favorito);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
    }
  };

  const toggleFavorito = async () => {
    try {
      setLoadingFavorito(true);
      if (isFavorito) {
        await api.removeFavorito('receita', receitaId);
        setIsFavorito(false);
      } else {
        await api.addFavorito('receita', receitaId);
        setIsFavorito(true);
      }
      // Recarregar status do favorito para garantir sincronização
      await checkFavorito();
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      // Reverter estado em caso de erro
      setIsFavorito(!isFavorito);
    } finally {
      setLoadingFavorito(false);
    }
  };
  
  const loadIngredientesReceita = async () => {
    try {
      const data = await api.getReceitaIngredientes(receitaId);
      setIngredientesReceita(data);
    } catch (error) {
      console.error('Erro ao carregar ingredientes da receita:', error);
    }
  };
  
  const loadSubstituicoes = async () => {
    try {
      const data = await api.getSubstituicoes(receitaId);
      setSubstituicoes(data);
    } catch (error) {
      console.error('Erro ao carregar substituições:', error);
    }
  };

  const verificarFezReceita = async () => {
    if (!receitaId) return;
    try {
      const fezHoje = await api.verificarFezHoje(receitaId, 'fiz_receita');
      setFizReceita(fezHoje);
    } catch (error) {
      console.error('Erro ao verificar se fez receita:', error);
    }
  };

  const toggleFizReceita = async () => {
    if (!receitaId || loadingAtividade) return;
    
    try {
      setLoadingAtividade(true);
      if (fizReceita) {
        await api.removerAtividade(receitaId, 'fiz_receita');
        setFizReceita(false);
      } else {
        await api.criarAtividade(receitaId, 'fiz_receita');
        setFizReceita(true);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar atividade:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a atividade');
    } finally {
      setLoadingAtividade(false);
    }
  };

  const carregarAvaliacaoUsuario = async () => {
    if (!receitaId) return;
    try {
      const avaliacao = await api.obterAvaliacao(receitaId, 'receita');
      if (avaliacao) {
        setAvaliacaoUsuario(avaliacao.nota);
      }
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error);
    }
  };

  const avaliarReceita = async (nota: number) => {
    if (!receitaId || loadingAvaliacao) return;
    
    try {
      setLoadingAvaliacao(true);
      await api.criarAvaliacao(receitaId, 'receita', nota);
      setAvaliacaoUsuario(nota);
      
      // Recarregar receita para atualizar média
      if (receita) {
        const receitaAtualizada = await api.getReceita(receitaId);
        setReceita(receitaAtualizada);
      }
    } catch (error: any) {
      console.error('Erro ao avaliar receita:', error);
      Alert.alert('Erro', 'Não foi possível avaliar a receita');
    } finally {
      setLoadingAvaliacao(false);
    }
  };
  
  const calcularMacros = async () => {
    try {
      setLoadingMacros(true);
      const macros = await api.calcularMacrosComSubstituicao(receitaId);
      setMacrosModificados(macros);
    } catch (error) {
      console.error('Erro ao calcular macros:', error);
    } finally {
      setLoadingMacros(false);
    }
  };
  
  // Extrair quantidade do texto do ingrediente (ex: "200g de chocolate" -> 200)
  const extrairQuantidade = (textoIngrediente: string): number => {
    // Tentar encontrar números seguidos de unidades comuns
    const padroes = [
      /(\d+(?:[.,]\d+)?)\s*(?:g|gramas?|kg|quilos?)/i, // gramas
      /(\d+(?:[.,]\d+)?)\s*(?:ml|mililitros?|l|litros?)/i, // líquidos
      /(\d+(?:[.,]\d+)?)\s*(?:xícara|xicara|colher|colheres)/i, // medidas caseiras
      /(\d+(?:[.,]\d+)?)\s*(?:unidade|unidades?)/i, // unidades
      /(\d+(?:[.,]\d+)?)/, // qualquer número
    ];

    for (const padrao of padroes) {
      const match = textoIngrediente.match(padrao);
      if (match) {
        const valor = parseFloat(match[1].replace(',', '.'));
        // Se for xícara ou colher, converter para gramas aproximados
        if (padrao.source.includes('xícara') || padrao.source.includes('xicara')) {
          return valor * 120; // 1 xícara ≈ 120g (aproximado)
        }
        if (padrao.source.includes('colher')) {
          return valor * 15; // 1 colher de sopa ≈ 15g (aproximado)
        }
        return valor;
      }
    }

    // Se não encontrar, usar quantidade padrão baseada no tipo de ingrediente
    // Para ingredientes comuns, usar 100g como padrão
    return 100;
  };

  // Calcular macros baseado nas substituições simples (substituições pré-configuradas)
  const calcularMacrosComSubstituicoes = async (substituicoesAtuais: Record<string, string>) => {
    console.log('🧮 Iniciando cálculo de macros com substituições:', substituicoesAtuais);
    
    if (!receita || Object.keys(substituicoesAtuais).length === 0) {
      console.log('⚠️ Sem receita ou sem substituições, limpando macros modificados');
      setMacrosModificados(null);
      return;
    }
    
    try {
      setLoadingMacros(true);
      
      // Se houver substituições da API (premium), usar ela
      if (isPremiumFit && substituicoes.length > 0) {
        console.log('💎 Usando cálculo premium');
        await calcularMacros();
        return;
      }

      // Para substituições simples, buscar ingredientes similares e calcular diferença
      const macrosOriginal = {
        calorias: Number(receita.calorias) || 0,
        proteinas: Number(receita.proteinas) || 0,
        carboidratos: Number(receita.carboidratos) || 0,
        gorduras: Number(receita.gorduras) || 0,
        fibras: Number(receita.fibras) || 0,
      };

      console.log('📊 Macros originais:', macrosOriginal);

      const macrosModificado = { ...macrosOriginal };

      // Para cada substituição, buscar o ingrediente similar e calcular diferença
      for (const [ingredienteOriginalTexto, ingredienteSubstitutoTexto] of Object.entries(substituicoesAtuais)) {
        console.log(`\n🔄 Processando substituição:`);
        console.log(`   Original: "${ingredienteOriginalTexto}"`);
        console.log(`   Substituto: "${ingredienteSubstitutoTexto}"`);
        
        try {
          // Buscar ingrediente substituto similar
          console.log(`🔍 Buscando ingrediente substituto: "${ingredienteSubstitutoTexto}"`);
          const ingredienteSubstituto = await api.buscarIngredienteSimilar(ingredienteSubstitutoTexto);
          
          if (ingredienteSubstituto) {
            console.log('✅ Ingrediente substituto encontrado:', ingredienteSubstituto);
            
            // Extrair quantidade do ingrediente original
            const quantidadeOriginal = extrairQuantidade(ingredienteOriginalTexto);
            console.log(`📏 Quantidade extraída do original: ${quantidadeOriginal}g`);
            
            // Buscar também o ingrediente original se possível
            console.log(`🔍 Buscando ingrediente original: "${ingredienteOriginalTexto}"`);
            let ingredienteOriginal = await api.buscarIngredienteSimilar(ingredienteOriginalTexto);
            
            if (ingredienteOriginal) {
              console.log('✅ Ingrediente original encontrado:', ingredienteOriginal);
              
              // Calcular diferença nutricional
              const unidadeBase = 100; // gramas (padrão)
              const fatorOriginal = quantidadeOriginal / unidadeBase;
              const fatorSubstituto = quantidadeOriginal / unidadeBase; // mesma quantidade

              console.log(`📐 Fator de cálculo: ${fatorOriginal} (quantidade: ${quantidadeOriginal}g / unidade base: ${unidadeBase}g)`);

              // Subtrair valores do original
              const calOriginal = Number(ingredienteOriginal.calorias) * fatorOriginal;
              const protOriginal = Number(ingredienteOriginal.proteinas) * fatorOriginal;
              const carbOriginal = Number(ingredienteOriginal.carboidratos) * fatorOriginal;
              const gordOriginal = Number(ingredienteOriginal.gorduras) * fatorOriginal;
              
              console.log(`➖ Subtraindo do original: Cal=${calOriginal.toFixed(2)}, Prot=${protOriginal.toFixed(2)}, Carb=${carbOriginal.toFixed(2)}, Gord=${gordOriginal.toFixed(2)}`);
              
              macrosModificado.calorias -= calOriginal;
              macrosModificado.proteinas -= protOriginal;
              macrosModificado.carboidratos -= carbOriginal;
              macrosModificado.gorduras -= gordOriginal;
              if (ingredienteOriginal.fibras) {
                macrosModificado.fibras -= Number(ingredienteOriginal.fibras) * fatorOriginal;
              }

              // Adicionar valores do substituto
              const calSubstituto = Number(ingredienteSubstituto.calorias) * fatorSubstituto;
              const protSubstituto = Number(ingredienteSubstituto.proteinas) * fatorSubstituto;
              const carbSubstituto = Number(ingredienteSubstituto.carboidratos) * fatorSubstituto;
              const gordSubstituto = Number(ingredienteSubstituto.gorduras) * fatorSubstituto;
              
              console.log(`➕ Adicionando do substituto: Cal=${calSubstituto.toFixed(2)}, Prot=${protSubstituto.toFixed(2)}, Carb=${carbSubstituto.toFixed(2)}, Gord=${gordSubstituto.toFixed(2)}`);
              
              macrosModificado.calorias += calSubstituto;
              macrosModificado.proteinas += protSubstituto;
              macrosModificado.carboidratos += carbSubstituto;
              macrosModificado.gorduras += gordSubstituto;
              if (ingredienteSubstituto.fibras) {
                macrosModificado.fibras += Number(ingredienteSubstituto.fibras) * fatorSubstituto;
              }
            } else {
              console.log('⚠️ Ingrediente original não encontrado, apenas adicionando substituto');
              
              // Se não encontrar o original, apenas adicionar o substituto
              // (assumindo que está substituindo uma quantidade padrão)
              const quantidadePadrao = extrairQuantidade(ingredienteOriginalTexto);
              const fator = quantidadePadrao / 100; // unidade base é 100g

              console.log(`📐 Fator de cálculo (sem original): ${fator} (quantidade: ${quantidadePadrao}g / 100g)`);
              
              const calSubstituto = Number(ingredienteSubstituto.calorias) * fator;
              const protSubstituto = Number(ingredienteSubstituto.proteinas) * fator;
              const carbSubstituto = Number(ingredienteSubstituto.carboidratos) * fator;
              const gordSubstituto = Number(ingredienteSubstituto.gorduras) * fator;
              
              console.log(`➕ Adicionando do substituto: Cal=${calSubstituto.toFixed(2)}, Prot=${protSubstituto.toFixed(2)}, Carb=${carbSubstituto.toFixed(2)}, Gord=${gordSubstituto.toFixed(2)}`);

              macrosModificado.calorias += calSubstituto;
              macrosModificado.proteinas += protSubstituto;
              macrosModificado.carboidratos += carbSubstituto;
              macrosModificado.gorduras += gordSubstituto;
              if (ingredienteSubstituto.fibras) {
                macrosModificado.fibras += Number(ingredienteSubstituto.fibras) * fator;
              }
            }
          } else {
            console.log(`❌ Ingrediente substituto "${ingredienteSubstitutoTexto}" não encontrado na tabela`);
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar ingrediente substituto "${ingredienteSubstitutoTexto}":`, error);
          // Continuar com outras substituições mesmo se uma falhar
        }
      }

      // Garantir valores não negativos
      macrosModificado.calorias = Math.max(0, macrosModificado.calorias);
      macrosModificado.proteinas = Math.max(0, macrosModificado.proteinas);
      macrosModificado.carboidratos = Math.max(0, macrosModificado.carboidratos);
      macrosModificado.gorduras = Math.max(0, macrosModificado.gorduras);
      macrosModificado.fibras = Math.max(0, macrosModificado.fibras);

      console.log('\n📊 Macros finais calculados:');
      console.log('   Original:', macrosOriginal);
      console.log('   Modificado:', macrosModificado);
      console.log('   Diferença:', {
        calorias: (macrosModificado.calorias - macrosOriginal.calorias).toFixed(2),
        proteinas: (macrosModificado.proteinas - macrosOriginal.proteinas).toFixed(2),
        carboidratos: (macrosModificado.carboidratos - macrosOriginal.carboidratos).toFixed(2),
        gorduras: (macrosModificado.gorduras - macrosOriginal.gorduras).toFixed(2),
      });

      setMacrosModificados({
        macrosOriginal,
        macrosModificado,
        substituicoes: substituicoesAtuais,
      });
      
      console.log('✅ Macros atualizados no estado');
    } catch (error) {
      console.error('❌ Erro ao calcular macros com substituições:', error);
    } finally {
      setLoadingMacros(false);
    }
  };
  
  const buscarIngredientes = async () => {
    try {
      setLoadingIngredientes(true);
      // Usar busca avançada para melhor relevância
      const data = await api.searchIngredientesAdvanced(searchIngrediente, 20);
      setIngredientesDisponiveis(data);
    } catch (error) {
      console.error('Erro ao buscar ingredientes:', error);
    } finally {
      setLoadingIngredientes(false);
    }
  };

  const carregarSugestoesAutomaticas = async () => {
    if (!selectedIngrediente?.ingrediente_id) return;
    
    try {
      setLoadingSugestoes(true);
      const sugestoes = await api.sugerirSubstitutos(selectedIngrediente.ingrediente_id, 5);
      setSugestoesAutomaticas(sugestoes);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
    } finally {
      setLoadingSugestoes(false);
    }
  };

  const carregarHistoricoEFrequentes = async () => {
    try {
      const [historico, frequentes] = await Promise.all([
        api.getHistoricoSubstituicoes(5).catch(() => []),
        api.getSubstituicoesFrequentes(5).catch(() => []),
      ]);
      setHistoricoSubstituicoes(historico);
      setSubstituicoesFrequentes(frequentes);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const executarSubstituicao = async (ingredienteSubstituto: any) => {
    if (!selectedIngrediente) return;
    
    try {
      await api.createSubstituicao({
        receita_id: receitaId,
        ingrediente_original_id: selectedIngrediente.ingrediente_id,
        ingrediente_substituto_id: ingredienteSubstituto.id,
        quantidade: selectedIngrediente.quantidade,
        unidade: selectedIngrediente.unidade,
      });
      
      Alert.alert('Sucesso', 'Ingrediente substituído com sucesso!');
      setSelectedIngrediente(null);
      setSearchIngrediente('');
      setIngredientesDisponiveis([]);
      setSugestoesAutomaticas([]);
      setValidacaoCompatibilidade(null);
      await loadSubstituicoes();
      await calcularMacros();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao substituir ingrediente');
    }
  };

  const validarAntesDeSubstituir = async (ingredienteSubstituto: any) => {
    if (!selectedIngrediente?.ingrediente_id) return false;
    
    try {
      const validacao = await api.validarCompatibilidade(
        selectedIngrediente.ingrediente_id,
        ingredienteSubstituto.id
      );
      setValidacaoCompatibilidade(validacao);
      
      if (!validacao.compativel) {
        Alert.alert(
          'Atenção',
          `Esta substituição pode alterar significativamente os valores nutricionais.\n\nScore de compatibilidade: ${validacao.score}/100\n\n${validacao.alertas.join('\n')}\n\nDeseja continuar mesmo assim?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Continuar', 
              onPress: () => executarSubstituicao(ingredienteSubstituto),
              style: 'default'
            },
          ]
        );
        return false;
      } else if (validacao.alertas.length > 0) {
        Alert.alert(
          'Informação',
          `Substituição compatível, mas com algumas diferenças:\n\n${validacao.alertas.join('\n')}\n\nDeseja continuar?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Continuar', 
              onPress: () => executarSubstituicao(ingredienteSubstituto),
              style: 'default'
            },
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao validar compatibilidade:', error);
      // Se der erro na validação, permite substituir mesmo assim
      return true;
    }
  };
  
  const handleSubstituirIngrediente = async (ingredienteSubstituto: any, skipValidation: boolean = false) => {
    if (!selectedIngrediente) return;
    
    // Validar compatibilidade antes de substituir (se não foi pulado)
    if (!skipValidation) {
      const podeContinuar = await validarAntesDeSubstituir(ingredienteSubstituto);
      if (!podeContinuar) return; // A função já mostra o alerta e chama executarSubstituicao se o usuário confirmar
      // Se retornou true, significa que não há alertas e pode executar diretamente
      await executarSubstituicao(ingredienteSubstituto);
    } else {
      // Se skipValidation, executar diretamente sem validação
      await executarSubstituicao(ingredienteSubstituto);
    }
  };
  
  const handleRemoverSubstituicao = async (substituicaoId: string) => {
    try {
      await api.removeSubstituicao(substituicaoId);
      Alert.alert('Sucesso', 'Substituição removida!');
      await loadSubstituicoes();
      await calcularMacros();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao remover substituição');
    }
  };
  
  const handlePerguntarIA = async () => {
    if (!perguntaIA.trim()) return;
    
    try {
      setLoadingIA(true);
      const resposta = await api.consultarIA(receitaId, perguntaIA);
      setRespostaIA(resposta.resposta_ia);
      // Limpar campo de pergunta após enviar
      setPerguntaIA('');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao consultar IA');
    } finally {
      setLoadingIA(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c8921a" />
        </View>
      </SafeAreaView>
    );
  }

  if (!receita) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Receita não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Verificar se o conteúdo é premium e o usuário não é
  const isPremiumLocked = receita.is_premium && !receita.is_free && user?.subscription_tier !== 'premium_fit';

  if (isPremiumLocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.premiumLockContainer}>
          <View style={styles.premiumLockIconContainer}>
            <Ionicons name="lock-closed" size={80} color={colors.primary} />
          </View>
          <Text style={styles.premiumLockTitle}>Conteúdo Premium</Text>
          <Text style={styles.premiumLockDescription}>
            Esta receita é exclusiva para assinantes Premium Fit. Assine agora para ter acesso a todas as receitas, substituições inteligentes e suporte da nossa IA.
          </Text>
          <TouchableOpacity 
            style={styles.premiumLockButton}
            onPress={() => navigation.navigate('Subscription' as any)}
          >
            <Text style={styles.premiumLockButtonText}>CONHECER PLANOS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.premiumLockBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.premiumLockBackButtonText}>VOLTAR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Container da imagem com título sobreposto */}
        <View style={styles.imageContainer}>
          {/* Carrossel de Imagens */}
          {(() => {
            // Preparar array de imagens: usar imagens_url se disponível, senão usar imagem_url como fallback
            const images: string[] = [];
            if (receita.imagens_url && Array.isArray(receita.imagens_url) && receita.imagens_url.length > 0) {
              // Usar imagens_url se disponível
              images.push(...receita.imagens_url.map(img => getImageUrl(img) || '').filter(Boolean));
            } else if (receita.imagem_url) {
              // Fallback para imagem_url
              const imgUrl = getImageUrl(receita.imagem_url);
              if (imgUrl) {
                images.push(imgUrl);
              }
            }
            
            if (images.length > 0) {
              return (
                <ImageCarousel
                  images={images}
                  height={300}
                  showIndicators={images.length > 1}
                  enableZoom={true}
                />
              );
            }
            return null;
          })()}
          
          {/* Overlay escuro sutil apenas na parte inferior para legibilidade */}
          <View style={styles.imageOverlay} />

          {/* Avaliação em estrelas no topo esquerdo da imagem */}
          <View style={styles.ratingOverlayOverlay}>
            {[1, 2, 3, 4, 5].map((nota) => (
              <TouchableOpacity
                key={nota}
                onPress={() => avaliarReceita(nota)}
                disabled={loadingAvaliacao}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={avaliacaoUsuario && nota <= avaliacaoUsuario ? 'star' : 'star-outline'}
                  size={16}
                  color={avaliacaoUsuario && nota <= avaliacaoUsuario ? colors.primary : '#ffffff'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Botão de favoritos no topo direito da imagem */}
          <TouchableOpacity
            onPress={toggleFavorito}
            disabled={loadingFavorito}
            style={styles.favoriteButtonOverlay}
          >
            <Text style={[styles.favoriteIcon, !isFavorito && styles.favoriteIconInactive]}>
              {isFavorito ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>

          {/* Título sobreposto na imagem */}
          <View style={styles.titleOverlay}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{receita.titulo}</Text>
            </View>
          </View>
        </View>

        {/* Meta informações alinhadas horizontalmente */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>⏱️</Text>
            <Text style={styles.metaValue}>{receita.tempo_preparo || 0} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🍽️</Text>
            <Text style={styles.metaValue}>{receita.porcoes || 1} porções</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📊</Text>
            <Text style={styles.metaValue}>
              {receita.dificuldade === 'facil'
                ? 'Fácil'
                : receita.dificuldade === 'medio'
                ? 'Médio'
                : 'Difícil'}
            </Text>
          </View>
        </View>

        {receita.descricao && receita.descricao !== receita.titulo && receita.descricao.trim() !== '' && (
          <Text style={styles.description}>{receita.descricao}</Text>
        )}

        {/* Informações Nutricionais */}
        {(receita.calorias || receita.proteinas || receita.carboidratos || receita.gorduras) && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="stats-chart" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>
                  Nutrientes <Text style={styles.sectionTitleSubtitle}>{macrosModificados ? '(Modificada)' : '(por porção)'}</Text>
                </Text>
              </View>
              <View style={styles.sectionTitleUnderline} />
            </View>
            <View style={styles.macrosContainer}>
              {(macrosModificados?.macrosModificado.calorias || receita.calorias) && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>
                    {macrosModificados 
                      ? Math.round(Number(macrosModificados.macrosModificado.calorias))
                      : (isNaN(Number(receita.calorias)) ? receita.calorias : Math.round(Number(receita.calorias)))}
                  </Text>
                  <Text style={styles.macroLabel}>kcal</Text>
                  {macrosModificados && (
                    <Text style={styles.macroDiff}>
                      {Number(macrosModificados.macrosModificado.calorias) > Number(macrosModificados.macrosOriginal.calorias) ? '+' : ''}
                      {Math.round(Number(macrosModificados.macrosModificado.calorias) - Number(macrosModificados.macrosOriginal.calorias))}
                    </Text>
                  )}
                </View>
              )}
              {(macrosModificados?.macrosModificado.proteinas || receita.proteinas) && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>
                    {macrosModificados 
                      ? Number(macrosModificados.macrosModificado.proteinas).toFixed(1)
                      : (isNaN(Number(receita.proteinas)) ? receita.proteinas : Number(receita.proteinas).toFixed(1))}
                    {!isNaN(Number(receita.proteinas)) && 'g'}
                  </Text>
                  <Text style={styles.macroLabel}>Proteínas</Text>
                  {macrosModificados && (
                    <Text style={styles.macroDiff}>
                      {Number(macrosModificados.macrosModificado.proteinas) > Number(macrosModificados.macrosOriginal.proteinas) ? '+' : ''}
                      {(Number(macrosModificados.macrosModificado.proteinas) - Number(macrosModificados.macrosOriginal.proteinas)).toFixed(1)}g
                    </Text>
                  )}
                </View>
              )}
              {(macrosModificados?.macrosModificado.carboidratos || receita.carboidratos) && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>
                    {macrosModificados 
                      ? Number(macrosModificados.macrosModificado.carboidratos).toFixed(1)
                      : (isNaN(Number(receita.carboidratos)) ? receita.carboidratos : Number(receita.carboidratos).toFixed(1))}
                    {!isNaN(Number(receita.carboidratos)) && 'g'}
                  </Text>
                  <Text style={styles.macroLabel}>Carbos</Text>
                  {macrosModificados && (
                    <Text style={styles.macroDiff}>
                      {Number(macrosModificados.macrosModificado.carboidratos) > Number(macrosModificados.macrosOriginal.carboidratos) ? '+' : ''}
                      {(Number(macrosModificados.macrosModificado.carboidratos) - Number(macrosModificados.macrosOriginal.carboidratos)).toFixed(1)}g
                    </Text>
                  )}
                </View>
              )}
              {(macrosModificados?.macrosModificado.gorduras || receita.gorduras) && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>
                    {macrosModificados 
                      ? Number(macrosModificados.macrosModificado.gorduras).toFixed(1)
                      : (isNaN(Number(receita.gorduras)) ? receita.gorduras : Number(receita.gorduras).toFixed(1))}
                    {!isNaN(Number(receita.gorduras)) && 'g'}
                  </Text>
                  <Text style={styles.macroLabel}>Gorduras</Text>
                  {macrosModificados && (
                    <Text style={styles.macroDiff}>
                      {Number(macrosModificados.macrosModificado.gorduras) > Number(macrosModificados.macrosOriginal.gorduras) ? '+' : ''}
                      {(Number(macrosModificados.macrosModificado.gorduras) - Number(macrosModificados.macrosOriginal.gorduras)).toFixed(1)}g
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Linha secundária para Fibras e Sódio (se existirem) */}
            {(receita.fibras || receita.sodio || macrosModificados?.macrosModificado.fibras || macrosModificados?.macrosModificado.sodio) && (
              <View style={[styles.macrosContainer, { marginTop: 8, justifyContent: 'flex-start', gap: 8 }]}>
                {(macrosModificados?.macrosModificado.fibras || receita.fibras) && (
                  <View style={[styles.macroItem, { minWidth: '22%', flex: 0 }]}>
                    <Text style={styles.macroValue}>
                      {macrosModificados 
                        ? Number(macrosModificados.macrosModificado.fibras).toFixed(1)
                        : (isNaN(Number(receita.fibras)) ? receita.fibras : Number(receita.fibras).toFixed(1))}
                      {!isNaN(Number(receita.fibras)) && 'g'}
                    </Text>
                    <Text style={styles.macroLabel}>Fibras</Text>
                  </View>
                )}
                {(macrosModificados?.macrosModificado.sodio || receita.sodio) && (
                  <View style={[styles.macroItem, { minWidth: '22%', flex: 0 }]}>
                    <Text style={styles.macroValue}>
                      {macrosModificados 
                        ? Math.round(Number(macrosModificados.macrosModificado.sodio))
                        : (isNaN(Number(receita.sodio)) ? receita.sodio : Math.round(Number(receita.sodio)))}
                      {!isNaN(Number(receita.sodio)) && 'mg'}
                    </Text>
                    <Text style={styles.macroLabel}>Sódio</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Exibir aviso nutricional específico da receita (se houver) */}
            {receita.aviso_nutricional && receita.aviso_nutricional.trim() ? (
              <View style={styles.informacoesNutricionaisAviso}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                  <Ionicons name="information-circle" size={16} color={colors.primary} />
                  <Text style={[styles.informacoesNutricionaisAvisoTexto, { color: colors.primary, fontWeight: '600' }]}>
                    {receita.aviso_nutricional.trim()}
                  </Text>
                </View>
              </View>
            ) : null}
            
            {/* Aviso padrão para todas as receitas */}
            <View style={styles.informacoesNutricionaisAviso}>
              <Text style={styles.informacoesNutricionaisAvisoTexto}>
                Valores nutricionais estimados via aplicativo e não substituem orientação nutricional profissional.
              </Text>
            </View>
          </View>
        )}



        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="list" size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Ingredientes</Text>
              {isPremiumFit && (
                <TouchableOpacity
                  style={styles.iaButtonHeader}
                  onPress={() => setChatIAAberto(!chatIAAberto)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.sectionTitleUnderline} />
          </View>
          
          {/* Chat de IA */}
          {isPremiumFit && chatIAAberto && (
            <View style={styles.chatIAContainer}>
              <View style={styles.chatIAMessages}>
                <ScrollView 
                  style={{ flex: 1 }} 
                  contentContainerStyle={{ flexGrow: 1 }}
                  nestedScrollEnabled={true}
                >
                  {respostaIA ? (
                    <View style={styles.chatIAMessage}>
                      <Text style={styles.chatIAMessageText}>{respostaIA}</Text>
                    </View>
                  ) : (
                    <Text style={styles.chatIAPlaceholder}>
                      Faça perguntas sobre substituições de ingredientes ou dúvidas sobre a receita.
                    </Text>
                  )}
                </ScrollView>
              </View>
              <View style={styles.chatIAInputContainer}>
                <TextInput
                  style={styles.chatIAInput}
                  placeholder="Digite sua pergunta..."
                  placeholderTextColor="#666"
                  value={perguntaIA}
                  onChangeText={setPerguntaIA}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[styles.chatIASendButton, (loadingIA || !perguntaIA.trim()) && styles.chatIASendButtonDisabled]}
                  onPress={handlePerguntarIA}
                  disabled={loadingIA || !perguntaIA.trim()}
                >
                  {loadingIA ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="send" size={18} color="#ffffff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
          {receita.ingredientes && Array.isArray(receita.ingredientes) && receita.ingredientes.length > 0 ? (
            receita.ingredientes
              .filter((ingrediente) => ingrediente && String(ingrediente).trim() !== '')
              .map((ingrediente, index) => {
                const ingredienteTexto = String(ingrediente).trim();
                // Verificar se há substituição cadastrada para este ingrediente
                // Tentar encontrar correspondência exata ou parcial (caso o ingrediente tenha texto adicional)
                let substituicoesParaIngrediente: string[] = [];
                
                if (receita.substituicoes_ingredientes && Object.keys(receita.substituicoes_ingredientes).length > 0) {
                  // Primeiro, tentar correspondência exata
                  let substituicao = receita.substituicoes_ingredientes[ingredienteTexto];
                  
                  // Se não encontrar correspondência exata, tentar encontrar por substring
                  if (!substituicao) {
                    const chaves = Object.keys(receita.substituicoes_ingredientes);
                    const chaveEncontrada = chaves
                      .filter(chave => ingredienteTexto.includes(chave) || chave.includes(ingredienteTexto))
                      .sort((a, b) => b.length - a.length)[0];
                    
                    if (chaveEncontrada) {
                      substituicao = receita.substituicoes_ingredientes[chaveEncontrada];
                    }
                  }
                  
                  if (substituicao) {
                    if (Array.isArray(substituicao)) {
                      substituicoesParaIngrediente = substituicao.filter(s => s && String(s).trim() !== '');
                    } else if (typeof substituicao === 'object' && substituicao !== null) {
                      const valores = Object.values(substituicao).map(v => String(v));
                      substituicoesParaIngrediente = valores.filter(s => s && s.trim() !== '' && s !== '[object Object]');
                    } else if (typeof substituicao === 'string' && substituicao.trim() !== '') {
                      substituicoesParaIngrediente = [substituicao.trim()];
                    }
                  }
                }
                
                const temSubstituicao = substituicoesParaIngrediente.length > 0;
                
                const selectAberto = ingredienteComSelectAberto === ingredienteTexto;
                
                // Verificar se este ingrediente foi substituído
                const foiSubstituido = ingredientesSubstituidos[ingredienteTexto];
                const ingredienteSubstituto = foiSubstituido;
                
                return (
                  <View key={index}>
                    <View style={styles.listItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={[styles.listText, foiSubstituido && styles.ingredienteSubstituido]}>
                        {ingredienteTexto}
                      </Text>
                      {temSubstituicao && (
                        <TouchableOpacity
                          style={styles.substituicaoIconContainer}
                          onPress={() => {
                            setIngredienteComSelectAberto(selectAberto ? null : ingredienteTexto);
                          }}
                        >
                          <Ionicons name={selectAberto ? "chevron-up" : "repeat"} size={18} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    {/* Mostrar ingrediente substituto abaixo do original */}
                    {foiSubstituido && (
                      <View style={styles.ingredienteSubstitutoContainer}>
                        <View style={styles.ingredienteSubstitutoBadge}>
                          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                          <Text style={styles.ingredienteSubstitutoLabel}>Substituído por:</Text>
                        </View>
                        <View style={styles.listItem}>
                          <Text style={styles.bullet}>→</Text>
                          <Text style={styles.ingredienteSubstitutoTexto}>{ingredienteSubstituto}</Text>
                          <TouchableOpacity
                            style={styles.removerSubstituicaoButton}
                            onPress={() => {
                              const novasSubstituicoes = { ...ingredientesSubstituidos };
                              delete novasSubstituicoes[ingredienteTexto];
                              setIngredientesSubstituidos(novasSubstituicoes);
                              calcularMacrosComSubstituicoes(novasSubstituicoes);
                            }}
                          >
                            <Ionicons name="close-circle" size={18} color="#ff4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    
                    {temSubstituicao && selectAberto && (
                      <View style={styles.substituicaoSelectContainer}>
                        <Text style={styles.substituicaoSelectLabel}>Substituir por:</Text>
                        {substituicoesParaIngrediente.map((substituicao, subIndex) => (
                          <TouchableOpacity
                            key={subIndex}
                            style={styles.substituicaoSelectOption}
                            onPress={async () => {
                              const novasSubstituicoes = {
                                ...ingredientesSubstituidos,
                                [ingredienteTexto]: substituicao,
                              };
                              setIngredientesSubstituidos(novasSubstituicoes);
                              setIngredienteComSelectAberto(null);
                              await calcularMacrosComSubstituicoes(novasSubstituicoes);
                            }}
                          >
                            <Text style={styles.substituicaoSelectOptionText}>{substituicao}</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
          ) : (
            <Text style={styles.listText}>Nenhum ingrediente informado</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="restaurant" size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Modo de Preparo</Text>
            </View>
            <View style={styles.sectionTitleUnderline} />
          </View>
          {receita.modo_preparo && Array.isArray(receita.modo_preparo) && receita.modo_preparo.length > 0 ? (
            receita.modo_preparo
              .filter((passo) => passo && String(passo).trim() !== '')
              .map((passo, index) => (
                <View key={index} style={styles.stepItem}>
                  <Text style={styles.stepNumber}>{index + 1}.</Text>
                  <Text style={styles.stepText}>{String(passo).trim()}</Text>
                </View>
              ))
          ) : (
            <Text style={styles.stepText}>Nenhum passo informado</Text>
          )}

          {/* Dica de Ouro */}
          {receita.dica && receita.dica.trim() ? (
            <View style={styles.dicaContainer}>
              <View style={styles.dicaHeader}>
                <Ionicons name="bulb" size={20} color={colors.primary} />
                <Text style={styles.dicaTitle}>Dica de Ouro</Text>
              </View>
              <Text style={styles.dicaText}>{receita.dica.trim()}</Text>
            </View>
          ) : null}

          {/* Finalização */}
          {receita.finalizacao && receita.finalizacao.trim() ? (
            <View style={[styles.dicaContainer, { backgroundColor: '#f0f9ff', borderColor: '#bae6fd', marginTop: 12 }]}>
              <View style={styles.dicaHeader}>
                <Ionicons name="star" size={20} color="#0284c7" />
                <Text style={[styles.dicaTitle, { color: '#0284c7' }]}>Finalização</Text>
              </View>
              <Text style={styles.dicaText}>{receita.finalizacao.trim()}</Text>
            </View>
          ) : null}
        </View>

        {receita.video_url && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="videocam" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Vídeo</Text>
              </View>
              <View style={styles.sectionTitleUnderline} />
            </View>
            <TouchableOpacity
              style={styles.videoThumbnailContainer}
              onPress={() => setShowVideoPlayer(true)}
              activeOpacity={0.8}
            >
              {(() => {
                // Tenta pegar a thumb do vídeo, se não conseguir, usa a imagem principal da receita como fundo
                const videoThumb = getVideoThumbnail(receita.video_url || '');
                const thumbnailUrl = receita.video_thumbnail_url || videoThumb || getImageUrl(receita.imagem_url);
                
                return (
                  <>
                    {thumbnailUrl ? (
                      <Image
                        source={{ uri: thumbnailUrl }}
                        style={styles.videoThumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.videoThumbnail, { backgroundColor: colors.cardBackground, justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="image-outline" size={48} color="rgba(200, 146, 26, 0.2)" />
                      </View>
                    )}
                    <View style={styles.videoPlayOverlay}>
                      <View style={styles.videoPlayButton}>
                        <Ionicons name="play" size={32} color="#ffffff" />
                      </View>
                      <Text style={[styles.videoButtonText, { color: '#fff', marginTop: 12, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4, textShadowOffset: { width: 1, height: 1 } }]}>
                        Assistir Vídeo
                      </Text>
                    </View>
                  </>
                );
              })()}
            </TouchableOpacity>
          </View>
        )}

        {receita.tags && receita.tags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="pricetags" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Tags</Text>
              </View>
              <View style={styles.sectionTitleUnderline} />
            </View>
            <View style={styles.tagsContainer}>
              {receita.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal do Player de Vídeo */}
      {receita && receita.video_url && (
        <Modal
          visible={showVideoPlayer}
          animationType="slide"
          onRequestClose={() => setShowVideoPlayer(false)}
        >
          <VideoPlayer
            videoUrl={receita.video_url}
            title={receita.titulo}
            onClose={() => setShowVideoPlayer(false)}
          />
        </Modal>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
  },
  content: {
    paddingBottom: 24,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundTertiary,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: colors.overlay,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.title,
    color: '#ffffff',
    flex: 1,
    lineHeight: 24,
  },
  favoriteButtonOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  sectionTitleSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    textTransform: 'lowercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  favoriteIconInactive: {
    opacity: 0.3, // Transparente quando não favoritado
  },
  premiumText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    fontFamily: fonts.body,
    color: '#ffffff',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 22,
    marginRight: 6,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  section: {
    padding: 16,
  },
  sectionTitleContainer: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.title,
    color: colors.primary,
    flex: 1,
    letterSpacing: 0.5,
  },
  iaButtonHeader: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 146, 26, 0.1)',
    marginLeft: 8,
  },
  sectionTitleUnderline: {
    height: 1.5,
    backgroundColor: 'rgba(200, 146, 26, 0.2)',
    width: '100%',
    borderRadius: 1,
    marginTop: 2,
  },
  ratingOverlayOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  chatIAContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  chatIAMessages: {
    maxHeight: 200,
    padding: 12,
    minHeight: 60,
  },
  chatIAMessage: {
    backgroundColor: 'rgba(200, 146, 26, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  chatIAMessageText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  chatIAPlaceholder: {
    color: '#999',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  chatIAInputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
    gap: 8,
  },
  chatIAInput: {
    flex: 1,
    backgroundColor: colors.background,
    color: colors.text,
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatIASendButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  chatIASendButtonDisabled: {
    opacity: 0.5,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    color: colors.primary,
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
    minWidth: 20,
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  avaliacaoContainer: {
    marginTop: 10,
  },
  avaliacaoLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: 12,
  },
  estrelasContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  avaliacaoMediaContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avaliacaoMediaText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  videoThumbnailContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    position: 'relative',
    height: 200,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  videoButton: {
    backgroundColor: colors.cardBackground,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  videoButtonText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    marginTop: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  avaliacaoContainer: {
    marginTop: 10,
  },
  avaliacaoLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: 12,
  },
  estrelasContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  avaliacaoMediaContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avaliacaoMediaText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(200, 146, 26, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(200, 146, 26, 0.3)',
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  macrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  informacoesNutricionaisTexto: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    width: '100%',
  },
  informacoesNutricionaisItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    width: '100%',
    flexWrap: 'wrap',
  },
  informacoesNutricionaisBullet: {
    color: colors.primary,
    fontSize: 16,
    marginRight: 10,
    marginTop: 1,
    fontWeight: 'bold',
  },
  informacoesNutricionaisLinha: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  informacoesNutricionaisAviso: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  informacoesNutricionaisAvisoTexto: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  macroItem: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: colors.cardBackground,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
  macroDiff: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  compactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    minHeight: 50,
  },
  compactButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.cardBackground,
  },
  compactButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  compactButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
  },
  brainIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brainIcon: {
    fontSize: 16,
  },
  expandableButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  expandableButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expandableButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiIconText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  expandableButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  expandableButtonArrow: {
    color: colors.primary,
    fontSize: 16,
    marginLeft: 8,
  },
  expandedContent: {
    marginTop: 12,
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  expandedSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  frequenteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  frequenteText: {
    flex: 1,
    fontSize: 13,
    color: '#ffffff',
  },
  frequenteCount: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    backgroundColor: 'rgba(200, 146, 26, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sugestaoItem: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  sugestaoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  similaridadeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  similaridadeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  substituicoesContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  substituicoesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  substituicaoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  substituicaoText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ingredienteOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ingredienteOptionText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  ingredienteOptionArrow: {
    color: colors.primary,
    fontSize: 20,
    marginLeft: 12,
  },
  selectedIngredienteContainer: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedIngredienteLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  selectedIngredienteText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  changeButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 6,
  },
  changeButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  searchInput: {
    backgroundColor: colors.cardBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    marginTop: 8,
  },
  ingredienteSubstitutoOption: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ingredienteSubstitutoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  ingredienteSubstitutoMacros: {
    fontSize: 12,
    color: '#999',
  },
  iaDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    lineHeight: 20,
  },
  iaInput: {
    backgroundColor: colors.cardBackground,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  iaButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  iaButtonDisabled: {
    opacity: 0.5,
  },
  iaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iaRespostaContainer: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  iaRespostaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  iaRespostaText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  substituicaoIconContainer: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(200, 146, 26, 0.1)',
  },
  substituicaoSelectContainer: {
    marginLeft: 20,
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  substituicaoSelectLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  substituicaoSelectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 6,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  substituicaoSelectOptionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  ingredienteSubstituido: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  ingredienteSubstitutoContainer: {
    marginLeft: 20,
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  ingredienteSubstitutoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  ingredienteSubstitutoLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  ingredienteSubstitutoTexto: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
    flex: 1,
  },
  removerSubstituicaoButton: {
    marginLeft: 8,
    padding: 4,
  },
  dicaContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(200, 146, 26, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 146, 26, 0.2)',
    borderStyle: 'dashed',
  },
  dicaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dicaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dicaText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  premiumLockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#0a0a0a',
  },
  premiumLockIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(200, 146, 26, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: 'rgba(200, 146, 26, 0.3)',
  },
  premiumLockTitle: {
    fontSize: 24,
    fontFamily: fonts.title,
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  premiumLockDescription: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  premiumLockButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  premiumLockButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: 1,
  },
  premiumLockBackButton: {
    paddingVertical: 12,
  },
  premiumLockBackButtonText: {
    color: '#666',
    fontSize: 14,
    fontFamily: fonts.body,
    letterSpacing: 1,
  },
});

