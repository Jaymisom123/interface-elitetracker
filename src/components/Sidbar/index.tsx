import { ListChecks, SignOut, Timer } from 'phosphor-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './styles.module.css'

export function Sidbar() {
  const { user, logout } = useAuth()
  const [activeMenu, setActiveMenu] = useState('habits')

  const handleLogout = async () => {
    try {
      await logout()
      // O redirecionamento será feito automaticamente pelo AuthContext
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const menuItems = [
    { icon: ListChecks, label: 'Hábitos', key: 'habits' },
    { icon: Timer, label: 'Cronômetro', key: 'timer' },
  ]

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
            className={`${styles.menuItem} ${activeMenu === item.key ? styles.active : ''}`}
            onClick={() => setActiveMenu(item.key)}
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
