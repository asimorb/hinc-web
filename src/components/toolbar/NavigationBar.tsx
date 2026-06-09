'use client'

import type { CSSProperties } from 'react'
import styles from './NavigationBar.module.css'

const iconStyle = (url: string) =>
  ({ '--icon-url': `url("${url}")` }) as CSSProperties
const sliderStyle = (index: number) =>
  ({ '--slider-index': index } as CSSProperties)
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

interface NavigationBarProps {
  zoom: number
  activeTargetId: string
  onPanOut: () => void
  onZoomChange: (zoom: number) => void
  onNavigateToAsset: (id: string) => void
  onSurveyOpen: () => void
}

export default function NavigationBar({
  zoom,
  activeTargetId,
  onPanOut,
  onZoomChange,
  onNavigateToAsset,
  onSurveyOpen,
}: NavigationBarProps) {
  const zoomStep = 0.1
  const activeTargetIndex = Math.max(
    0,
    navigationTargets.findIndex((target) => target.id === activeTargetId),
  )
  const navigateToTarget = (id: string) => {
    onNavigateToAsset(id)
  }

  return (
    <nav className={styles.nav} aria-label="Canvas navigation">
      <button type="button" title="Return to start" onClick={onPanOut}>
        <span
          className={styles.icon}
          style={iconStyle('/fonts/zoom_out_map_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg')}
          aria-hidden="true"
        />
      </button>
      <button type="button" title="Open survey" onClick={onSurveyOpen}>
        <span
          className={styles.icon}
          style={iconStyle('/fonts/info_i_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg')}
          aria-hidden="true"
        />
      </button>
      <div className={styles.zoom} aria-label="Canvas zoom controls">
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
      <div
        className={styles.itemSlider}
        style={sliderStyle(activeTargetIndex)}
        aria-label="Canvas item shortcuts"
      >
        {navigationTargets.map((target, index) => (
          <button
            key={target.id}
            type="button"
            className={styles.sliderDot}
            title={target.label}
            aria-label={`Go to ${target.label}`}
            aria-current={index === activeTargetIndex ? 'location' : undefined}
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
