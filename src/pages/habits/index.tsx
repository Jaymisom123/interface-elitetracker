import { Check, Clock, ListChecks, PaperPlaneRight, Trash } from 'phosphor-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Header, Sidbar, StatBadge } from '../../components'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { formatDateToYMD, getTodayISO, getTodayYMD, isToday } from '../../utils/dateUtils'
import styles from './styles.module.css'

interface Habit {
  _id: string
  name: string
  userId: string
  completedDates: string[]
  createdAt: string
  updatedAt: string
}

function Habits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set())
  const [bearerToken, setBearerToken] = useState<string>('')
  const [showCopyMsg, setShowCopyMsg] = useState(false)

  const { user } = useAuth()
  const today = getTodayYMD()
  const inputRef = useRef<HTMLInputElement>(null)

  // Função auxiliar para sincronizar hábitos completados
  const syncCompletedHabits = useCallback((habitsData: Habit[]) => {
    console.log('=== SINCRONIZANDO HÁBITOS ===')
    console.log('Data de hoje (frontend):', today)
    
    const completedToday = new Set<string>()
    habitsData.forEach((habit: Habit) => {
      console.log(`\nAnalisando hábito: "${habit.name}"`)
      console.log('Datas completadas:', habit.completedDates)
      
      if (habit.completedDates) {
        // Verificar se alguma data completada corresponde a hoje
        const isCompletedToday = habit.completedDates.some((dateString: string) => {
          const completedToday = isToday(dateString)
          console.log(`  Comparando: ${formatDateToYMD(dateString)} === ${today} = ${completedToday}`)
          return completedToday
        })
        
        if (isCompletedToday) {
          completedToday.add(habit._id)
          console.log(`✅ Hábito "${habit.name}" está marcado como completo hoje`)
        } else {
          console.log(`❌ Hábito "${habit.name}" NÃO está completo hoje`)
        }
      }
    })
    console.log(`\n🎯 Total de hábitos completados hoje: ${completedToday.size}`)
    console.log('IDs dos hábitos completados:', Array.from(completedToday))
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
            actions={
              <div className={styles.statsContainer}>
                <StatBadge 
                  icon={ListChecks}
                  label="total"
                  count={habits.length}
                  variant="total"
                />
                <StatBadge 
                  icon={Check}
                  label="completos"
                  count={Array.from(completedHabits).length}
                  variant="completed"
                />
                <StatBadge 
                  icon={Clock}
                  label="pendentes"
                  count={habits.length - Array.from(completedHabits).length}
                  variant="pending"
                />
              </div>
            }
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
                <div key={habit._id} className={styles.habit}>
                  <p>{habit.name}</p>
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
      </div>
    </div>
  )
}

export default Habits
