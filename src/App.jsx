import { useState } from 'react'
import Header from './components/Header.jsx'
import UploadStep from './components/UploadStep.jsx'
import ReviewStep from './components/ReviewStep.jsx'
import SuccessStep from './components/SuccessStep.jsx'
import styles from './styles/App.module.css'

export default function App() {
  const [step, setStep] = useState('upload') // upload | review | success
  const [recordData, setRecordData] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [savedRecord, setSavedRecord] = useState(null)

  function handleIdentified(data, file) {
    setRecordData(data)
    setImageFile(file)
    setStep('review')
  }

  function handleSaved(record) {
    setSavedRecord(record)
    setStep('success')
  }

  function handleAnother() {
    setRecordData(null)
    setImageFile(null)
    setSavedRecord(null)
    setStep('upload')
  }

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        {step === 'upload' && (
          <UploadStep onIdentified={handleIdentified} />
        )}
        {step === 'review' && (
          <ReviewStep
            data={recordData}
            imageFile={imageFile}
            onSaved={handleSaved}
            onBack={() => setStep('upload')}
          />
        )}
        {step === 'success' && (
          <SuccessStep record={savedRecord} onAnother={handleAnother} />
        )}
      </main>
    </div>
  )
}
