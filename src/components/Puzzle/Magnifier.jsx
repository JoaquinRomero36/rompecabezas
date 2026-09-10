import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './Magnifier.module.css'

const LENS = 120
const ZOOM = 1.5
const REGION = LENS / ZOOM

function buildSnapshot(el) {
  const rect = el.getBoundingClientRect()
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, el.scrollWidth)
  canvas.height = Math.max(1, el.scrollHeight)
  const ctx = canvas.getContext('2d')
  el.querySelectorAll('img').forEach((img) => {
    const ir = img.getBoundingClientRect()
    const x = ir.left - rect.left + el.scrollLeft
    const y = ir.top - rect.top + el.scrollTop
    ctx.drawImage(img, x, y, ir.width, ir.height)
  })
  return { canvas, el }
}

function isInside(el, x, y) {
  const r = el.getBoundingClientRect()
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
}

export default function Magnifier({ enabled, board, trayPieces }) {
  const canvasRef = useRef(null)
  const snapshots = useRef({})
  const posRef = useRef({ x: 0, y: 0, zone: null })
  const [pos, setPos] = useState({ x: 0, y: 0, zone: null })
  const [visible, setVisible] = useState(false)

  const draw = useCallback((zone, x, y) => {
    const canvas = canvasRef.current
    const snap = snapshots.current[zone]
    if (!canvas || !snap) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, LENS, LENS)
    const rect = snap.el.getBoundingClientRect()
    const cx = x - rect.left + snap.el.scrollLeft
    const cy = y - rect.top + snap.el.scrollTop
    const sx = Math.max(
      0,
      Math.min(snap.canvas.width - REGION, cx - REGION / 2),
    )
    const sy = Math.max(
      0,
      Math.min(snap.canvas.height - REGION, cy - REGION / 2),
    )
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(snap.canvas, sx, sy, REGION, REGION, 0, 0, LENS, LENS)
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    const boardEl = document.querySelector('[data-board]')
    const trayEl = document.querySelector('[data-traygrid]')
    snapshots.current = {
      board: boardEl ? buildSnapshot(boardEl) : null,
      tray: trayEl ? buildSnapshot(trayEl) : null,
    }
    draw(posRef.current.zone, posRef.current.x, posRef.current.y)
    return () => {
      snapshots.current = {}
    }
  }, [enabled, board, trayPieces, draw])

  useEffect(() => {
    if (!enabled) return undefined
    const onMove = (e) => {
      const boardEl = document.querySelector('[data-board]')
      const trayEl = document.querySelector('[data-traygrid]')
      let zone = null
      if (boardEl && isInside(boardEl, e.clientX, e.clientY)) {
        zone = 'board'
      } else if (trayEl && isInside(trayEl, e.clientX, e.clientY)) {
        zone = 'tray'
      }
      const next = { x: e.clientX, y: e.clientY, zone }
      posRef.current = next
      setPos(next)
      setVisible(zone !== null)
      draw(zone, e.clientX, e.clientY)
    }
    const onScroll = () => {
      if (posRef.current.zone) {
        draw(posRef.current.zone, posRef.current.x, posRef.current.y)
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [enabled, draw])

  if (!enabled) return null

  return (
    <div
      className={styles.lens}
      style={{
        left: pos.x,
        top: pos.y,
        opacity: visible ? 1 : 0,
      }}
    >
      <div className={styles.glass}>
        <canvas ref={canvasRef} width={LENS} height={LENS} />
      </div>
    </div>
  )
}