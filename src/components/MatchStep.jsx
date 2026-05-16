import { useState } from 'react'
import styles from './MatchStep.module.css'

export default function MatchStep({ matches, onMatch, onSkip, onBack }) {
  const [chosen, setChosen] = useState(matches[0] || null)

  return (
    <div>
      <div className="step-heading">
        <span className="step-num">3</span>
        <h2>Pick a catalogue match</h2>
      </div>
      <p className="hint">
        {matches.length > 0
          ? `Found ${matches.length} result${matches.length !== 1 ? 's' : ''}. Pick the best match, or skip if none look right.`
          : 'No catalogue matches found. You can log this record manually.'}
      </p>

      {matches.length > 0 && (
        <div className={styles.sourceGroup}>
          <div className={styles.sourceLabel}>
            <span className="badge source">Discogs</span>
          </div>
          <div className={styles.matchList}>
            {matches.map(m => (
              <button
                key={m.id}
                className={`${styles.matchCard} ${chosen?.id === m.id ? styles.chosen : ''}`}
                onClick={() => setChosen(m)}
              >
                <div className={styles.matchThumb} />
                <div className={styles.matchInfo}>
                  <div className={styles.matchTitle}>{m.artist} — {m.title}</div>
                  <div className={styles.matchMeta}>
                    {[m.label, m.catno, m.year, m.country, m.format].filter(Boolean).join(' · ')}
                  </div>
                  {(m.genre || m.style) && (
                    <div className={styles.matchGenre}>
                      {[m.genre, m.style].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
                <div className={styles.matchCheck}>{chosen?.id === m.id ? '✓' : ''}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="btn-row">
        {matches.length > 0 && (
          <button className="btn-primary" onClick={() => onMatch(chosen)}>
            Use this match →
          </button>
        )}
        <button className="btn-ghost" onClick={onSkip}>
          {matches.length > 0 ? 'None of these — log manually →' : 'Log manually →'}
        </button>
        <button className="btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  )
}
