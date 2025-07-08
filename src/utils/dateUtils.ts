import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

// Configurar Day.js para português
dayjs.locale('pt-br')

/**
 * Formatar data para YYYY-MM-DD
 */
export const formatDateToYMD = (date: string | Date | dayjs.Dayjs): string => {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * Verificar se uma data é hoje
 */
export const isToday = (date: string | Date | dayjs.Dayjs): boolean => {
  return dayjs(date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
}

/**
 * Formatar data para exibição em português
 */
export const formatDisplayDate = (): string => {
  return dayjs().locale('pt-br').format('dddd, DD [de] MMMM [de] YYYY')
}

/**
 * Obter data de hoje no formato YYYY-MM-DD
 */
export const getTodayYMD = (): string => {
  return dayjs().format('YYYY-MM-DD')
}

/**
 * Obter data de hoje no formato ISO
 */
export const getTodayISO = (): string => {
  return dayjs().toISOString()
}

/**
 * Verificar se um array de datas contém a data de hoje
 */
export const hasToday = (dates: string[]): boolean => {
  return dates.some(date => isToday(date))
}

/**
 * Filtrar datas que são de hoje
 */
export const filterTodayDates = (dates: string[]): string[] => {
  return dates.filter(date => isToday(date))
} 