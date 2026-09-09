import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageUpload from './ImageUpload'
import PredefinedPuzzles from './PredefinedPuzzles'
import PieceSelector from './PieceSelector'
import styles from './Landing.module.css'

const STEPS = [
  {
    num: '1',
    title: 'Elegí tu imagen',
    text: 'Subí una foto propia (hasta 20MB) o usá una de nuestras ilustraciones.',
  },
  {
    num: '2',
    title: 'Elegí la dificultad',
    text: 'De 50 a 500 piezas. ¡Vos decidís el desafío!',
  },
  {
    num: '3',
    title: 'Armá y divertite',
    text: 'Encajá las piezas con la imagen original como guía cuando la necesites.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [step, setStep] = useState('intro')
  const [imageSrc, setImageSrc] = useState(null)
  const [error, setError] = useState(null)

  const handleUserImage = (src) => {
    setImageSrc(src)
    setError(null)
    setStep('pieces')
  }

  const handlePredefined = (src) => {
    setImageSrc(src)
    setError(null)
    setStep('pieces')
  }

  const handlePieceCount = (count) => {
    navigate('/puzzle', { state: { imageSrc, pieceCount: count } })
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.badge}>Rompecabezas.io</div>
        <h1 className={styles.title}>Armá tu foto pieza por pieza</h1>
        <p className={styles.subtitle}>
          Subí una imagen, transformala en un rompecabezas y armalo a tu ritmo.
          Simple, colorido y muy divertido.
        </p>

        {step === 'intro' && (
          <button
            type="button"
            className={styles.cta}
            onClick={() => setStep('image')}
          >
            Comenzar a armar
          </button>
        )}

        <div className={styles.floating}>
          <div className={`${styles.clip} ${styles.clipA}`} />
          <div className={`${styles.clip} ${styles.clipB}`} />
          <div className={`${styles.clip} ${styles.clipC}`} />
        </div>
      </header>

      {step === 'intro' && (
        <section className={`${styles.card} ${styles.how}`}>
          <h2>Cómo funciona</h2>
          <div className={styles.steps}>
            {STEPS.map((s) => (
              <div key={s.num} className={styles.step}>
                <span className={styles.stepNum}>{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 'image' && (
        <section className={styles.form}>
          <div className={styles.formHead}>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => setStep('intro')}
            >
              ← Volver
            </button>
            <h2>Elegí la imagen de tu rompecabezas</h2>
          </div>

          <ImageUpload onImage={handleUserImage} />

          <PredefinedPuzzles onSelect={handlePredefined} />

          {error && <p className={styles.error}>{error}</p>}
        </section>
      )}

      {step === 'pieces' && imageSrc && (
        <section className={styles.form}>
          <PieceSelector
            imageSrc={imageSrc}
            onSelect={handlePieceCount}
            onChangeImage={() => setStep('image')}
          />
        </section>
      )}

      <footer className={styles.footer}>
        Hecho con mucha paciencia para que armes la tuya.
      </footer>
    </div>
  )
}