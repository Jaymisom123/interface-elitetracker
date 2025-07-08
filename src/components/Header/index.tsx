import { ReactNode } from 'react'
import { formatDisplayDate } from '../../utils/dateUtils'
import styles from './styles.module.css'

interface HeaderProps {
  title: string
  subtitle?: string
  showDate?: boolean
  className?: string
  children?: ReactNode
  actions?: ReactNode
}

function Header({ 
  title, 
  subtitle, 
  showDate = true, 
  className, 
  children,
  actions 
}: HeaderProps) {
  return (
    <header className={`${styles.header} ${className || ''}`}>
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {showDate && (
            <span className={styles.date}>{formatDisplayDate()}</span>
          )}
        </div>
        
        {actions && (
          <div className={styles.actions}>
            {actions}
          </div>
        )}
      </div>
      
      {children && (
        <div className={styles.headerChildren}>
          {children}
        </div>
      )}
    </header>
  )
}

export default Header 