import { Platform, Alert } from 'react-native';
import * as IAP from 'react-native-iap';
import { api } from './api';

// IDs dos produtos que serão configurados na Apple Store Connect e Google Play Console
// Você deverá substituir estes valores pelos IDs reais criados nos painéis
export const IAP_SKUS = Platform.select({
  ios: [
    'fit_rapido_mensal',
    'fit_rapido_trimestral',
    'fit_rapido_anual'
  ],
  android: [
    'fit_rapido_mensal',
    'fit_rapido_trimestral',
    'fit_rapido_anual'
  ],
}) || [];

class IAPService {
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;

  /**
   * Inicializa a conexão com a loja e os listeners de compra
   */
  async init(onPurchaseSuccess: (purchase: IAP.Purchase) => void) {
    try {
      await IAP.initConnection();
      
      // No Android, é necessário consumir as compras finalizadas
      if (Platform.OS === 'android') {
        await IAP.flushFailedPurchasesCachedAsPendingAndroid();
      }

      // Listener para atualizações de compra bem-sucedidas
      this.purchaseUpdateSubscription = IAP.purchaseUpdatedListener(async (purchase: IAP.Purchase) => {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          try {
            // 1. Validar no nosso Backend
            if (Platform.OS === 'ios') {
              await api.validateIosReceipt(receipt, purchase.transactionId);
            } else {
              await api.validateAndroidPurchase(receipt, purchase.productId, purchase.transactionId);
            }

            // 2. Finalizar a transação na Loja (OBRIGATÓRIO)
            await IAP.finishTransaction({ purchase, isConsumable: false });
            
            // 3. Notificar o componente para atualizar a UI
            onPurchaseSuccess(purchase);
            
          } catch (error) {
            console.error('Erro ao validar ou finalizar compra:', error);
            Alert.alert('Erro', 'Não foi possível validar sua compra. Entre em contato com o suporte.');
          }
        }
      });

      // Listener para erros
      this.purchaseErrorSubscription = IAP.purchaseErrorListener((error: IAP.PurchaseError) => {
        console.warn('Erro na compra IAP:', error);
        if (error.code !== 'E_USER_CANCELLED') {
          Alert.alert('Erro no Pagamento', error.message);
        }
      });

    } catch (err) {
      console.warn('Erro ao inicializar IAP:', err);
    }
  }

  /**
   * Finaliza as conexões
   */
  async end() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
    await IAP.endConnection();
  }

  /**
   * Busca as informações dos produtos (preços, nomes) direto da Apple/Google
   */
  async getProducts() {
    try {
      return await IAP.getProducts({ skus: IAP_SKUS });
    } catch (err) {
      console.warn('Erro ao buscar produtos:', err);
      return [];
    }
  }

  /**
   * Inicia o processo de compra
   */
  async requestPurchase(sku: string) {
    try {
      if (Platform.OS === 'ios') {
        await IAP.requestPurchase({ sku });
      } else {
        await IAP.requestSubscription({ sku });
      }
    } catch (err: any) {
      console.warn('Erro ao solicitar compra:', err.message);
      throw err;
    }
  }

  /**
   * Restaura compras anteriores
   */
  async restorePurchases() {
    try {
      const purchases = await IAP.getAvailablePurchases();
      if (purchases.length > 0) {
        // Enviar para o backend para restaurar o acesso do usuário
        await api.restorePurchases(Platform.OS as 'ios' | 'android');
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Erro ao restaurar:', err);
      return false;
    }
  }
}

export const iapService = new IAPService();
