import { useRef, useState } from 'react'
import { fileToDataURL, validateImageFile } from '../../utils/images'
import styles from './ImageUpload.module.css'

export default function ImageUpload({ onImage }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = async (file) => {
    const result = validateImageFile(file)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    try {
      const src = await fileToDataURL(file)
      onImage(src)
    } catch {
      setError('No se pudo leer la imagen. Probá con otro archivo.')
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files && e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className={styles.card}>
      <h3>Subí tu propia foto</h3>
      <div
        className={`${styles.dropzone} ${dragOver ? styles.over : ''}`}
        onClick={() => inputRef.current && inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (inputRef.current) inputRef.current.click()
          }
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M17 8l-5-5-5 5" />
          <path d="M12 3v12" />
        </svg>
        <p>Arrastrá una imagen acá o hacé clic</p>
        <span>JPG, PNG y GIF · máx. 20MB</span>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files && e.target.files[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}