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

  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      navigate(ROUTES.HABITS)
    }
  }, [user, navigate])

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const provider = new GithubAuthProvider()

      // Solicitar acesso ao email (opcional, mas recomendado)
      provider.addScope('user:email')

      await signInWithPopup(auth, provider)

      console.log('Login com GitHub realizado com sucesso!')
      // O redirecionamento será feito automaticamente pelo useEffect
    } catch (error: any) {
      console.error('Erro no login com GitHub:', error)

      // Mensagens de erro mais específicas para GitHub
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
          <Button onClick={handleGitHubLogin} loading={isLoading}>
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
    </div>
  )
}

export default Login
