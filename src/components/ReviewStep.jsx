import { useState } from 'react'

const REVIEW_FIELDS = [
  { key: 'artist',      label: 'Artist' },
  { key: 'title',       label: 'Title' },
  { key: 'label',       label: 'Record label' },
  { key: 'catalogueNo', label: 'Catalogue no.' },
  { key: 'year',        label: 'Year' },
  { key: 'country',     label: 'Country' },
  { key: 'format',      label: 'Format' },
  { key: 'side',        label: 'Side' },
  { key: 'speed',       label: 'Speed (RPM)' },
  { key: 'notes',       label: 'Notes', full: true, textarea: true },
]

export default function ReviewStep({ data, confidence, onReviewed, onBack }) {
  const [fields, setFields] = useState({
    artist:      data?.artist      || '',
    title:       data?.title       || '',
    label:       data?.label       || '',
    catalogueNo: data?.catalogueNo || '',
    year:        data?.year        || '',
    country:     data?.country     || '',
    format:      data?.format      || '',
    side:        data?.side        || '',
    speed:       data?.speed       || '',
    notes:       data?.notes       || '',
  })

  function handleChange(key, value) {
    setFields(f => ({ ...f, [key]: value }))
  }

  const conf = confidence || 'high'
  const badgeLabel = conf === 'high' ? 'High confidence' : conf === 'medium' ? 'Medium confidence' : 'Low confidence'

  return (
    <div>
      <div className="step-heading">
        <span className="step-num">2</span>
        <h2>Check what we found</h2>
        <span className={`badge ${conf === 'high' ? 'high' : ''}`}>{badgeLabel}</span>
      </div>
      <p className="hint">Correct anything that looks wrong before we search the catalogues. The AI does its best, but labels can be tricky.</p>

      <div className="field-grid">
        {REVIEW_FIELDS.map(({ key, label, full, textarea }) => (
          <div key={key} className={`field${full ? ' full' : ''}`}>
            <label>{label}</label>
            {textarea ? (
              <textarea
                rows={2}
                value={fields[key]}
                onChange={e => handleChange(key, e.target.value)}
              />
            ) : (
              <input
                type="text"
                value={fields[key]}
                onChange={e => handleChange(key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn-primary" onClick={() => onReviewed(fields)}>
          Search catalogues →
        </button>
        <button className="btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  )
}
