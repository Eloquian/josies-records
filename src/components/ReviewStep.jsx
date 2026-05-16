import { useState } from 'react'
import styles from './ReviewStep.module.css'

const FIELDS = [
  { key: 'artist', label: 'Artist' },
  { key: 'title', label: 'Title' },
  { key: 'label', label: 'Label' },
  { key: 'catalogueNo', label: 'Catalogue No.' },
  { key: 'year', label: 'Year' },
  { key: 'country', label: 'Country' },
  { key: 'format', label: 'Format' },
  { key: 'speed', label: 'Speed' },
  { key: 'genre', label: 'Genre' },
  { key: 'style', label: 'Style' },
  { key: 'estimatedValue', label: 'Est. Value' },
  { key: 'condition', label: 'Condition' },
  { key: 'notes', label: 'Notes' },
]

export default function ReviewStep({ data, imageFile, onSaved, onBack }) {
  const [fields, setFields] = useState({ ...data })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const preview = imageFile ? URL.createObjectURL(imageFile) : null

  function handleChange(key, value) {
    setFields(f => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Save failed')
      onSaved(fields)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.titleBlock}>
          <h2 className={styles.heading}>Review Details</h2>
          <p className={styles.sub}>Correct anything before saving to the catalogue.</p>
        </div>
      </div>

      <div className={styles.layout}>
        {preview && (
          <div className={styles.imageCol}>
            <img src={preview} alt="Record label" className={styles.labelImg} />
            {data.sourceUrl && (
              <a href={data.sourceUrl} target="_blank" rel="noreferrer" className={styles.discogsLink}>
                View on Discogs ↗
              </a>
            )}
            {data.estimatedValue && (
              <div className={styles.valueBadge}>
                <span className={styles.valueLabel}>Est. Value</span>
                <span className={styles.valueAmount}>{data.estimatedValue}</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.fieldsCol}>
          {FIELDS.map(({ key, label }) => (
            <div key={key} className={styles.field}>
              <label className={styles.label}>{label}</label>
              {key === 'notes' ? (
                <textarea
                  className={styles.textarea}
                  value={fields[key] || ''}
                  onChange={e => handleChange(key, e.target.value)}
                  rows={3}
                />
              ) : (
                <input
                  className={styles.input}
                  value={fields[key] || ''}
                  onChange={e => handleChange(key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save to Catalogue →'}
        </button>
      </div>
    </div>
  )
}
