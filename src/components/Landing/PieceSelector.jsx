import { PIECE_OPTIONS } from '../../constants'
import styles from './PieceSelector.module.css'

export default function PieceSelector({ imageSrc, onSelect, onChangeImage }) {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h2>¿Qué dificultad querés?</h2>
        <button type="button" className={styles.linkBtn} onClick={onChangeImage}>
          ← Cambiar imagen
        </button>
      </div>

      <div className={styles.previewRow}>
        <img src={imageSrc} alt="Imagen seleccionada" />
        <p>Lista para transformarse en tu desafío</p>
      </div>

      <div className={styles.grid}>
        {PIECE_OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt.count}
            className={styles.option}
            onClick={() => onSelect(opt.count)}
          >
            <span className={styles.label}>{opt.label}</span>
            <span className={styles.desc}>{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}