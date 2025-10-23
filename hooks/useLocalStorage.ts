'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage - Hook para gerenciar estado no localStorage
 * 
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 * 
 * // Usar como useState normal
 * setTheme('dark');
 * 
 * // Remover do localStorage
 * setTheme(null);
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | null) => void, () => void] {
  // State para armazenar nosso valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Função para atualizar o valor
  const setValue = useCallback(
    (value: T | null) => {
      try {
        // Se value é null, remove do localStorage
        if (value === null) {
          setStoredValue(initialValue);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
          }
          return;
        }

        // Atualiza o state
        setStoredValue(value);

        // Salva no localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`Erro ao salvar localStorage key "${key}":`, error);
      }
    },
    [key, initialValue]
  );

  // Função para remover o valor
  const removeValue = useCallback(() => {
    setValue(null);
  }, [setValue]);

  // Sincronizar com mudanças em outras abas
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Erro ao sincronizar localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
