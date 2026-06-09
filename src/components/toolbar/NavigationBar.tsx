'use client'

import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import styles from './NavigationBar.module.css'

const iconStyle = (url: string) =>
  ({ '--icon-url': `url("${url}")` }) as CSSProperties
const MIN_ZOOM = 0.07
const MAX_ZOOM = 2
export const navigationTargets = [
  { id: 'img09-red-house', label: 'Red house image' },
  { id: 'survey-technology-friction', label: 'Technology question' },
  { id: 'contact-message-field', label: 'Message field' },
  { id: 'img01-street', label: 'Street image' },
  { id: 'opening-body-statement', label: 'Artefacts statement' },
  { id: 'img03-sky', label: 'Cloud image' },
  { id: 'philosophy-quote', label: 'Heidegger quote' },
  { id: 'product-vanly', label: 'Vanly' },
  { id: 'product-budge', label: 'Budge' },
  { id: 'product-revamp', label: 'REVAMP' },
  { id: 'identity-etymology', label: 'Etymology' },
  { id: 'product-laerly', label: 'Lærly' },
] as const

const getSliderProgress = (index: number) =>
  navigationTargets.length <= 1 ? 0 : (index / (navigationTargets.length - 1)) * 100
const sliderStyle = (progress: number) =>
  ({ '--slider-progress': `${progress}%` } as CSSProperties)
const dotStyle = (index: number) =>
  ({ '--dot-progress': `${getSliderProgress(index)}%` } as CSSProperties)

interface NavigationBarProps {
  zoom: number
  activeTargetId: string
  isMobile: boolean
  onPanOut: () => void
  onZoomChange: (zoom: number) => void
  onNavigateToAsset: (id: string) => void
  onSurveyOpen: () => void
}

export default function NavigationBar({
  zoom,
  activeTargetId,
  isMobile,
  onPanOut,
  onZoomChange,
  onNavigateToAsset,
  onSurveyOpen,
}: NavigationBarProps) {
  const zoomStep = 0.1
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const [dragProgress, setDragProgress] = useState<number | null>(null)
  const activeTargetIndex = Math.max(
    0,
    navigationTargets.findIndex((target) => target.id === activeTargetId),
  )
  const navigateToTarget = (id: string) => {
    onNavigateToAsset(id)
  }
  const getProgressFromPointer = (event: PointerEvent<HTMLElement>) => {
    const rect = sliderRef.current?.getBoundingClientRect()
    if (!rect || rect.height === 0) {
      return null
    }

    return Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
  }
  const navigateFromProgress = (progress: number) => {
    const index = Math.round(progress * (navigationTargets.length - 1))
    const target = navigationTargets[index]
    if (target && target.id !== activeTargetId) {
      navigateToTarget(target.id)
    }
  }
  const handleSliderPointer = (event: PointerEvent<HTMLElement>) => {
    const progress = getProgressFromPointer(event)
    if (progress === null) {
      return
    }

    setDragProgress(progress)
    navigateFromProgress(progress)
  }
  const visibleSliderProgress =
    dragProgress === null ? getSliderProgress(activeTargetIndex) : dragProgress * 100

  return (
    <nav className={styles.nav} data-mobile={isMobile ? 'true' : undefined} aria-label="Canvas navigation">
      {isMobile ? null : (
        <>
          <button
            type="button"
            className={styles.desktopControl}
            title="Return to start"
            onClick={onPanOut}
          >
            <span
              className={styles.icon}
              style={iconStyle('/fonts/zoom_out_map_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg')}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            className={styles.desktopControl}
            title="Open survey"
            onClick={onSurveyOpen}
          >
            <span
              className={styles.icon}
              style={iconStyle('/fonts/info_i_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg')}
              aria-hidden="true"
            />
          </button>
          <div className={`${styles.zoom} ${styles.desktopControl}`} aria-label="Canvas zoom controls">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => onZoomChange(Math.max(MIN_ZOOM, Number((zoom - zoomStep).toFixed(2))))}
            >
              -
            </button>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => onZoomChange(Math.min(MAX_ZOOM, Number((zoom + zoomStep).toFixed(2))))}
            >
              +
            </button>
          </div>
        </>
      )}
      <div
        ref={sliderRef}
        className={`${styles.itemSlider} ${isDraggingSlider ? styles.isDragging : ''}`}
        style={sliderStyle(visibleSliderProgress)}
        aria-label="Canvas item shortcuts"
        onPointerDown={(event) => {
          event.preventDefault()
          setIsDraggingSlider(true)
          event.currentTarget.setPointerCapture(event.pointerId)
          handleSliderPointer(event)
        }}
        onPointerMove={(event) => {
          if (isDraggingSlider) {
            event.preventDefault()
            handleSliderPointer(event)
          }
        }}
        onPointerUp={(event) => {
          setIsDraggingSlider(false)
          setDragProgress(null)
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        }}
        onPointerCancel={() => {
          setIsDraggingSlider(false)
          setDragProgress(null)
        }}
      >
        <div className={styles.sliderKnob} aria-hidden="true" />
        {navigationTargets.map((target, index) => (
          <button
            key={target.id}
            type="button"
            className={styles.sliderDot}
            style={dotStyle(index)}
            title={target.label}
            aria-label={`Go to ${target.label}`}
            aria-current={index === activeTargetIndex ? 'location' : undefined}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') {
                navigateToTarget(target.id)
              }
            }}
            onClick={() => navigateToTarget(target.id)}
          />
        ))}
      </div>
    </nav>
  )
}
