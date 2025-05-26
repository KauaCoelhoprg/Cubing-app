
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Buscar do localStorage
      const item = window.localStorage.getItem(key);
      // Parse do JSON armazenado ou retornar valor inicial
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se erro, retornar valor inicial
      console.log(error);
      return initialValue;
    }
  });

  // Função para definir valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que value seja uma função para ter a mesma API do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Salvar no estado
      setStoredValue(valueToStore);
      // Salvar no localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // Uma implementação mais robusta registraria o erro em um serviço de relatórios
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}

export default useLocalStorage;
