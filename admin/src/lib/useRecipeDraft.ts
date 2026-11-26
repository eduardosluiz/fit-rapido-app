'use client';

import { useCallback, useRef, useState } from 'react';

// Local recovery only: never publishes or writes a recipe to the API.
export function useRecipeDraft<T extends object>(initial: T, key: string | null) {
  const [value, update] = useState(initial);
  const [notice, setNotice] = useState('');
  const current = useRef(initial);
  const initialized = useRef<string | null>(null);
  const baseline = useRef(initial);

  const initialize = useCallback((saved: T) => {
    if (!key || initialized.current === key) return;
    initialized.current = key;
    baseline.current = saved;
    let next = saved;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.version === 1 && draft.value && typeof draft.value === 'object') {
          next = { ...saved, ...draft.value };
          setNotice('Preenchimento recuperado neste navegador. Confira os campos e clique em Salvar para enviar ao aplicativo.');
        }
      }
    } catch { setNotice('Não foi possível recuperar o preenchimento local.'); }
    current.current = next;
    update(next);
  }, [key]);

  const setValue = useCallback((action: T | ((previous: T) => T)) => {
    const next = typeof action === 'function' ? (action as (previous: T) => T)(current.current) : action;
    current.current = next;
    update(next);
    if (key && initialized.current === key) {
      try {
        localStorage.setItem(key, JSON.stringify({ version: 1, value: next }));
        setNotice('Preenchimento guardado neste navegador. Clique em Salvar para enviar ao aplicativo.');
      } catch { setNotice('Não foi possível guardar neste navegador. Salve a receita antes de sair.'); }
    }
  }, [key]);

  const clear = useCallback(() => {
    if (key) { try { localStorage.removeItem(key); } catch { /* storage unavailable */ } }
  }, [key]);

  const discard = () => {
    clear();
    current.current = baseline.current;
    update(baseline.current);
    setNotice('Preenchimento local descartado.');
  };
  return { value, setValue, initialize, clear, discard, notice };
}
