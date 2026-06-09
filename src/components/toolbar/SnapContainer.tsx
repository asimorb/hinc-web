'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { SnapPosition } from '@/lib/canvasStore'
import styles from './SnapContainer.module.css'

export const snapPositions = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const satisfies readonly SnapPosition[]

interface SnapContainerProps {
  position: SnapPosition
  onSnap: (position: SnapPosition) => void
  isLocked?: boolean
  children: ReactNode
}

const getCoordinates = (
  position: SnapPosition,
  width: number,
  height: number,
  elementWidth: number,
  elementHeight: number,
) => {
  const margin = 36
  const centerX = width / 2 - elementWidth / 2
  const centerY = height / 2 - elementHeight / 2
  const right = width - elementWidth - margin
  const bottom = height - elementHeight - margin

  switch (position) {
    case 'top-left':
      return { x: margin, y: margin }
    case 'top-center':
      return { x: centerX, y: margin }
    case 'top-right':
      return { x: right, y: margin }
    case 'middle-left':
      return { x: margin, y: centerY }
    case 'middle-right':
      return { x: right, y: centerY }
    case 'bottom-left':
      return { x: margin, y: bottom }
    case 'bottom-center':
      return { x: centerX, y: bottom }
    case 'bottom-right':
      return { x: right, y: bottom }
  }
}

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y)

export default function SnapContainer({
  position,
  onSnap,
  isLocked = false,
  children,
}: SnapContainerProps) {
  const snapRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState({ width: 1280, height: 800 })
  const [elementSize, setElementSize] = useState({ width: 280, height: 48 })

  useEffect(() => {
    const update = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
      const rect = snapRef.current?.getBoundingClientRect()
      if (rect) {
        setElementSize({ width: rect.width, height: rect.height })
      }
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const target =
    typeof window === 'undefined'
      ? { x: 24, y: 24 }
      : getCoordinates(
          position,
          viewport.width,
          viewport.height,
          elementSize.width,
          elementSize.height,
        )

  return (
    <motion.div
      ref={snapRef}
      className={styles.snap}
      drag={!isLocked}
      dragMomentum={false}
      animate={target}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onDragEnd={(_, info) => {
        if (isLocked) {
          return
        }

        const current = {
          x: target.x + info.offset.x,
          y: target.y + info.offset.y,
        }
        const nearest = snapPositions
          .map((candidate) => ({
            position: candidate,
            coordinates: getCoordinates(
              candidate,
              viewport.width,
              viewport.height,
              elementSize.width,
              elementSize.height,
            ),
          }))
          .sort((a, b) => distance(current, a.coordinates) - distance(current, b.coordinates))[0]

        if (nearest && distance(current, nearest.coordinates) <= 60) {
          onSnap(nearest.position)
        }
      }}
    >
      {children}
    </motion.div>
  )
}
