import styles from './SuccessStep.module.css'

export default function SuccessStep({ record, onAnother }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>
        <svg width="80" height="80" viewBox="0 0 72 72" fill="none">
          <circle cx="36" cy="36" r="33" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
          <circle cx="36" cy="36" r="26" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
          <circle cx="36" cy="36" r="19" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
          <circle cx="36" cy="36" r="12" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
          <circle cx="36" cy="36" r="5" fill="currentColor" opacity="0.55"/>
          <polyline points="23,36 32,45 49,27" stroke="#d3b78f" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>
      <h2 className={styles.title}>Catalogued.</h2>
      {record && (
        <p className={styles.sub}>
          {record.artist} — {record.title} has been added to the catalogue.
        </p>
      )}
      <button className="btn-primary" style={{ marginTop: '2.2rem' }} onClick={onAnother}>
        + Add another record
      </button>
    </div>
  )
}
