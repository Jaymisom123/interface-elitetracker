import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

// Tipos
export interface Habit {
  id?: string
  userId: string
  name: string
  description?: string
  color: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface HabitEntry {
  id?: string
  habitId: string
  userId: string
  date: string // YYYY-MM-DD
  completed: boolean
  createdAt: Timestamp
}

// Operações de Hábitos
export const habitsService = {
  // Criar um novo hábito
  async create(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, 'habits'), {
      ...habit,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  },

  // Buscar hábitos de um usuário
  async getByUserId(userId: string) {
    const q = query(
      collection(db, 'habits'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Habit)
  },

  // Buscar um hábito por ID
  async getById(id: string) {
    const docRef = doc(db, 'habits', id)
    const snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Habit
    }
    return null
  },

  // Atualizar um hábito
  async update(id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) {
    const docRef = doc(db, 'habits', id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  // Deletar um hábito
  async delete(id: string) {
    const docRef = doc(db, 'habits', id)
    await deleteDoc(docRef)
  },

  // Escutar mudanças em tempo real
  subscribe(userId: string, callback: (habits: Habit[]) => void) {
    console.log('🔥 Firebase: Iniciando subscription para userId:', userId)

    const q = query(
      collection(db, 'habits'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )

    return onSnapshot(
      q,
      (snapshot) => {
        console.log(
          '🔥 Firebase: Snapshot recebido, docs:',
          snapshot.docs.length,
        )

        const habits = snapshot.docs.map((doc) => {
          const data = doc.data()
          console.log('📄 Documento:', doc.id, data)
          return {
            id: doc.id,
            ...data,
          } as Habit
        })

        console.log('📋 Hábitos processados:', habits)
        callback(habits)
      },
      (error) => {
        console.error('❌ Firebase: Erro na subscription:', error)
      },
    )
  },
}

// Operações de Entradas de Hábitos
export const habitEntriesService = {
  // Marcar/desmarcar hábito como completo
  async toggle(habitId: string, userId: string, date: string) {
    const q = query(
      collection(db, 'habit-entries'),
      where('habitId', '==', habitId),
      where('userId', '==', userId),
      where('date', '==', date),
    )

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      // Criar nova entrada
      await addDoc(collection(db, 'habit-entries'), {
        habitId,
        userId,
        date,
        completed: true,
        createdAt: Timestamp.now(),
      })
    } else {
      // Atualizar entrada existente
      const entryDoc = snapshot.docs[0]
      const currentData = entryDoc.data() as HabitEntry
      await updateDoc(entryDoc.ref, {
        completed: !currentData.completed,
      })
    }
  },

  // Buscar entradas de um usuário em um período
  async getByUserAndDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ) {
    const q = query(
      collection(db, 'habit-entries'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as HabitEntry,
    )
  },

  // Buscar entradas de um hábito específico
  async getByHabitId(habitId: string) {
    const q = query(
      collection(db, 'habit-entries'),
      where('habitId', '==', habitId),
      orderBy('date', 'desc'),
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as HabitEntry,
    )
  },
}
