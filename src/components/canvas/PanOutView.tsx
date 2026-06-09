'use client'

import { zones, CANVAS_HEIGHT, CANVAS_WIDTH, type ZoneId } from '@/lib/zones'
import styles from './PanOutView.module.css'

interface PanOutViewProps {
  onNavigate: (zoneId: ZoneId) => void
}

export default function PanOutView({ onNavigate }: PanOutViewProps) {
  return (
    <div className={styles.overview} aria-label="Canvas overview">
      {zones.map((zone) => (
        <button
          key={zone.id}
          type="button"
          className={styles.zone}
          style={{
            left: `${(zone.x / CANVAS_WIDTH) * 100}%`,
            top: `${(zone.y / CANVAS_HEIGHT) * 100}%`,
            width: `${(zone.width / CANVAS_WIDTH) * 100}%`,
            height: `${(zone.height / CANVAS_HEIGHT) * 100}%`,
          }}
          onClick={() => onNavigate(zone.id)}
        >
          {zone.label}
        </button>
      ))}
    </div>
  )
}
