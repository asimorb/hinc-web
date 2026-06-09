'use client'

import type { CSSProperties } from 'react'
import type { ActiveTool, SnapPosition } from '@/lib/canvasStore'
import type { CaseComboIndex, ColourComboIndex, FontComboIndex } from '@/lib/themes'
import SnapContainer from './SnapContainer'
import styles from './InteractionBar.module.css'

const iconStyle = (url: string) =>
  ({ '--icon-url': `url("${url}")` }) as CSSProperties

interface InteractionBarProps {
  activeTool: ActiveTool
  fontCombo: FontComboIndex
  colourCombo: ColourComboIndex
  caseCombo: CaseComboIndex
  snapPosition: SnapPosition
  isMobile: boolean
  onToolChange: (tool: ActiveTool) => void
  onFontChange: () => void
  onColourChange: () => void
  onCaseChange: () => void
  onSnapChange: (position: SnapPosition) => void
}

export default function InteractionBar({
  activeTool,
  fontCombo,
  colourCombo,
  caseCombo,
  snapPosition,
  isMobile,
  onToolChange,
  onFontChange,
  onColourChange,
  onCaseChange,
  onSnapChange,
}: InteractionBarProps) {
  return (
    <SnapContainer position={snapPosition} onSnap={onSnapChange}>
      <div className={styles.bar} aria-label="Canvas interaction tools">
        <button
          type="button"
          aria-pressed={activeTool === 'select'}
          disabled={isMobile}
          title="Selection tool"
          onClick={() => onToolChange(activeTool === 'select' ? null : 'select')}
        >
          <span
            className={styles.icon}
            style={iconStyle('/fonts/near_me_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg')}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          aria-pressed={activeTool === 'erase'}
          disabled={isMobile}
          title="Eraser tool"
          onClick={() => onToolChange(activeTool === 'erase' ? null : 'erase')}
        >
          <span
            className={styles.icon}
            style={iconStyle('/fonts/eraser_size_2_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg')}
            aria-hidden="true"
          />
        </button>
        <button type="button" title="Cycle font" onClick={onFontChange}>
          <span
            className={styles.icon}
            style={iconStyle('/fonts/title_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg')}
            aria-hidden="true"
          />
          <span className={styles.count}>{fontCombo + 1}</span>
        </button>
        <button type="button" title="Cycle colour" onClick={onColourChange}>
          <span
            className={styles.icon}
            style={iconStyle('/fonts/colors_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg')}
            aria-hidden="true"
          />
          <span className={styles.count}>{colourCombo + 1}</span>
        </button>
        <button type="button" title="Cycle case" onClick={onCaseChange}>
          <span
            className={styles.icon}
            style={iconStyle('/fonts/match_case_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg')}
            aria-hidden="true"
          />
          <span className={styles.count}>{caseCombo + 1}</span>
        </button>
      </div>
    </SnapContainer>
  )
}
