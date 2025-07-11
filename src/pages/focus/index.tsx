import { Indicator } from '@mantine/core'
import { Calendar } from '@mantine/dates'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { Clock, ListChecks, Plus } from 'phosphor-react'

// Configurar locale para português
dayjs.locale('pt-br')
import { useEffect, useRef, useState } from 'react'
import { Header, Info, Sidbar } from '../../components'
import { useFocusTime } from '../../hooks'
import styles from './styles.module.css'

type TimerMode = 'focus' | 'break' | 'idle' | 'paused'

function Focus() {
  const {
    currentSession,
    startFocusSession,
    endFocusSession,
    metrics,
    fetchFocusTimeMetrics,
    sessions,
    listFocusSessions
  } = useFocusTime()

  const [focusTime, setFocusTime] = useState(10)
  const [restTime, setRestTime] = useState(5)
  const [timerMode, setTimerMode] = useState<TimerMode>('idle')
  const [remainingTime, setRemainingTime] = useState(focusTime * 60)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [initialTime, setInitialTime] = useState(focusTime * 60)

  useEffect(() => {
    fetchFocusTimeMetrics()
    listFocusSessions()
  }, [fetchFocusTimeMetrics, listFocusSessions])

  useEffect(() => {
    // Resetar tempo restante quando mudar o tempo de foco ou descanso
    if (timerMode === 'focus') {
      setRemainingTime(focusTime * 60)
      setInitialTime(focusTime * 60)
    } else if (timerMode === 'break') {
      setRemainingTime(restTime * 60)
      setInitialTime(restTime * 60)
    }
  }, [focusTime, restTime, timerMode])

  // Novo useEffect para controlar o timer corretamente
  useEffect(() => {
    if (timerMode === 'focus' || timerMode === 'break') {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => prev - 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [timerMode])

  // Novo useEffect para transição automática entre modos
  useEffect(() => {
    if (timerMode === 'focus' && remainingTime === 0) {
      setTimerMode('break')
    } else if (timerMode === 'break' && remainingTime === 0) {
      stopTimer()
    }
  }, [remainingTime, timerMode])

  const startTimer = async () => {
    if (timerMode === 'paused') {
      setTimerMode(initialTime === focusTime * 60 ? 'focus' : 'break')
      return
    } else if (timerMode !== 'idle') return

    try {
      await startFocusSession()
      setTimerMode('focus')
    } catch (error) {
      console.error('Erro ao iniciar sessão de foco:', error)
    }
  }

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setTimerMode('paused')
  }

  const stopTimer = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (currentSession) {
      try {
        await endFocusSession()
        // Recarregar métricas e sessões após finalizar
        fetchFocusTimeMetrics()
        listFocusSessions()
      } catch (error) {
        console.error('Erro ao finalizar sessão de foco:', error)
      }
    }

    setTimerMode('idle')
    setRemainingTime(focusTime * 60)
    setInitialTime(focusTime * 60)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const renderActionButtons = () => {
    switch (timerMode) {
      case 'focus':
        return (
          <div className={styles.actionButtons}>
            <button
              className={styles.cancelButton}
              onClick={pauseTimer}
            >
              Pausar
            </button>
            <button 
              className={styles.startBreakButton}
              onClick={() => {
                if (timerRef.current) {
                  clearInterval(timerRef.current)
                }
                setTimerMode('break')
                setRemainingTime(restTime * 60)
              }}
            >
              Iniciar Descanso
            </button>
            <button 
              className={styles.cancelButton}
              onClick={stopTimer}
            >
              Cancelar
            </button>
          </div>
        )
      case 'break':
        return (
          <div className={styles.actionButtons}>
            <button
              className={styles.startButton}
              onClick={() => {
                setTimerMode('focus')
                setRemainingTime(focusTime * 60)
              }}
            >
              Voltar ao Foco
            </button>
            <button
              className={styles.cancelButton}
              onClick={pauseTimer}
            >
              Pausar
            </button>
            <button 
              className={styles.startBreakButton}
              onClick={stopTimer}
            >
              Finalizar
            </button>
          </div>
        )
      case 'paused':
        return (
          <div className={styles.actionButtons}>
            <button
              className={styles.startButton}
              onClick={startTimer}
            >
              Retomar
            </button>
            <button 
              className={styles.cancelButton}
              onClick={stopTimer}
            >
              Cancelar
            </button>
          </div>
        )
      default:
        return (
          <div className={styles.actionButtons}>
            <button 
              className={styles.startButton}
              onClick={startTimer}
            >
              Iniciar
            </button>
          </div>
        )
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.focusPage}>
        <Sidbar />
        <div className={styles.timerContainer}>
          <Header 
            title="Tempo de Foco" 
            actions={<ListChecks size={24} color="var(--gray)" />} 
          />

          <div className={styles.timerControls}>
            <div className={styles.inputGroup}>
              <label htmlFor="focusTimeInput" className={styles.inputLabel}>Tempo de Foco (min)</label>
              <div className={styles.input}>
                <Plus size={24} />
                <input
                  id="focusTimeInput"
                  type="number"
                  value={focusTime}
                  onChange={(e) => setFocusTime(Number(e.target.value))}
                  disabled={timerMode !== 'idle'}
                  min={1}
                  max={60}
                  placeholder="ex: 25"
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="restTimeInput" className={styles.inputLabel}>Tempo de Descanso (min)</label>
              <div className={styles.input}>
                <Plus size={24} />
                <input
                  id="restTimeInput"
                  type="number"
                  value={restTime}
                  onChange={(e) => setRestTime(Number(e.target.value))}
                  disabled={timerMode !== 'idle'}
                  min={1}
                  max={30}
                  placeholder="ex: 5"
                />
              </div>
            </div>
          </div>

          <div className={styles.timerCircle}>
            <span className={styles.timerStatus}>
              {timerMode === 'focus' && 'Em foco'}
              {timerMode === 'break' && 'Em descanso'}
              {timerMode === 'paused' && 'Pausado'}
              {timerMode === 'idle' && 'Pronto'}
            </span>
            <span className={styles.timeDisplay}>
              {formatTime(remainingTime)}
            </span>
          </div>

          {renderActionButtons()}
        </div> 
        <div className={styles.estatistica}>
          <div className={styles.metricsContainer}>
            <h2>Estatísticas de Foco</h2>
            
            {/* Métricas principais do mês atual */}
            <div className={styles.infoContainer}>
              <Info 
                value={`${metrics?.monthlyMetrics?.totalSessions || 0}`} 
                label="Ciclos do mês" 
              />
              <Info 
                value={`${Math.round((metrics?.monthlyMetrics?.totalMonthDuration || 0) / 60)}h`} 
                label="Tempo total" 
              />
              <Info 
                value={`${Math.round(metrics?.monthlyMetrics?.averageSessionDuration || 0)}min`} 
                label="Média por sessão" 
              />
            </div>

            {/* Sessões do dia atual */}
            <div className={styles.todaySessions}>
              <h3>{dayjs().format('D [de] MMMM')}</h3>
              
                             {/* Filtrar sessões de hoje */}
               {(() => {
                 let todaySessions = sessions?.filter(session => 
                   dayjs(session.timeFrom).isSame(dayjs(), 'day')
                 ) || []
                 
                 // Adicionar sessão atual se estiver em andamento hoje
                 if (currentSession && dayjs(currentSession.timeFrom).isSame(dayjs(), 'day')) {
                   todaySessions = [...todaySessions, currentSession]
                 }
                 
                 // Ordenar sessões por horário
                 todaySessions.sort((a, b) => 
                   dayjs(a.timeFrom).valueOf() - dayjs(b.timeFrom).valueOf()
                 )
                
                return todaySessions.length > 0 ? (
                  <div className={styles.sessionsList}>
                    {todaySessions.map((session, index) => (
                                             <div key={index} className={styles.sessionItem}>
                         <div className={styles.sessionIcon}>
                           <Clock size={16} color="var(--info-blue)" />
                         </div>
                        <div className={styles.sessionInfo}>
                          <span className={styles.sessionTime}>
                            {dayjs(session.timeFrom).format('HH:mm')}
                            {session.timeTo && ` - ${dayjs(session.timeTo).format('HH:mm')}`}
                          </span>
                          <span className={styles.sessionDuration}>
                            {session.duration ? `${session.duration} minutos` : 'Em andamento'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noSessionsToday}>
                    <p>Nenhuma sessão hoje</p>
                  </div>
                )
              })()}
            </div>

            {/* Calendar com histórico de foco */}
            <div className={styles.calendarContainer}>
              <Calendar 
                getDayProps={(date) => {
                  const hasFocus = metrics?.dailyMetrics?.some(metric =>
                    dayjs(metric.date).isSame(dayjs(date), 'day') && metric.sessionsCount > 0
                  );
                  return {
                    disabled: false,
                  };
                }}
                renderDay={(date) => {
                  const dayMetric = metrics?.dailyMetrics?.find(metric =>
                    dayjs(metric.date).isSame(dayjs(date), 'day')
                  );
                  const hasFocus = dayMetric && dayMetric.sessionsCount > 0;
                  
                  return (
                    <Indicator
                      size={8}
                      color="#00B37E"
                      offset={-2}
                      disabled={!hasFocus}
                    >
                      <div style={{ 
                        color: hasFocus ? '#00B37E' : 'inherit',
                        fontWeight: hasFocus ? 'bold' : 'normal'
                      }}>
                        {dayjs(date).date()}
                      </div>
                    </Indicator>
                  );
                }}
              />
            </div>

            {/* Mensagem quando não há dados */}
            {(!metrics || (!metrics.monthlyMetrics?.totalSessions && (!sessions || sessions.length === 0))) && (
              <div className={styles.emptyState}>
                <p>Inicie sua primeira sessão de foco para ver suas estatísticas!</p>
              </div>
            )}
          </div>
        </div>

        
       
      </div>
    </div>
  )
}

export default Focus;