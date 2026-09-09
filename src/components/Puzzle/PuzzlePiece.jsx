import { useRef } from 'react'
import { findDropTarget } from '../../utils/dnd'
import styles from './Puzzle.module.css'

export default function PuzzlePiece({ piece, size, onDrop, onRemove, onInspect }) {
  const ref = useRef(null)
  const drag = useRef(null)

  const move = (x, y) => {
    const d = drag.current
    if (!d) return
    d.clone.style.left = `${x - d.dx}px`
    d.clone.style.top = `${y - d.dy}px`
  }

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const rect = ref.current.getBoundingClientRect()
    const clone = ref.current.cloneNode(false)
    clone.style.position = 'fixed'
    clone.style.left = '0'
    clone.style.top = '0'
    clone.style.width = `${rect.width}px`
    clone.style.height = `${rect.height}px`
    clone.style.margin = '0'
    clone.style.zIndex = '1000'
    clone.style.pointerEvents = 'none'
    clone.style.boxShadow = '0 14px 30px rgba(0,0,0,0.3)'
    clone.style.transform = 'rotate(2deg)'
    document.body.appendChild(clone)

    drag.current = {
      dx: e.clientX - rect.left,
      dy: e.clientY - rect.top,
      clone,
    }

    try {
      ref.current.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    move(e.clientX, e.clientY)
  }

  const handlePointerMove = (e) => {
    if (!drag.current) return
    e.preventDefault()
    move(e.clientX, e.clientY)
  }

  const handlePointerUp = (e) => {
    if (!drag.current) return
    const { clone } = drag.current
    if (clone.parentNode) clone.parentNode.removeChild(clone)
    const target = findDropTarget(e.clientX, e.clientY)
    drag.current = null
    onDrop(piece, target)
  }

  const className = [
    styles.piece,
    onRemove ? styles.placed : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <img
      ref={ref}
      src={piece.src}
      alt=""
      draggable={false}
      className={className}
      data-orow={piece.correctRow}
      data-ocol={piece.correctCol}
      style={{ width: `${size}px`, height: `${size}px` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={(e) => {
        e.preventDefault()
        if (onInspect) onInspect(piece)
      }}
      onDoubleClick={onRemove ? () => onRemove(piece) : undefined}
    />
  )
}