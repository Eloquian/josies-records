import { useState } from 'react'
import styles from './ConfirmStep.module.css'

const CONDITIONS = [
  '— Not assessed —',
  'M — Mint',
  'NM — Near mint',
  'VG+ — Very good plus',
  'VG — Very good',
  'G+ — Good plus',
  'G — Good',
]

export default function ConfirmStep({ reviewFields, selectedMatch, onSaved, onBack }) {
  const [condition, setCondition] = useState('— Not assessed —')
  const [notes, setNotes] = useState(reviewFields?.notes || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const merged = {
    ...reviewFields,
    ...(selectedMatch ? {
      genre:     reviewFields?.genre  || selectedMatch.genre  || null,
      style:     reviewFields?.style  || selectedMatch.style  || null,
      country:   reviewFields?.country || selectedMatch.country || null,
      year:      reviewFields?.year   || selectedMatch.year   || null,
      source:    selectedMatch.source,
      sourceId:  selectedMatch.id,
      sourceUrl: selectedMatch.sourceUrl,
    } : {}),
    condition,
    notes,
  }

  const displayLabel  = merged.label  || selectedMatch?.label  || ''
  const displayTitle  = merged.title  || ''
  const displayArtist = merged.artist || ''
  const displayCatno  = merged.catalogueNo || selectedMatch?.catno || ''

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Save failed')
      onSaved(merged)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="step-heading">
        <span className="step-num">4</span>
        <h2>Confirm and save</h2>
      </div>
      <p className="hint">Last chance to check everything looks right. Add condition and any notes, then send it to the catalogue.</p>

      <div className={styles.confirmCard}>
        <div className={styles.vinylDisc}>
          <div className={styles.vinylCentre}>
            <div className={styles.vinylLabel}>{displayLabel.toUpperCase()}</div>
            <div className={styles.vinylTitle}>{displayTitle}</div>
            <div className={styles.vinylArtist}>{displayArtist}</div>
            <div className={styles.vinylCatno}>{displayCatno}</div>
          </div>
        </div>
        <div className={styles.confirmDetails}>
          <dl className={styles.confirmDl}>
            {merged.artist    && <><dt>Artist</dt>   <dd>{merged.artist}</dd></>}
            {merged.title     && <><dt>Title</dt>    <dd>{merged.title}</dd></>}
            {merged.label     && <><dt>Label</dt>    <dd>{merged.label}</dd></>}
            {displayCatno     && <><dt>Cat. no.</dt> <dd>{displayCatno}</dd></>}
            {merged.year      && <><dt>Year</dt>     <dd>{merged.year}</dd></>}
            {merged.country   && <><dt>Country</dt>  <dd>{merged.country}</dd></>}
            {merged.format    && <><dt>Format</dt>   <dd>{merged.format}</dd></>}
            {merged.genre     && <><dt>Genre</dt>    <dd>{merged.genre}</dd></>}
            {merged.source    && <><dt>Source</dt>   <dd>{merged.source}</dd></>}
          </dl>
          {merged.sourceUrl && (
            <a
              className={styles.sourceLink}
              href={merged.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              View on Discogs ↗
            </a>
          )}
        </div>
      </div>

      <hr className={styles.divider} />

      <div className="field-grid">
        <div className="field">
          <label>Condition</label>
          <select value={condition} onChange={e => setCondition(e.target.value)}>
            {CONDITIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field full">
          <label>Notes</label>
          <textarea
            rows={2}
            placeholder="Any observations about condition, provenance, etc."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className="btn-row">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Send to catalogue ✓'}
        </button>
        <button className="btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  )
}
