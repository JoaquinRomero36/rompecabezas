import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { generatePieces, getGridForCount, loadImage } from '../../utils/puzzle'
import PuzzleBoard from './PuzzleBoard'
import PieceTray from './PieceTray'
import ReferenceModal from './ReferenceModal'
import CompletionModal from './CompletionModal'
import styles from './Puzzle.module.css'

function shuffleIds(arr) {
  const ids = arr.map((p) => p.id)
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids
}

function fmtTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function Puzzle() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}
  const imageSrc = state.imageSrc || null
  const pieceCount = state.pieceCount || null
  const valid = Boolean(imageSrc && pieceCount)

  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [pieces, setPieces] = useState([])
  const [grid, setGrid] = useState({ rows: 0, cols: 0 })
  const [pieceSize, setPieceSize] = useState(0)
  const [board, setBoard] = useState({})
  const [trayOrder, setTrayOrder] = useState([])
  const [moveCount, setMoveCount] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [showRef, setShowRef] = useState(false)
  const [flashCell, setFlashCell] = useState(null)
  const [wrongId, setWrongId] = useState(null)
  const [viewWidth, setViewWidth] = useState(window.innerWidth)

  const viewWidthRef = useRef(window.innerWidth)
  const flashTimer = useRef(null)

  useEffect(() => {
    const onResize = () => {
      viewWidthRef.current = window.innerWidth
      setViewWidth(window.innerWidth)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!valid) return undefined
    let cancelled = false

    async function setup() {
      try {
        const img = await loadImage(imageSrc)
        const { rows, cols } = getGridForCount(
          pieceCount,
          img.naturalWidth,
          img.naturalHeight,
        )
        const isMobile = viewWidthRef.current < 768
        const boardWidth = isMobile
          ? Math.min(viewWidthRef.current - 24, 520)
          : 560
        const ps = Math.max(20, Math.floor(boardWidth / cols))
        const generated = await generatePieces(img, rows, cols, ps)
        if (cancelled) return
        setGrid({ rows, cols })
        setPieceSize(ps)
        setPieces(generated)
        setTrayOrder(shuffleIds(generated))
        setStatus('ready')
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setMessage(
            err && err.message
              ? err.message
              : 'Ocurrió un error al preparar el rompecabezas.',
          )
        }
      }
    }

    setup()
    return () => {
      cancelled = true
    }
  }, [valid, imageSrc, pieceCount])

  useEffect(() => {
    if (status !== 'ready') return undefined
    const isMobile = viewWidth < 768
    const boardWidth = isMobile ? Math.min(viewWidth - 24, 520) : 560
    const ps = Math.max(20, Math.floor(boardWidth / grid.cols))
    setPieceSize(ps)
  }, [viewWidth, status, grid])

  const placedCount = Object.keys(board).length
  const remaining = pieces.length - placedCount

  const trayPieces = useMemo(() => {
    const placed = new Set(Object.values(board).map((p) => p.id))
    return trayOrder
      .map((id) => pieces.find((p) => p.id === id))
      .filter(Boolean)
      .filter((p) => !placed.has(p.id))
  }, [board, trayOrder, pieces])

  const isComplete = useMemo(() => {
    if (pieces.length === 0 || placedCount !== pieces.length) return false
    return pieces.every((p) => {
      const cell = board[`${p.correctRow}-${p.correctCol}`]
      return cell && cell.id === p.id
    })
  }, [pieces, board, placedCount])

  useEffect(() => {
    if (status !== 'ready' || isComplete) return undefined
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isComplete])

  const flashFeedback = (key, id) => {
    setFlashCell(key)
    setWrongId(id)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => {
      setFlashCell((c) => (c === key ? null : c))
      setWrongId((w) => (w === id ? null : w))
    }, 500)
  }

  const handleDrop = (piece, target) => {
    if (target.target === 'cell') {
      const key = `${target.row}-${target.col}`
      setMoveCount((m) => m + 1)
      if (piece.correctRow === target.row && piece.correctCol === target.col) {
        setBoard((prev) => {
          if (prev[key] && prev[key].id === piece.id) return prev
          const next = { ...prev }
          delete next[key]
          next[key] = piece
          return next
        })
      } else {
        flashFeedback(key, piece.id)
      }
    } else if (target.target === 'tray') {
      setBoard((prev) => {
        const has = Object.values(prev).some((p) => p.id === piece.id)
        if (!has) return prev
        const next = { ...prev }
        for (const [k, p] of Object.entries(next)) {
          if (p.id === piece.id) delete next[k]
        }
        return next
      })
    }
  }

  const handleRemove = (piece) => {
    setBoard((prev) => {
      const next = { ...prev }
      for (const [k, p] of Object.entries(next)) {
        if (p.id === piece.id) delete next[k]
      }
      return next
    })
  }

  const shuffle = () => {
    setBoard({})
    setTrayOrder(shuffleIds(pieces))
    setFlashCell(null)
  }

  const playAgain = () => {
    setBoard({})
    setMoveCount(0)
    setSeconds(0)
    setTrayOrder(shuffleIds(pieces))
    setFlashCell(null)
  }

  const goHome = () => navigate('/')

  if (!valid) return <Navigate to="/" replace />

  if (status === 'loading') {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
        <p>Preparando tus piezas...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={styles.center}>
        <h2>Ups, algo salió mal</h2>
        <p>{message}</p>
        <button type="button" className={styles.primaryBtn} onClick={goHome}>
          Volver al inicio
        </button>
      </div>
    )
  }

  const moveText = moveCount === 1 ? '1 movimiento' : `${moveCount} movimientos`

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button type="button" className={styles.backBtn} onClick={goHome}>
          ← Volver
        </button>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{fmtTime(seconds)}</span>
            <span className={styles.statLabel}>tiempo</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{moveText}</span>
            <span className={styles.statLabel}>intentos</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {remaining} / {pieces.length}
            </span>
            <span className={styles.statLabel}>piezas</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => setShowRef(true)}
          >
            Ver imagen original
          </button>
          <button type="button" className={styles.actionBtn} onClick={shuffle}>
            Mezclar
          </button>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.boardWrap}>
          <PuzzleBoard
            rows={grid.rows}
            cols={grid.cols}
            pieceSize={pieceSize}
            board={board}
            onDrop={handleDrop}
            onRemove={handleRemove}
            flashCell={flashCell}
          />
        </div>
        <PieceTray
          pieces={trayPieces}
          size={pieceSize}
          onDrop={handleDrop}
          shakeId={wrongId}
          remaining={remaining}
        />
      </div>

      {showRef && (
        <ReferenceModal src={imageSrc} onClose={() => setShowRef(false)} />
      )}

      {isComplete && (
        <CompletionModal
          seconds={seconds}
          moves={moveCount}
          total={pieces.length}
          sizeText={`${grid.rows}×${grid.cols}`}
          onPlayAgain={playAgain}
          onNewPuzzle={goHome}
        />
      )}
    </div>
  )
}