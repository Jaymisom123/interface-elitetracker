import { GithubAuthProvider, signInWithPopup } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components'
import { useAuth } from '../../contexts/AuthContext'
import { ROUTES } from '../../routes/paths'
import { auth } from '../../services/firebase'
import styles from './styles.module.css'

function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !isLoading) {
      // Pequeno delay para evitar loops de redirecionamento
      const timer = setTimeout(() => {
        navigate(ROUTES.HABITS, { replace: true })
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [user, navigate, isLoading])

  const handleGitHubLoginClick = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmLogin = async () => {
    setShowConfirmModal(false)
    setIsLoading(true)
    setError('')

    try {
      const provider = new GithubAuthProvider()
      provider.addScope('user:email')
      const result = await signInWithPopup(auth, provider)
      
      if (result.user) {
        // O redirecionamento será feito automaticamente pelo useEffect
        // quando o estado de autenticação mudar
      }
    } catch (error: any) {
      console.error('Erro no login com GitHub:', error)
      let errorMessage = 'Erro ao fazer login com GitHub. Tente novamente.'
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelado pelo usuário.'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up bloqueado. Permita pop-ups para este site.'
      } else if (
        error.code === 'auth/account-exists-with-different-credential'
      ) {
        errorMessage =
          'Já existe uma conta com este email usando outro método de login.'
      } else if (error.code === 'auth/credential-already-in-use') {
        errorMessage = 'Esta conta GitHub já está vinculada a outro usuário.'
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelLogin = () => {
    setShowConfirmModal(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Entre com GitHub</h1>
        {error && (
          <div
            style={{
              color: '#ff4444',
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#ff444420',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}
        <div className={styles.loginButtons}>
          <Button onClick={handleGitHubLoginClick} loading={isLoading}>
            GitHub
          </Button>
        </div>
        <p className={styles.terms}>
          Ao entrar, você concorda com os{' '}
          <a href='/terms' target='_blank' rel='noopener noreferrer'>
            Termos de Serviço
          </a>{' '}
          e a{' '}
          <a href='/privacy' target='_blank' rel='noopener noreferrer'>
            Política de Privacidade
          </a>
          .
        </p>
      </div>
      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 496 512" 
              className={styles.modalGitHubIcon}
            >
              <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/>
            </svg>
            <h2>Confirmar Login com GitHub</h2>
            <p>Deseja realmente fazer login usando sua conta do GitHub?</p>
            <div className={styles.modalButtons}>
              <Button onClick={handleConfirmLogin}>Sim, fazer login</Button>
              <Button 
                onClick={handleCancelLogin} 
                style={{ 
                  backgroundColor: '#ff4444', 
                  color: 'white',
                  marginLeft: '10px'
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
