'use client';

import { useEffect } from 'react';

export function SuppressExtensionErrors() {
  useEffect(() => {
    // Usar requestIdleCallback ou setTimeout com delay maior para garantir que não interfira na renderização
    let mounted = true;
    
    const setupErrorSuppression = () => {
      if (!mounted) {
        return null;
      }
      // Lista de padrões de erros de extensões
        const extensionPatterns = [
          'chrome-extension://',
          'moz-extension://',
          'window.ethereum',
          'ethereum proxy',
          'Invalid property descriptor',
          'Cannot set property ethereum',
          'Cannot redefine property: ethereum',
          'Cannot read properties of null',
          'hostname check',
          'hostname_check',
          'Error sending to background hostname check',
          'Pocket Universe',
          'Nightly Wallet',
          'Backpack couldn\'t override',
          'isDevEnv()',
          'chrome.runtime',
          'content-script',
          'inject.ts',
          'inject.chrome',
          'ethereum.js',
          'fiikommddbeccaoicoejoniammnalkfa', // ID da extensão
          'Object.defineProperty',
          'accessors and a value',
          'writable attribute',
          'fd55cc53.js',
        ];

      const isExtensionError = (message: string): boolean => {
        if (!message) return false;
        const lowerMessage = message.toLowerCase();
        return extensionPatterns.some(pattern => 
          lowerMessage.includes(pattern.toLowerCase())
        );
      };

      // Interceptar console.error de forma segura (sem causar atualizações de estado)
      const originalError = console.error;
      console.error = (...args: any[]) => {
        try {
          const errorString = args.map(arg => 
            typeof arg === 'string' ? arg : 
            arg?.message || 
            arg?.toString() || 
            JSON.stringify(arg)
          ).join(' ');
          
          if (!isExtensionError(errorString)) {
            // Usar setTimeout com delay mínimo para evitar interferência na renderização
            setTimeout(() => {
              if (mounted) {
                originalError.apply(console, args);
              }
            }, 0);
          }
        } catch (e) {
          // Se houver erro na interceptação, chamar original de forma assíncrona
          setTimeout(() => {
            if (mounted) {
              originalError.apply(console, args);
            }
          }, 0);
        }
      };

      // Interceptar console.warn de forma segura
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        try {
          const warnString = args.map(arg => 
            typeof arg === 'string' ? arg : 
            arg?.message || 
            arg?.toString() || 
            JSON.stringify(arg)
          ).join(' ');
          
          if (!isExtensionError(warnString)) {
            setTimeout(() => {
              if (mounted) {
                originalWarn.apply(console, args);
              }
            }, 0);
          }
        } catch (e) {
          setTimeout(() => {
            if (mounted) {
              originalWarn.apply(console, args);
            }
          }, 0);
        }
      };

      // Interceptar console.log de forma segura
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        try {
          const logString = args.map(arg => 
            typeof arg === 'string' ? arg : 
            arg?.message || 
            arg?.toString() || 
            JSON.stringify(arg)
          ).join(' ');
          
          if (!isExtensionError(logString) && 
              !logString.includes('Pocket Universe is running!') &&
              !logString.includes('Nightly Wallet Injected Successfully') &&
              !logString.includes('Nightly: Overwrites EVM default provider')) {
            setTimeout(() => {
              if (mounted) {
                originalLog.apply(console, args);
              }
            }, 0);
          }
        } catch (e) {
          setTimeout(() => {
            if (mounted) {
              originalLog.apply(console, args);
            }
          }, 0);
        }
      };

      // Interceptar erros globais (window.onerror)
      const originalOnError = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        try {
          const errorMessage = String(message || '');
          const errorSource = String(source || '');
          const errorStack = error?.stack || '';
          
          if (isExtensionError(errorMessage) || 
              isExtensionError(errorSource) ||
              isExtensionError(errorStack)) {
            return true; // Suprime o erro
          }
          
          if (originalOnError) {
            return originalOnError(message, source, lineno, colno, error);
          }
        } catch (e) {
          // Se houver erro, não suprimir
        }
        return false;
      };

      // Interceptar erros não capturados (unhandledrejection e error events)
      const handleError = (event: ErrorEvent) => {
        try {
          const errorMessage = event.message || '';
          const errorSource = event.filename || '';
          
          if (isExtensionError(errorMessage) || isExtensionError(errorSource)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
          }
        } catch (e) {
          // Se houver erro, permitir propagação
        }
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        try {
          const reason = event.reason;
          const errorMessage = reason?.message || String(reason || '');
          
          if (isExtensionError(errorMessage)) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        } catch (e) {
          // Se houver erro, permitir propagação
        }
      };

      window.addEventListener('error', handleError, true);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      // Retornar função de cleanup
      return {
        cleanup: () => {
          console.error = originalError;
          console.warn = originalWarn;
          console.log = originalLog;
          window.onerror = originalOnError;
          window.removeEventListener('error', handleError, true);
          window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        }
      };
    };

    // Usar setTimeout com delay maior para garantir que a configuração aconteça após a renderização completa
    let cleanupFn: (() => void) | null = null;
    
    const timeoutId = setTimeout(() => {
      if (mounted) {
        const result = setupErrorSuppression();
        if (result) {
          cleanupFn = result.cleanup;
        }
      }
    }, 100); // Delay maior para garantir que não interfira na renderização
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, []);

  return null;
}
