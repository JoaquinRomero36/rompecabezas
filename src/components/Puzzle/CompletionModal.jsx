import { useEffect } from 'react'
import styles from './Puzzle.module.css'

function fmtTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function CompletionModal({
  seconds,
  moves,
  total,
  sizeText,
  onPlayAgain,
  onNewPuzzle,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onNewPuzzle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNewPuzzle])

  return (
    <div className={styles.overlay}>
      <div className={styles.completeCard}>
        <h2>¡Felicidades!</h2>
        <p className={styles.completeMsg}>
          Completaste un rompecabezas de {total} piezas ({sizeText}).
        </p>
        <div className={styles.completeStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{fmtTime(seconds)}</span>
            <span className={styles.statLabel}>tiempo</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{moves}</span>
            <span className={styles.statLabel}>
              {moves === 1 ? 'intento' : 'intentos'}
            </span>
          </div>
        </div>
        <div className={styles.completeActions}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onPlayAgain}
          >
            Jugar de nuevo
          </button>
          <button type="button" className={styles.actionBtn} onClick={onNewPuzzle}>
            Nuevo rompecabezas
          </button>
        </div>
      </div>
    </div>
  )
}