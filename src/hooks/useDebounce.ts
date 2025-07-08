import { useEffect, useState } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  // State e setter para o valor com debounce
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Atualizar o valor com debounce após o delay especificado
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancelar o timeout se value mudar (também na cleanup da desmontagem)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // Apenas re-executar se value ou delay mudarem

  return debouncedValue
}

export default useDebounce 