import { useEffect } from 'react'
import styles from './Puzzle.module.css'

export default function ReferenceModal({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.referenceBox} onClick={(e) => e.stopPropagation()}>
        <img src={src} alt="Imagen original de referencia" />
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Cerrar referencia"
        >
          ✕
        </button>
        <p className={styles.referenceHint}>Cerralo para seguir jugando</p>
      </div>
    </div>
  )
}