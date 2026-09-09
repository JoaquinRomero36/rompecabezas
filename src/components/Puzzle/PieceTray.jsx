import PuzzlePiece from './PuzzlePiece'
import styles from './Puzzle.module.css'

export default function PieceTray({ pieces, size, onDrop, remaining, onInspect }) {
  return (
    <div className={styles.tray} data-tray>
      <div className={styles.trayHead}>
        <span className={styles.trayLabel}>Piezas</span>
        <span className={styles.trayCount}>
          {remaining} {remaining === 1 ? 'libre' : 'libres'}
        </span>
      </div>
      <p className={styles.inspectHint}>Clic derecho en una pieza para ampliarla</p>
      {pieces.length === 0 ? (
        <p className={styles.trayEmpty}>
          ¡Todas las piezas en su lugar! Una vez completado, verás el resultado.
        </p>
      ) : (
        <div className={styles.trayGrid}>
          {pieces.map((p) => (
            <PuzzlePiece
              key={p.id}
              piece={p}
              size={size}
              onDrop={onDrop}
              onInspect={onInspect}
            />
          ))}
        </div>
      )}
    </div>
  )
}