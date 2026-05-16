import styles from './SuccessStep.module.css'

export default function SuccessStep({ record, onAnother }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.disc}>
        <div className={styles.discInner}>
          <div className={styles.discLabel}>
            <span className={styles.tick}>✓</span>
          </div>
        </div>
      </div>
      <h2 className={styles.title}>Catalogued.</h2>
      {record && (
        <p className={styles.detail}>
          <em>{record.artist}</em> — {record.title}
          {record.year ? ` (${record.year})` : ''} has been added to the catalogue.
        </p>
      )}
      <button className={styles.btn} onClick={onAnother}>
        + Add another record
      </button>
    </div>
  )
}
