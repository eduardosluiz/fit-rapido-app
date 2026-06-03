import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ConfirmDialog from '../components/admin/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  confirm: (options: string | ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = useCallback((opts: string | ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      if (typeof opts === 'string') {
        setOptions({ message: opts });
      } else {
        setOptions(opts);
      }
      setResolver({ resolve });
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(true);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(false);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        isOpen={isOpen}
        title={options.title || 'Confirmação'}
        message={options.message}
        confirmText={options.confirmText || 'Confirmar'}
        cancelText={options.cancelText || 'Cancelar'}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
}
