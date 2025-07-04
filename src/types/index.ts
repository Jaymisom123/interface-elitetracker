import type { Timestamp } from 'firebase/firestore'

// Tipos para componentes de UI
export interface ButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children?: React.ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

// Tipos para autenticação (Firebase User)
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
}

// Tipos para hábitos
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

// Tipos para formulários
export interface LoginFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  displayName: string
}

export interface HabitFormData {
  name: string
  description?: string
  color: string
}

// Tipos para eventos
export interface LoginEvent {
  provider: 'firebase' | 'github' | 'google'
  timestamp: Date
}

// Tipos para erros
export interface FirebaseError {
  code: string
  message: string
}
