import { useState, useRef } from 'react'
import styles from './UploadStep.module.css'

export default function UploadStep({ onIdentified }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const inputRef = useRef()

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      return
    }
    setError(null)
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function handleIdentify() {
    if (!selectedFile) return
    setLoading(true)
    setError(null)
    try {
      const base64 = await fileToBase64(selectedFile)
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: selectedFile.type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Identification failed')
      onIdentified(data, selectedFile)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="step-heading">
        <span className="step-num">1</span>
        <h2>Upload a label photo</h2>
      </div>
      <p className="hint">Photograph the record label clearly. Centre label, good light, no glare. Either side will do.</p>

      {!preview ? (
        <div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <div className={styles.dropIcon}>
            <svg width="50" height="50" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="0.8" opacity="0.3"/>
              <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="0.8" opacity="0.45"/>
              <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="0.8" opacity="0.55"/>
              <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.65"/>
              <line x1="24" y1="4" x2="24" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.75"/>
              <polyline points="20,9 24,4 28,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.75"/>
            </svg>
          </div>
          <p className={styles.dropText}>Drop a photo here, or click to browse</p>
          <p className={styles.dropSub}>JPG · PNG · WEBP — phone photos work perfectly</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className={styles.previewWrap}>
          <img src={preview} alt="Record label" className={styles.preview} />
          <button
            className={styles.changeBtn}
            onClick={() => { setPreview(null); setSelectedFile(null) }}
          >
            ← Use a different photo
          </button>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {preview && (
        <div className="btn-row">
          <button
            className="btn-primary"
            onClick={handleIdentify}
            disabled={loading}
          >
            {loading ? 'Reading label…' : 'Identify record →'}
          </button>
        </div>
      )}
    </div>
  )
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
