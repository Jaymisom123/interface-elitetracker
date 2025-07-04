import githubIcon from '../../assets/github.svg'
import type { ButtonProps } from '../../types'
import styles from './styles.module.css'

interface CustomButtonProps extends ButtonProps {
  style?: React.CSSProperties
}

function Button({
  onClick,
  disabled = false,
  loading = false,
  children = 'Button',
  type = 'button',
  style,
}: CustomButtonProps) {
  const isGitHubButton = children === 'GitHub'

  return (
    <button
      type={type}
      className={`${styles.githubButton} ${disabled ? styles.disabled : ''} ${loading ? styles.loading : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
    >
      {loading ? (
        <div className={styles.spinner} />
      ) : (
        isGitHubButton && (
          <img src={githubIcon} alt='GitHub' className={styles.icon} />
        )
      )}
      <span>{children}</span>
    </button>
  )
}

export default Button
