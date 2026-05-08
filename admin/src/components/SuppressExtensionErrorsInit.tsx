'use client';

// Este componente executa código imediatamente quando importado
// para suprimir erros de extensões ANTES do Next.js processar

if (typeof window !== 'undefined') {
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
    'fiikommddbeccaoicoejoniammnalkfa',
    'Object.defineProperty',
    'accessors and a value',
    'writable attribute',
    'fd55cc53.js',
  ];

  const isExtensionError = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return extensionPatterns.some(pattern => 
      lowerMessage.includes(pattern.toLowerCase())
    );
  };

  // Interceptar window.onerror ANTES do Next.js
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = String(message || '');
    const errorSource = String(source || '');
    const errorStack = error?.stack || '';
    
    if (isExtensionError(errorMessage) || 
        isExtensionError(errorSource) || 
        isExtensionError(errorStack)) {
      return true; // Suprime o erro
    }
    
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Interceptar TypeError especificamente (o erro que aparece no overlay)
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj: any, prop: string, descriptor: any) {
    try {
      return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (e: any) {
      const errorMessage = e?.message || String(e || '');
      if (isExtensionError(errorMessage) || 
          errorMessage.includes('accessors and a value') ||
          errorMessage.includes('writable attribute')) {
        // Suprimir o erro silenciosamente
        return obj;
      }
      throw e;
    }
  };

  // Interceptar unhandledrejection
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorMessage = reason?.message || String(reason || '');
    
    if (isExtensionError(errorMessage)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Interceptar error events
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || '';
    const errorSource = event.filename || '';
    
    if (isExtensionError(errorMessage) || isExtensionError(errorSource)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }, true);
}

// Componente vazio que apenas força a execução do código acima
export function SuppressExtensionErrorsInit() {
  return null;
}

