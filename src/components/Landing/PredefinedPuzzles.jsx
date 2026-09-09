import { PREDEFINED_PUZZLES } from '../../constants'
import styles from './PredefinedPuzzles.module.css'

export default function PredefinedPuzzles({ onSelect }) {
  return (
    <div className={styles.card}>
      <h3>O elegí uno de nuestros diseños</h3>
      <div className={styles.grid}>
        {PREDEFINED_PUZZLES.map((p) => (
          <button
            type="button"
            key={p.id}
            className={styles.item}
            onClick={() => onSelect(p.src)}
          >
            <img src={p.src} alt={p.name} />
            <span>{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}