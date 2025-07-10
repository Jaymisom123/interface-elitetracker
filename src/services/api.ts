import axios from 'axios'
import dayjs from 'dayjs'

// Criar instância do Axios com URL base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
})

// Adicionar interceptor para incluir token em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Obter o token do localStorage
    const token = localStorage.getItem('jwt_token')

    // Se o token existir, adicionar no header de autorização
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Adicionar interceptor para tratamento de erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o erro for de autorização (401), redirecionar para login
    if (error.response && error.response.status === 401) {
      // Limpar dados de autenticação
      localStorage.removeItem('jwt_token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_avatar')
      localStorage.removeItem('user_name')

      // Redirecionar para página de login
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

// Serviço de Tempo de Foco
export const focusTimeService = {
  // Iniciar sessão de foco
  async startFocusSession(timeFrom: Date) {
    try {
      // Enviar timeFrom e timeTo iguais ao iniciar (será atualizado ao finalizar)
      const response = await api.post('/focus-time', { timeFrom, timeTo: timeFrom })
      return response.data
    } catch (error) {
      console.error('Erro ao iniciar sessão de foco:', error)
      throw error
    }
  },

  // Finalizar sessão de foco
  async endFocusSession(timeFrom: Date, timeTo: Date) {
    try {
      const response = await api.post('/focus-time', { timeFrom, timeTo })
      return response.data
    } catch (error) {
      console.error('Erro ao finalizar sessão de foco:', error)
      throw error
    }
  },

  // Buscar métricas de tempo de foco por mês
  async getFocusTimeMetrics(date: Date) {
    try {
      const response = await api.get('/focus-time/metrics/month', { 
        params: { date: dayjs(date).toISOString() } 
      })
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar métricas de tempo de foco:', error)
      throw error
    }
  },

  // Listar todas as sessões de foco
  async listFocusSessions() {
    try {
      const response = await api.get('/focus-time')
      return response.data.data
    } catch (error) {
      console.error('Erro ao listar sessões de foco:', error)
      throw error
    }
  }
}

export default api;