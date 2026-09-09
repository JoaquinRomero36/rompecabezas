import PuzzlePiece from './PuzzlePiece'
import styles from './Puzzle.module.css'

export default function PuzzleBoard({ rows, cols, pieceSize, board, onDrop, onRemove, flashCell }) {
  const cells = []
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const key = `${r}-${c}`
      const piece = board[key]
      const flashing = flashCell === key
      cells.push(
        <div
          key={key}
          data-cell
          data-row={r}
          data-col={c}
          className={`${styles.cell} ${piece ? styles.filled : ''} ${
            flashing ? styles.flash : ''
          }`}
          style={{ width: `${pieceSize}px`, height: `${pieceSize}px` }}
        >
          {piece && (
            <PuzzlePiece
              piece={piece}
              size={pieceSize}
              onDrop={onDrop}
              onRemove={onRemove}
            />
          )}
        </div>,
      )
    }
  }

  return (
    <div
      className={styles.board}
      style={{ gridTemplateColumns: `repeat(${cols}, ${pieceSize}px)` }}
    >
      {cells}
    </div>
  )
}