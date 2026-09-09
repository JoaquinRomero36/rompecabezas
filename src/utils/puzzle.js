const MAX_WORK_DIM = 1600

export function getGridForCount(count, imgW, imgH) {
  const aspect = imgW / Math.max(1, imgH)
  const cols = Math.max(2, Math.round(Math.sqrt(count * aspect)))
  const rows = Math.max(2, Math.round(count / cols))
  return { rows, cols }
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo cargar la imagen.'))
    img.src = src
  })
}

export async function generatePieces(image, rows, cols, pieceSize) {
  const imgW = image.naturalWidth
  const imgH = image.naturalHeight
  const scale = Math.min(1, MAX_WORK_DIM / Math.max(imgW, imgH))
  const w = Math.max(1, Math.round(imgW * scale))
  const h = Math.max(1, Math.round(imgH * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, w, h)

  const cellW = w / cols
  const cellH = h / rows
  const size = Math.max(1, Math.round(pieceSize))
  const pieces = []
  let id = 0

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const pc = document.createElement('canvas')
      pc.width = size
      pc.height = size
      const pctx = pc.getContext('2d')
      pctx.drawImage(canvas, c * cellW, r * cellH, cellW, cellH, 0, 0, size, size)
      pieces.push({
        id,
        correctRow: r,
        correctCol: c,
        src: pc.toDataURL(),
      })
      id += 1
    }
  }

  return pieces
}