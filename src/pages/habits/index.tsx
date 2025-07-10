import { Indicator } from '@mantine/core'
import { Calendar } from '@mantine/dates'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { Check, PaperPlaneRight, Trash } from 'phosphor-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Header, Info, Sidbar } from '../../components'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { getTodayISO, getTodayYMD, isToday } from '../../utils/dateUtils'
import styles from './styles.module.css'

interface Habit {
  _id: string
  name: string
  userId: string
  completedDates: string[]
  createdAt: string
  updatedAt: string
}
type Metrics = {
 _id: string
 name: string
 completedDates: string[]
}

function Habits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set())
  const [bearerToken, setBearerToken] = useState<string>('')
  const [showCopyMsg, setShowCopyMsg] = useState(false)
  const [metrics, setMetrics] = useState<Metrics>({}as Metrics)
  const [selectHabit, setSelectHabit] = useState<Habit|null>(null)
  const { user } = useAuth()
  const today = getTodayYMD()
  const inputRef = useRef<HTMLInputElement>(null)

  // Função auxiliar para sincronizar hábitos completados
  async function handleSelectHabit(habit: Habit) {
    setSelectHabit(habit)
  }

  // Função para calcular porcentagem de conclusão do hábito
  const calculateCompletionPercentage = (habit: Habit): number => {
    
    if (!habit.completedDates || habit.completedDates.length === 0) {
      return 0
    }

    // Calcular dias desde a criação do hábito
    const createdDate = new Date(habit.createdAt)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - createdDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 0

    const completedDays = habit.completedDates.length
    const percentage = Math.round((completedDays / diffDays) * 100)
    
    return Math.min(percentage, 100) // Limitar a 100%
  }

  // Função para calcular a streak atual (sequência de dias consecutivos)
  const calculateCurrentStreak = (habit: Habit): number => {
    if (!habit.completedDates || habit.completedDates.length === 0) {
      return 0
    }

    // Ordenar datas em ordem decrescente
    const sortedDates = habit.completedDates
      .map(date => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime())

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Verificar se hoje foi completado
    const todayCompleted = sortedDates.some(date => {
      const dateOnly = new Date(date)
      dateOnly.setHours(0, 0, 0, 0)
      return dateOnly.getTime() === today.getTime()
    })

    let checkDate = new Date(today)
    if (!todayCompleted) {
      // Se hoje não foi completado, começar verificando ontem
      checkDate.setDate(checkDate.getDate() - 1)
    }

    // Contar dias consecutivos
    for (const completedDate of sortedDates) {
      const completedDateOnly = new Date(completedDate)
      completedDateOnly.setHours(0, 0, 0, 0)
      
      if (completedDateOnly.getTime() === checkDate.getTime()) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const syncCompletedHabits = useCallback((habitsData: Habit[]) => {
    
    const completedToday = new Set<string>()
    habitsData.forEach((habit: Habit) => {
      
      if (habit.completedDates) {
        // Verificar se alguma data completada corresponde a hoje
        const isCompletedToday = habit.completedDates.some((dateString: string) => {
          const completedToday = isToday(dateString)
          return completedToday
        })
        
        if (isCompletedToday) {
          completedToday.add(habit._id)
        }
      }
    })
    setCompletedHabits(completedToday)
  }, [today])

  useEffect(() => {
    if (user) {
      user
        .getIdToken()
        .then((token) => {
          setBearerToken(token)
        })
        .catch((error) => {
          console.error('Erro ao gerar token:', error)
        })
    }
  }, [user])

  // Carregar hábitos do backend (MongoDB)
  useEffect(() => {
    if (!user || !bearerToken) return

    setIsLoading(true)
    api
      .get('/api/v1/habits')
      .then((response) => {
        const habitsData = Array.isArray(response.data) ? response.data : []
        
        setHabits(habitsData)
        
        // Sincronizar hábitos completados hoje
        syncCompletedHabits(habitsData)
        
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Erro ao buscar hábitos do backend:', error)
        setHabits([])
        setIsLoading(false)
      })
  }, [user, bearerToken, today, syncCompletedHabits])

  // Adicionar novo hábito
  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newHabitName.trim() || !user || isAddingHabit) return

    setIsAddingHabit(true)
    const habitName = newHabitName.trim()

    try {
      await api.post(
        '/api/v1/habits',
        {
          name: habitName,
        },
      )

      setNewHabitName('')
      console.log(`Hábito "${habitName}" adicionado com sucesso!`)

      // Recarregar lista de hábitos
      const response = await api.get('/api/v1/habits')
      const habitsData = Array.isArray(response.data) ? response.data : []
      setHabits(habitsData)

      // Sincronizar hábitos completados após adicionar novo hábito
      syncCompletedHabits(habitsData)

      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error('Erro ao adicionar hábito:', error)
      alert('Erro ao adicionar hábito. Tente novamente.')
    } finally {
      setIsAddingHabit(false)
    }
  }

  // Toggle completion de hábito
  const handleToggleHabit = async (habitId: string) => {
    if (!user) return

    try {
      const response = await api.patch(
        `/api/v1/habits/${habitId}/toggle`,
        {
          date: today,
        },
      )

      // Atualizar estado local baseado na resposta do backend
      if (response.data && response.data.success) {
        // Atualizar o hábito específico na lista
        setHabits((prevHabits) => 
          prevHabits.map((habit) => {
            if (habit._id === habitId) {
              const updatedCompletedDates = [...(habit.completedDates || [])]
              
              // Verificar se hoje já está na lista usando Day.js
              const todayIndex = updatedCompletedDates.findIndex((dateString: string) => 
                isToday(dateString)
              )
              
              if (todayIndex > -1) {
                // Remover data se já estava completo
                updatedCompletedDates.splice(todayIndex, 1)
              } else {
                // Adicionar data de hoje no formato ISO
                const todayISO = getTodayISO()
                updatedCompletedDates.push(todayISO)
              }
              
              return {
                ...habit,
                completedDates: updatedCompletedDates
              }
            }
            return habit
          })
        )

        // Atualizar estado de hábitos completados
      setCompletedHabits((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(habitId)) {
          newSet.delete(habitId)
        } else {
          newSet.add(habitId)
        }
        return newSet
      })
      }
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error)
      alert('Erro ao atualizar hábito. Tente novamente.')
    }
  }

  // Deletar hábito
  const handleDeleteHabit = async (habitId: string, habitName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o hábito "${habitName}"?`)) {
      return
    }

    try {
      await api.delete(`/api/v1/habits/${habitId}`)

      console.log('Hábito deletado com sucesso!')
      setHabits((prev) => prev.filter((habit) => habit._id !== habitId))
      
      // Se o hábito deletado estava selecionado, limpar a seleção
      if (selectHabit?._id === habitId) {
        setSelectHabit(null)
      }
      
      // Remover das completed habits se estava marcado
      setCompletedHabits((prev) => {
        const newSet = new Set(prev)
        newSet.delete(habitId)
        return newSet
      })
    } catch (error) {
      console.error('Erro ao deletar hábito:', error)
      alert('Erro ao deletar hábito. Tente novamente.')
    }
  }

  const handleCopyToken = () => {
    if (bearerToken) {
      navigator.clipboard.writeText(bearerToken)
      setShowCopyMsg(true)
      setTimeout(() => setShowCopyMsg(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.habitsPage}>
        <Sidbar />
        <div className={styles.container}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
              fontSize: '18px',
            }}
          >
            Carregando hábitos...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.habitsPage}>
      <Sidbar />
      <div className={styles.container}>
        {/* Botão para copiar o token */}
        {user && bearerToken && (
          <div
            style={{
              position: 'fixed',
              top: 16,
              right: 16,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <button
              onClick={handleCopyToken}
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                fontSize: '14px',
              }}
              title='Copiar Bearer Token'
            >
              Copiar Token
            </button>
            {showCopyMsg && (
              <span
                style={{
                  marginTop: 6,
                  background: '#10b981',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                Token copiado!
              </span>
            )}
          </div>
        )}
        <div className={styles.habitsContainer}>
          <Header 
            title="Hábitos Diários" 
            subtitle={`${habits.length} hábito${habits.length !== 1 ? 's' : ''} cadastrado${habits.length !== 1 ? 's' : ''}`}
          />

          <form onSubmit={handleAddHabit} className={styles.input}>
            <input
              type='text'
              placeholder='Adicionar hábito'
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              disabled={isAddingHabit}
              ref={inputRef}
            />
            <button
              type='submit'
              disabled={isAddingHabit || !newHabitName.trim()}
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                cursor: isAddingHabit ? 'not-allowed' : 'pointer',
                opacity: isAddingHabit ? 0.5 : 1,
                color: newHabitName.trim() ? '#3b82f6' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '48px',
                transition: 'all 0.2s ease',
                fontSize: '18px',
              }}
              title={
                newHabitName.trim()
                  ? 'Adicionar hábito'
                  : 'Digite um hábito para adicionar'
              }
            >
              {isAddingHabit ? '...' : <PaperPlaneRight size={20} />}
            </button>
          </form>

          <div className={styles.habitsList}>
            {Array.isArray(habits) && habits.length > 0 ? (
              habits.map((habit) => (
                <div key={habit._id} className={clsx(styles.habit, selectHabit?._id === habit._id && styles.selectedHabit)}>
                  <p onClick={() => handleSelectHabit(habit)}>{habit.name}</p>
                  <div>
                    <button
                      type='button'
                      onClick={() => handleToggleHabit(habit._id)}
                      style={{
                        background: completedHabits.has(habit._id)
                          ? '#10b981'
                          : 'transparent',
                        border: `2px solid ${completedHabits.has(habit._id) ? '#10b981' : '#6b7280'}`,
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        marginRight: '8px',
                      }}
                      title={
                        completedHabits.has(habit._id)
                          ? 'Desmarcar'
                          : 'Marcar como concluído'
                      }
                    >
                      {completedHabits.has(habit._id) && (
                        <Check size={18} color='#fff' weight='bold' />
                      )}
                    </button>
                    <button
                      type='button'
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease',
                      }}
                      title={`Deletar "${habit.name}"`}
                      onClick={() => handleDeleteHabit(habit._id, habit.name)}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#6b7280',
                }}
              >
                {isLoading
                  ? 'Carregando hábitos...'
                  : 'Nenhum hábito encontrado. Adicione um novo hábito acima.'}
              </div>
            )}
          </div>
        </div>

        <div className={styles.metricsContainer}>
          {selectHabit ? (
            <>
              <h2>{selectHabit.name}</h2>
              <div className={styles.infoContainer}>
                <Info 
                  value={`${selectHabit.completedDates?.length || 0}`} 
                  label="Dias concluídos" 
                />
                <Info 
                  value={`${calculateCompletionPercentage(selectHabit)}%`} 
                  label="Taxa de sucesso" 
                />
                <Info 
                  value={`${calculateCurrentStreak(selectHabit)}`} 
                  label="Sequência atual" 
                />
              </div>
              <div className={styles.calendarContainer}>
                <Calendar 
                  getDayProps={(date) => {
                    const isCompleted = selectHabit.completedDates?.some(completedDate =>
                      dayjs(completedDate).isSame(dayjs(date), 'day')
                    );
                    return {
                      disabled: isCompleted,
                    };
                  }}
                  renderDay={(date) => {
                    const isCompleted = selectHabit.completedDates?.some(completedDate =>
                      dayjs(completedDate).isSame(dayjs(date), 'day')
                    );
                    return (
                      <Indicator
                        size={8}
                        color="#10b981"
                        offset={-2}
                        disabled={!isCompleted}
                      >
                        <div>{dayjs(date).date()}</div>
                      </Indicator>
                    );
                  }}
                />
              </div>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#6b7280',
                textAlign: 'center',
              }}
            >
              <h3 style={{ marginBottom: '16px', fontWeight: 500 }}>
                Selecione um hábito
              </h3>
              <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Clique em um hábito da lista para ver suas métricas detalhadas
              </p>
            </div>
          )}
      </div>
      </div>
    </div>
  )
}

export default Habits
