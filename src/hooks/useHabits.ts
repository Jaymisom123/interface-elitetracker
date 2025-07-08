import { useCallback, useEffect, useState } from 'react'
import useApi from './useApi'

export interface Habit {
  id: string
  name: string
  description?: string
  category: string
  frequency: 'daily' | 'weekly' | 'monthly'
  target: number
  completed: number
  streak: number
  createdAt: string
  updatedAt: string
}

function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  
  // Hook para buscar hábitos
  const {
    data: habitsData,
    loading: loadingHabits,
    error: errorHabits,
    execute: fetchHabits
  } = useApi<Habit[]>('/habits', { immediate: true })
  
  // Hook para criar hábito
  const {
    loading: creating,
    error: createError,
    execute: createHabitApi
  } = useApi('/habits', { method: 'POST' })
  
  // Hook para atualizar hábito
  const {
    loading: updating,
    error: updateError,
    execute: updateHabitApi
  } = useApi('', { method: 'PUT' })
  
  // Hook para deletar hábito
  const {
    loading: deleting,
    error: deleteError,
    execute: deleteHabitApi
  } = useApi('', { method: 'DELETE' })
  
  // Atualizar estado quando dados chegarem
  useEffect(() => {
    if (habitsData) {
      setHabits(habitsData)
    }
  }, [habitsData])
  
  // Criar novo hábito
  const createHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'streak'>) => {
    const result = await createHabitApi({ body: habitData })
    if (result) {
      setHabits(prev => [...prev, result])
      return result
    }
    return null
  }, [createHabitApi])
  
  // Atualizar hábito existente
  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    const result = await updateHabitApi({
      body: updates,
      // Dinamicamente definir URL com ID
    })
    if (result) {
      setHabits(prev => prev.map(habit => 
        habit.id === id ? { ...habit, ...result } : habit
      ))
      return result
    }
    return null
  }, [updateHabitApi])
  
  // Deletar hábito
  const deleteHabit = useCallback(async (id: string) => {
    const success = await deleteHabitApi()
    if (success) {
      setHabits(prev => prev.filter(habit => habit.id !== id))
      return true
    }
    return false
  }, [deleteHabitApi])
  
  // Marcar hábito como completo
  const completeHabit = useCallback(async (id: string) => {
    const habit = habits.find(h => h.id === id)
    if (!habit) return false
    
    const updatedHabit = {
      ...habit,
      completed: habit.completed + 1,
      streak: habit.streak + 1
    }
    
    return await updateHabit(id, updatedHabit)
  }, [habits, updateHabit])
  
  // Resetar progresso do hábito
  const resetHabit = useCallback(async (id: string) => {
    return await updateHabit(id, { completed: 0, streak: 0 })
  }, [updateHabit])
  
  // Obter hábitos por categoria
  const getHabitsByCategory = useCallback((category: string) => {
    return habits.filter(habit => habit.category === category)
  }, [habits])
  
  // Obter estatísticas
  const getStats = useCallback(() => {
    const total = habits.length
    const completed = habits.filter(h => h.completed >= h.target).length
    const inProgress = habits.filter(h => h.completed > 0 && h.completed < h.target).length
    const notStarted = habits.filter(h => h.completed === 0).length
    
    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    }
  }, [habits])
  
  return {
    // Dados
    habits,
    stats: getStats(),
    
    // Estados de loading
    loading: loadingHabits || creating || updating || deleting,
    loadingHabits,
    creating,
    updating,
    deleting,
    
    // Erros
    error: errorHabits || createError || updateError || deleteError,
    errorHabits,
    createError,
    updateError,
    deleteError,
    
    // Ações
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    resetHabit,
    getHabitsByCategory
  }
}

export default useHabits 