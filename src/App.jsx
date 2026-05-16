import { useState } from 'react'
import Header from './components/Header.jsx'
import UploadStep from './components/UploadStep.jsx'
import ReviewStep from './components/ReviewStep.jsx'
import MatchStep from './components/MatchStep.jsx'
import ConfirmStep from './components/ConfirmStep.jsx'
import SuccessStep from './components/SuccessStep.jsx'
import styles from './styles/App.module.css'

const STEPS = ['upload', 'review', 'match', 'confirm', 'success']
const STEP_LABELS = ['1 · Upload', '2 · Review', '3 · Match', '4 · Confirm', 'Done']

export default function App() {
  const [step, setStep] = useState('upload')
  const [imageFile, setImageFile] = useState(null)
  const [labelData, setLabelData] = useState(null)
  const [confidence, setConfidence] = useState('high')
  const [matches, setMatches] = useState([])
  const [reviewFields, setReviewFields] = useState(null)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [savedRecord, setSavedRecord] = useState(null)

  const stepIdx = STEPS.indexOf(step)

  function handleIdentified({ matches: m, confidence: c, ...fields }, file) {
    setLabelData(fields)
    setConfidence(c || 'high')
    setMatches(m || [])
    setImageFile(file)
    setStep('review')
  }

  function handleReviewed(fields) {
    setReviewFields(fields)
    setStep('match')
  }

  function handleMatch(match) {
    setSelectedMatch(match)
    setStep('confirm')
  }

  function handleSkip() {
    setSelectedMatch(null)
    setStep('confirm')
  }

  function handleSaved(record) {
    setSavedRecord(record)
    setStep('success')
  }

  function handleAnother() {
    setLabelData(null)
    setConfidence('high')
    setMatches([])
    setImageFile(null)
    setReviewFields(null)
    setSelectedMatch(null)
    setSavedRecord(null)
    setStep('upload')
  }

  function goToStep(target) {
    const targetIdx = STEPS.indexOf(target)
    if (targetIdx <= stepIdx) setStep(target)
  }

  return (
    <>
      <Header />
      <nav className={styles.stepNav}>
        {STEPS.map((s, i) => (
          <button
            key={s}
            className={`${styles.stepTab}${s === step ? ' ' + styles.active : ''}`}
            onClick={() => goToStep(s)}
            disabled={i > stepIdx}
          >
            {STEP_LABELS[i]}
          </button>
        ))}
      </nav>
      <main className={styles.main}>
        {step === 'upload' && (
          <UploadStep onIdentified={handleIdentified} />
        )}
        {step === 'review' && (
          <ReviewStep
            data={labelData}
            confidence={confidence}
            imageFile={imageFile}
            onReviewed={handleReviewed}
            onBack={() => setStep('upload')}
          />
        )}
        {step === 'match' && (
          <MatchStep
            matches={matches}
            onMatch={handleMatch}
            onSkip={handleSkip}
            onBack={() => setStep('review')}
          />
        )}
        {step === 'confirm' && (
          <ConfirmStep
            reviewFields={reviewFields}
            selectedMatch={selectedMatch}
            onSaved={handleSaved}
            onBack={() => setStep('match')}
          />
        )}
        {step === 'success' && (
          <SuccessStep record={savedRecord} onAnother={handleAnother} />
        )}
      </main>
    </>
  )
}
