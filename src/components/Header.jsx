import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.groove} />
        <div className={styles.titleBlock}>
          <span className={styles.eyebrow}>The Collection of</span>
          <h1 className={styles.title}>Josie's Records</h1>
        </div>
        <div className={styles.groove} />
      </div>
    </header>
  )
}
