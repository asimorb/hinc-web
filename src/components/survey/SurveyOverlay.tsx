'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import styles from './SurveyOverlay.module.css'

interface SurveyOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const questions = [
  'What do you absolutely hate about technology?',
  'Where does technology make your day heavier than it needs to be?',
  'What would make a digital tool feel more human to you?',
] as const

const countWords = (value: string) =>
  value.trim().length === 0 ? 0 : value.trim().split(/\s+/).length

const limitWords = (value: string) => value.trim().split(/\s+/).slice(0, 200).join(' ')

export default function SurveyOverlay({ isOpen, onClose }: SurveyOverlayProps) {
  const [responses, setResponses] = useState<Record<number, string>>({})
  const panelRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const first = panelRef.current?.querySelector<HTMLElement>(
      'button, textarea, [href], input, select, [tabindex]:not([tabindex="-1"])',
    )
    first?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return
      }

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button, textarea, [href], input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('disabled'))

      if (focusable.length === 0) {
        return
      }

      const firstElement = focusable[0]
      const lastElement = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previous?.focus()
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="survey-title"
        >
          <motion.div
            ref={panelRef}
            className={styles.panel}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <header>
              <h2 id="survey-title">A small technology survey</h2>
              <button type="button" onClick={onClose} aria-label="Close survey">
                ×
              </button>
            </header>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                onClose()
              }}
            >
              {questions.map((question, index) => {
                const value = responses[index] ?? ''
                const words = countWords(value)
                return (
                  <label key={question}>
                    <span>{question}</span>
                    <textarea
                      value={value}
                      rows={4}
                      onChange={(event) => {
                        const next = event.target.value
                        setResponses((current) => ({
                          ...current,
                          [index]: countWords(next) > 200 ? limitWords(next) : next,
                        }))
                      }}
                    />
                    <small aria-live="polite">
                      {words >= 150 ? '50 words remaining' : `${200 - words} words available`}
                    </small>
                  </label>
                )
              })}
              <button type="submit">Close and keep thinking</button>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
