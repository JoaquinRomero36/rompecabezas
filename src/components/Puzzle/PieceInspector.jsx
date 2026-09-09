import { useEffect, useState } from 'react'
import styles from './PieceInspector.module.css'

const MAX_WORK_DIM = 1600
const ZOOM = 480

export default function PieceInspector({ imageSrc, grid, piece, onClose }) {
  const [renderSrc, setRenderSrc] = useState('')

  useEffect(() => {
    if (!piece) return undefined
    let alive = true

    const img = new Image()
    img.onload = () => {
      const imgW = img.naturalWidth
      const imgH = img.naturalHeight
      const scale = Math.min(1, MAX_WORK_DIM / Math.max(imgW, imgH))
      const w = Math.max(1, Math.round(imgW * scale))
      const h = Math.max(1, Math.round(imgH * scale))
      const cellW = w / grid.cols
      const cellH = h / grid.rows

      const canvas = document.createElement('canvas')
      canvas.width = ZOOM
      canvas.height = ZOOM
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(
        img,
        piece.correctCol * cellW,
        piece.correctRow * cellH,
        cellW,
        cellH,
        0,
        0,
        ZOOM,
        ZOOM,
      )
      if (alive) setRenderSrc(canvas.toDataURL())
    }
    img.onerror = () => {
      if (alive) setRenderSrc(piece.src)
    }
    img.src = imageSrc

    return () => {
      alive = false
      img.src = ''
    }
  }, [imageSrc, grid, piece])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!piece) return null

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className={styles.box}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {renderSrc && (
          <img className={styles.img} src={renderSrc} alt="Pieza ampliada" />
        )}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Cerrar pieza ampliada"
        >
          ✕
        </button>
        <p className={styles.hint}>Hacé clic en otra parte o presioná Esc para cerrar</p>
      </div>
    </div>
  )
}