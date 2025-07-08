import { useCallback, useState } from 'react'

function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue)

  // Função para alternar o valor
  const toggle = useCallback(() => {
    setValue(prevValue => !prevValue)
  }, [])

  // Função para definir um valor específico
  const setToggle = useCallback((newValue: boolean) => {
    setValue(newValue)
  }, [])

  return [value, toggle, setToggle]
}

export default useToggle 