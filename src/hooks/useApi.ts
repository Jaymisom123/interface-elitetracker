import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface UseApiOptions {
  immediate?: boolean
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (options?: UseApiOptions) => Promise<T | null>
  reset: () => void
}

function useApi<T = any>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()

  const execute = async (executeOptions: UseApiOptions = {}): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      // Combinar opções padrão com opções de execução
      const finalOptions = { ...options, ...executeOptions }

      // Obter token de autenticação
      const token = localStorage.getItem('jwt_token')

      // Headers padrão
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...finalOptions.headers
      }

      // Adicionar token se disponível
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      // Fazer requisição
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
        method: finalOptions.method || 'GET',
        headers,
        body: finalOptions.body ? JSON.stringify(finalOptions.body) : undefined
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro na API:', errorMessage)
      return null

    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
    setLoading(false)
  }

  // Executar automaticamente se immediate for true
  useEffect(() => {
    if (options.immediate && user) {
      execute()
    }
  }, [url, user, options.immediate])

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}

export default useApi 