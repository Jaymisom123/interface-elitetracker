import axios from 'axios'
import { Check, PaperPlaneRight, Trash } from 'phosphor-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Sidbar } from '../../components/Sidbar'
import { useAuth } from '../../contexts/AuthContext'
import {
  habitEntriesService,
  habitsService,
  type Habit,
} from '../../services/firestore'
import styles from './styles.module.css'

function Habits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [_completedHabits, setCompletedHabits] = useState<Set<string>>(
    new Set(),
  )
  const [bearerToken, setBearerToken] = useState<string>('')
  const [showCopyMsg, setShowCopyMsg] = useState(false)

  const { user } = useAuth()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const inputRef = useRef<HTMLInputElement>(null)

  // Lista de hábitos estáticos
  const staticHabits = [
    'Beber água',
    'Exercitar-se',
    'Ler um livro',
    'Meditar',
    'Estudar programação',
    'Dormir cedo',
  ]

  const [checkedHabits, setCheckedHabits] = useState<boolean[]>(
    Array(staticHabits.length).fill(false),
  )

  const handleToggleStaticHabit = (idx: number) => {
    setCheckedHabits((prev) => {
      const updated = [...prev]
      updated[idx] = !updated[idx]
      return updated
    })
  }

  // Carregar completions de hoje
  const _loadTodayCompletions = useCallback(
    async (habitsData: Habit[]) => {
      if (!user || habitsData.length === 0) return

      try {
        const entries = await habitEntriesService.getByUserAndDateRange(
          user.uid,
          today,
          today,
        )
        const completed = new Set(
          entries
            .filter((entry) => entry.completed)
            .map((entry) => entry.habitId),
        )
        setCompletedHabits(completed)
      } catch (error) {
        console.error('Erro ao carregar completions:', error)
      }
    },
    [user, today],
  )

  // Carregar hábitos do backend (MongoDB)
  useEffect(() => {
    if (!user) return
    setIsLoading(true)
    axios
      .get('/api/habits', {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => {
        setHabits(response.data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Erro ao buscar hábitos do backend:', error)
        setIsLoading(false)
      })
  }, [user, bearerToken])

  useEffect(() => {
    // Carregar hábitos estáticos inicialmente
    setHabits((prev) => [...prev, ...staticHabits])
    console.log('Hábitos após adição dos estáticos:', [...staticHabits])
    console.log('Estado atual dos hábitos:', habits)
  }, [habits])

  useEffect(() => {
    if (user) {
      user.getIdToken().then((token) => {
        setBearerToken(token)
        console.log('Seu Bearer Token:', token)
      })
    }
  }, [user])

  // Adicionar novo hábito
  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newHabitName.trim() || !user || isAddingHabit) return

    setIsAddingHabit(true)
    const habitName = newHabitName.trim()

    try {
      await habitsService.create({
        userId: user.uid,
        name: habitName,
        color: '#3b82f6', // Cor padrão azul
      })

      // Limpar o input imediatamente após sucesso
      setNewHabitName('')
      console.log(`Hábito "${habitName}" adicionado com sucesso!`)

      // Focar no input para adicionar outro hábito
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error('Erro ao adicionar hábito:', error)
      alert('Erro ao adicionar hábito. Tente novamente.')
      // Manter o texto no input se houve erro para o usuário tentar novamente
    } finally {
      setIsAddingHabit(false)
    }
  }

  // Toggle completion de hábito
  const _handleToggleHabit = async (habitId: string) => {
    if (!user) return

    try {
      await habitEntriesService.toggle(habitId, user.uid, today)

      // Atualizar estado local
      setCompletedHabits((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(habitId)) {
          newSet.delete(habitId)
        } else {
          newSet.add(habitId)
        }
        return newSet
      })
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error)
      alert('Erro ao atualizar hábito. Tente novamente.')
    }
  }

  // Deletar hábito
  const _handleDeleteHabit = async (habitId: string, habitName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o hábito "${habitName}"?`)) {
      return
    }

    try {
      await habitsService.delete(habitId)
      console.log('Hábito deletado com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar hábito:', error)
      alert('Erro ao deletar hábito. Tente novamente.')
    }
  }

  // Formatar data
  const formatDate = () => {
    const date = new Date()
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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
          <header className={styles.header}>
            <h1>Hábitos Diários</h1>
            <span className={styles.date}>{formatDate()}</span>
          </header>

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
            {staticHabits.map((habit, idx) => (
              <div key={habit} className={styles.habit}>
                <p>{habit}</p>
                <div>
                  <button
                    type='button'
                    onClick={() => handleToggleStaticHabit(idx)}
                    style={{
                      background: checkedHabits[idx]
                        ? '#10b981'
                        : 'transparent',
                      border: `2px solid ${checkedHabits[idx] ? '#10b981' : '#6b7280'}`,
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
                      checkedHabits[idx] ? 'Desmarcar' : 'Marcar como concluído'
                    }
                  >
                    {checkedHabits[idx] && (
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
                    title={`Deletar "${habit}"`}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Habits
