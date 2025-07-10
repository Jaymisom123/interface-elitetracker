import { ListChecks, Plus } from 'phosphor-react'
import { useEffect, useRef, useState } from 'react'
import { Header, Sidbar } from '../../components'
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
    sessions
  } = useFocusTime()

  const [focusTime, setFocusTime] = useState(10)
  const [restTime, setRestTime] = useState(5)
  const [timerMode, setTimerMode] = useState<TimerMode>('idle')
  const [remainingTime, setRemainingTime] = useState(focusTime * 60)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [initialTime, setInitialTime] = useState(focusTime * 60)

  useEffect(() => {
    fetchFocusTimeMetrics()
  }, [fetchFocusTimeMetrics])

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
        
       
      </div>
    </div>
  )
}

export default Focus;