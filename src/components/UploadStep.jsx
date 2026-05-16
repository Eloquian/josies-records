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
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
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
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <h2 className={styles.heading}>Add a Record</h2>
        <p className={styles.sub}>Photograph the label and let the machine do the rest.</p>
      </div>

      {!preview ? (
        <div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <div className={styles.record}>
            <div className={styles.recordInner}>
              <div className={styles.recordLabel}>
                <span>DROP</span>
              </div>
            </div>
          </div>
          <p className={styles.dropText}>Drop a photo here, or click to browse</p>
          <p className={styles.dropHint}>JPG, PNG, WEBP — label side up</p>
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
          <button className={styles.changeBtn} onClick={() => { setPreview(null); setSelectedFile(null) }}>
            ← Use a different photo
          </button>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {preview && (
        <button
          className={styles.identifyBtn}
          onClick={handleIdentify}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.spinner}>Reading label<span className={styles.dots}>...</span></span>
          ) : (
            'Identify Record →'
          )}
        </button>
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
