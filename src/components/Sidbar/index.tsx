import { ListChecks, SignOut, Timer } from 'phosphor-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ROUTES } from '../../routes/paths'
import styles from './styles.module.css'

export function Sidbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
      // O redirecionamento será feito automaticamente pelo AuthContext
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const menuItems = [
    { 
      icon: ListChecks, 
      label: 'Hábitos', 
      key: 'habits', 
      route: ROUTES.HABITS 
    },
    { 
      icon: Timer, 
      label: 'Tempo de Foco', 
      key: 'focus', 
      route: ROUTES.FOCUS 
    },
  ]

  // Determinar o item ativo com base na rota atual
  const getActiveMenuItem = () => {
    const activeItem = menuItems.find(item => item.route === location.pathname)
    return activeItem ? activeItem.key : ''
  }

  // Fallback para avatar se não tiver foto
  const getAvatarUrl = () => {
    if (user?.photoURL) return user.photoURL
    if (user?.displayName) {
      // Gerar avatar com as iniciais do nome
      const initials = user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
      return `https://ui-avatars.com/api/?name=${initials}&background=3b82f6&color=fff&size=44`
    }
    return 'https://ui-avatars.com/api/?name=User&background=6b7280&color=fff&size=44'
  }

  return (
    <div className={styles.container}>
      {user && (
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            <img
              src={getAvatarUrl()}
              alt={user.displayName || user.email || 'Usuário'}
              onError={(e) => {
                console.error('Erro ao carregar imagem do avatar')
                const imgElement = e.target as HTMLImageElement
                imgElement.src =
                  'https://ui-avatars.com/api/?name=User&background=6b7280&color=fff&size=44'
              }}
            />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user.displayName || user.email?.split('@')[0] || 'Usuário'}
            </span>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
        </div>
      )}

      <div className={styles.menuList}>
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`${styles.menuItem} ${getActiveMenuItem() === item.key ? styles.active : ''}`}
            onClick={() => {
              navigate(item.route)
            }}
            type='button'
            title={item.label}
          >
            <item.icon size={24} />
          </button>
        ))}
      </div>

      {user && (
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          type='button'
          title='Sair'
        >
          <SignOut size={24} />
        </button>
      )}
    </div>
  )
}
