import dayjs from 'dayjs'
import { useCallback, useState } from 'react'
import { focusTimeService } from '../services/api'

interface FocusSession {
  timeFrom: Date
  timeTo?: Date
  duration?: number
}

interface FocusTimeMetrics {
  dailyMetrics: Array<{
    date: string
    totalDuration: number
    sessionsCount: number
    longestSession: number
    shortestSession: number
  }>
  monthlyMetrics: {
    totalMonthDuration: number
    totalSessions: number
    averageSessionDuration: number
  }
}

export const useFocusTime = () => {
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
  const [metrics, setMetrics] = useState<FocusTimeMetrics | null>(null)
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startFocusSession = useCallback(async () => {
    try {
      setIsLoading(true)
      const timeFrom = new Date()
      const response = await focusTimeService.startFocusSession(timeFrom)
      
      setCurrentSession({
        timeFrom,
      })
      setError(null)
    } catch (err) {
      setError('Erro ao iniciar sessão de foco')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const endFocusSession = useCallback(async () => {
    if (!currentSession) return

    try {
      setIsLoading(true)
      const timeTo = new Date()
      const response = await focusTimeService.endFocusSession(
        currentSession.timeFrom, 
        timeTo
      )
      
      // Calcular duração
      const duration = dayjs(timeTo).diff(currentSession.timeFrom, 'minute')

      const completedSession = {
        ...currentSession,
        timeTo,
        duration
      }

      // Atualizar lista de sessões
      setSessions(prev => [...prev, completedSession])
      
      // Limpar sessão atual
      setCurrentSession(null)
      setError(null)

      return completedSession
    } catch (err) {
      setError('Erro ao finalizar sessão de foco')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [currentSession])

  const fetchFocusTimeMetrics = useCallback(async (date?: Date) => {
    try {
      setIsLoading(true)
      const metricsData = await focusTimeService.getFocusTimeMetrics(
        date || new Date()
      )
      
      setMetrics(metricsData)
      setError(null)
      return metricsData
    } catch (err) {
      setError('Erro ao buscar métricas de tempo de foco')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const listFocusSessions = useCallback(async () => {
    try {
      setIsLoading(true)
      const sessionsList = await focusTimeService.listFocusSessions()
      
      setSessions(sessionsList)
      setError(null)
      return sessionsList
    } catch (err) {
      setError('Erro ao listar sessões de foco')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    currentSession,
    metrics,
    sessions,
    isLoading,
    error,
    startFocusSession,
    endFocusSession,
    fetchFocusTimeMetrics,
    listFocusSessions
  }
} 