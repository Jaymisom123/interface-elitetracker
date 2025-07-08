import type { IconProps } from 'phosphor-react'
import styles from './styles.module.css'

interface StatBadgeProps {
  icon: React.ComponentType<IconProps>
  label: string
  count: number
  variant: 'total' | 'completed' | 'pending' | 'warning'
  className?: string
  onClick?: () => void
}

function StatBadge({ 
  icon: Icon, 
  label, 
  count, 
  variant, 
  className,
  onClick 
}: StatBadgeProps) {
  return (
    <div 
      className={`${styles.statBadge} ${styles[variant]} ${className || ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Icon size={16} weight="bold" />
      <span>
        <strong>{count}</strong> {label}
      </span>
    </div>
  )
}

export default StatBadge 