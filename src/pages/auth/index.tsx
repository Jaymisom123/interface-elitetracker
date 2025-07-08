
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import { ROUTES } from '../../routes/paths'
import styles from './styles.module.css'

function Auth() {  
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        async function authenticateUser() {
            try {
                const code = searchParams.get('code')
                
                if (!code) {
                    throw new Error('Código de autorização não encontrado')
                }

                const { data } = await api.get(`/auth/callback`, {
                    params: { code }
                })

                // Armazenar informações do usuário
                localStorage.setItem('jwt_token', data.token)
                localStorage.setItem('user_id', data.id)
                localStorage.setItem('user_avatar', data.avatar)
                localStorage.setItem('user_name', data.name)

                // Redirecionar para página de hábitos
                navigate(ROUTES.HABITS)
            } catch (error) {
                console.error('Erro na autenticação:', error)
                
                // Redirecionar para login em caso de erro
                navigate(ROUTES.LOGIN)
            }
        }

        authenticateUser()
    }, [navigate, searchParams])

    return (
        <div className={styles.container}>
            <div className={styles.loadingContent}>
                <div className={styles.spinner}></div>
                <h1>Autenticando...</h1>
            </div>
        </div>
    )
}

export default Auth
