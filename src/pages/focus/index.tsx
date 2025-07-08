import { ListChecks, Pause, Play, Plus } from 'phosphor-react'
import { useEffect, useRef, useState } from 'react'
import { Header, Sidbar } from '../../components'
import { useFocusTime } from '../../hooks'
import styles from './styles.module.css'

function Focus() {
  const {
    currentSession,
    startFocusSession,
    endFocusSession,
    metrics,
    fetchFocusTimeMetrics,
    sessions
  } = useFocusTime()

  const [focusTime, setFocusTime] = useState(25)
  const [restTime, setRestTime] = useState(5)
  const [isRunning, setIsRunning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(focusTime * 60)
  const [isBreakTime, setIsBreakTime] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchFocusTimeMetrics()
  }, [fetchFocusTimeMetrics])

  useEffect(() => {
    setRemainingTime(focusTime * 60)
  }, [focusTime])

  const startTimer = async () => {
    if (isRunning) return

    try {
      await startFocusSession()
      setIsRunning(true)
      setIsBreakTime(false)

      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 0) {
            if (!isBreakTime) {
              setIsBreakTime(true)
              setRemainingTime(restTime * 60)
            } else {
              stopTimer()
              return 0
            }
            return prev
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('Erro ao iniciar sessão de foco:', error)
    }
  }

  const stopTimer = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (currentSession) {
      try {
        await endFocusSession()
      } catch (error) {
        console.error('Erro ao finalizar sessão de foco:', error)
      }
    }

    setIsRunning(false)
    setIsBreakTime(false)
    setRemainingTime(focusTime * 60)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
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
              <div className={styles.input}>
                <Plus size={24} />
                <input
                  type="number"
                  value={focusTime}
                  onChange={(e) => setFocusTime(Number(e.target.value))}
                  disabled={isRunning}
                  min={1}
                  max={60}
                  placeholder="Tempo de foco"
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.input}>
                <Plus size={24} />
                <input
                  type="number"
                  value={restTime}
                  onChange={(e) => setRestTime(Number(e.target.value))}
                  disabled={isRunning}
                  min={1}
                  max={30}
                  placeholder="Tempo de descanso"
                />
              </div>
            </div>
          </div>

          <div className={styles.timerCircle}>
            <span className={styles.timeDisplay}>
              {formatTime(remainingTime)}
            </span>
          </div>

          <div className={styles.actionButtons}>
            {!isRunning ? (
              <button 
                className={styles.startButton} 
                onClick={startTimer}
              >
                <Play size={24} />
                Iniciar
              </button>
            ) : (
              <button 
                className={styles.stopButton} 
                onClick={stopTimer}
              >
                <Pause size={24} />
                Pausar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Focus  