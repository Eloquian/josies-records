import heroImg from '../assets/hero.png'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.hero}>
      <img className={styles.heroImg} src={heroImg} alt="Vintage gramophone" />
      <div className={styles.heroFade} />
      <div className={styles.heroContent}>
        <div className={styles.heroEyebrow}>Record catalogue</div>
        <h1 className={styles.heroTitle}>Josie's Records</h1>
      </div>
    </header>
  )
}
