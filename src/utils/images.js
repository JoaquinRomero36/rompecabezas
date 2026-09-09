import { MAX_IMAGE_MB } from '../constants'

export function validateImageFile(file) {
  if (!file) return { ok: false, error: 'No se seleccionó ningún archivo.' }
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'El archivo debe ser una imagen.' }
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return {
      ok: false,
      error: `La imagen no puede pesar más de ${MAX_IMAGE_MB}MB.`,
    }
  }
  return { ok: true }
}

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.readAsDataURL(file)
  })
}