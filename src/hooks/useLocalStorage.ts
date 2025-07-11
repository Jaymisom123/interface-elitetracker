import { useState } from 'react'

type SetValue<T> = T | ((val: T) => T)

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  // State para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Obter do localStorage pelo key
      const item = window.localStorage.getItem(key)
      // Parse do JSON armazenado ou retornar initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // Se erro, retornar initialValue
      return initialValue
    }
  })

  // Retornar uma versão "wrapped" da função setter do useState que ...
  // ... persiste o novo valor no localStorage.
  const setValue = (value: SetValue<T>) => {
    try {
      // Permitir valor ser uma função para ter a mesma API do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Salvar no state
      setStoredValue(valueToStore)
      // Salvar no localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      // Um erro mais avançado de handling poderia ir aqui
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage 