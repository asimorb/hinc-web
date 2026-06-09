'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  useAnimationControls,
  useReducedMotion,
  type Transition,
} from 'framer-motion'
import { assets, logoAnchors, mainLogoAnchor } from '@/lib/assets'
import type { ActiveTool } from '@/lib/canvasStore'
import type { AssetPlacement } from '@/lib/layoutEngine'
import { colourCombinations } from '@/lib/themes'
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  zoneById,
  type ZoneId,
} from '@/lib/zones'
import CanvasAsset, { assetById } from './CanvasAsset'
import LogoAnchor from './LogoAnchor'
import PanOutView from './PanOutView'
import styles from './CanvasStage.module.css'

const MIN_ZOOM = 0.07
const MAX_ZOOM = 2
const WHEEL_ZOOM_STEP = 0.05

interface CanvasStageProps {
  layout: AssetPlacement[]
  erasedIds: Set<string>
  activeTool: ActiveTool
  colourCombo: number
  zoom: number
  isPannedOut: boolean
  panTarget: ZoneId | null
  focusTarget: string | null
  trackedAssetIds: readonly string[]
  isMobile: boolean
  resetKey: number
  homeViewKey: number
  onZoomChange: (zoom: number) => void
  onPanComplete: () => void
  onFocusComplete: () => void
  onNearestAssetChange: (id: string) => void
  onNavigateZone: (zoneId: ZoneId) => void
}

const getCenteredPosition = (
  zoneId: ZoneId,
  viewportWidth: number,
  viewportHeight: number,
  scale: number,
) => {
  const zone = zoneById[zoneId]
  return {
    x: viewportWidth / 2 - (zone.x + zone.width / 2) * scale,
    y: viewportHeight / 2 - (zone.y + zone.height / 2) * scale,
  }
}

const getOpeningPosition = (
  viewportWidth: number,
  viewportHeight: number,
  scale: number,
) => ({
  x: viewportWidth / 2 - (mainLogoAnchor.x + mainLogoAnchor.width / 2) * scale,
  y: viewportHeight / 2 - (mainLogoAnchor.y + mainLogoAnchor.height / 2) * scale,
})

const getCanvasCenterPosition = (
  viewportWidth: number,
  viewportHeight: number,
  scale: number,
) => ({
  x: (viewportWidth - CANVAS_WIDTH * scale) / 2,
  y: (viewportHeight - CANVAS_HEIGHT * scale) / 2,
})

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const clampCameraPosition = (
  position: { x: number; y: number },
  scale: number,
  viewportWidth: number,
  viewportHeight: number,
) => {
  const scaledWidth = CANVAS_WIDTH * scale
  const scaledHeight = CANVAS_HEIGHT * scale

  return {
    x:
      scaledWidth <= viewportWidth
        ? (viewportWidth - scaledWidth) / 2
        : clamp(position.x, viewportWidth - scaledWidth, 0),
    y:
      scaledHeight <= viewportHeight
        ? (viewportHeight - scaledHeight) / 2
        : clamp(position.y, viewportHeight - scaledHeight, 0),
  }
}

export default function CanvasStage({
  layout,
  erasedIds,
  activeTool,
  colourCombo,
  zoom,
  isPannedOut,
  panTarget,
  focusTarget,
  trackedAssetIds,
  isMobile,
  resetKey,
  homeViewKey,
  onZoomChange,
  onPanComplete,
  onFocusComplete,
  onNearestAssetChange,
  onNavigateZone,
}: CanvasStageProps) {
  const controls = useAnimationControls()
  const reduceMotion = useReducedMotion()
  const viewportRef = useRef<HTMLElement>(null)
  const gestureStartZoomRef = useRef(zoom)
  const previousZoomRef = useRef(zoom)
  const cameraPositionRef = useRef({ x: 0, y: 0 })
  const cameraScaleRef = useRef(zoom)
  const nearestTrackedAssetRef = useRef<string | null>(null)
  const [viewport, setViewport] = useState({ width: 1280, height: 800 })
  const hasSetInitialViewRef = useRef(false)
  const logoColour = colourCombinations[colourCombo]?.logoColour ?? colourCombinations[0].logoColour
  const fitScale = useMemo(
    () => Math.min((viewport.width - 96) / CANVAS_WIDTH, (viewport.height - 96) / CANVAS_HEIGHT),
    [viewport],
  )
  const effectiveScale = isPannedOut ? fitScale : zoom
  const canvasIsContained =
    CANVAS_WIDTH * effectiveScale <= viewport.width &&
    CANVAS_HEIGHT * effectiveScale <= viewport.height

  const updateNearestTrackedAsset = useCallback(
    (position: { x: number; y: number }, scale: number) => {
      if (focusTarget || trackedAssetIds.length === 0 || scale === 0) {
        return
      }

      const viewportCenter = {
        x: (viewport.width / 2 - position.x) / scale,
        y: (viewport.height / 2 - position.y) / scale,
      }
      let nearestId: string | null = null
      let nearestDistance = Number.POSITIVE_INFINITY

      for (const id of trackedAssetIds) {
        const placement = layout.find((entry) => entry.id === id)
        const asset = placement ? assetById[placement.id] : undefined
        if (!placement || !asset) {
          continue
        }

        const centerX = placement.x + asset.width / 2
        const centerY = placement.y + asset.height / 2
        const distance =
          (centerX - viewportCenter.x) ** 2 + (centerY - viewportCenter.y) ** 2

        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestId = id
        }
      }

      if (nearestId && nearestTrackedAssetRef.current !== nearestId) {
        nearestTrackedAssetRef.current = nearestId
        onNearestAssetChange(nearestId)
      }
    },
    [
      focusTarget,
      layout,
      onNearestAssetChange,
      trackedAssetIds,
      viewport.height,
      viewport.width,
    ],
  )

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const setCameraPosition = useCallback(
    (
      position: { x: number; y: number },
      scale: number,
      transition: Transition,
    ) => {
      const clamped = clampCameraPosition(
        position,
        scale,
        viewport.width,
        viewport.height,
      )
      cameraPositionRef.current = clamped
      cameraScaleRef.current = scale
      void controls.start({
        ...clamped,
        scale,
        transition,
      })
    },
    [controls, viewport.height, viewport.width],
  )

  const getPositionForZoom = useCallback(
    (
      focalPoint: { x: number; y: number },
      oldZoom: number,
      nextZoom: number,
    ) => {
      const current = cameraPositionRef.current
      const canvasX = (focalPoint.x - current.x) / oldZoom
      const canvasY = (focalPoint.y - current.y) / oldZoom

      return clampCameraPosition(
        {
          x: focalPoint.x - canvasX * nextZoom,
          y: focalPoint.y - canvasY * nextZoom,
        },
        nextZoom,
        viewport.width,
        viewport.height,
      )
    },
    [viewport.height, viewport.width],
  )

  const zoomAroundPoint = useCallback(
    (nextZoom: number, focalPoint: { x: number; y: number }) => {
      const clampedZoom = Number(clamp(nextZoom, MIN_ZOOM, MAX_ZOOM).toFixed(2))
      const currentZoom = cameraScaleRef.current
      if (clampedZoom === currentZoom) {
        return
      }

      const nextPosition = getPositionForZoom(focalPoint, currentZoom, clampedZoom)
      cameraPositionRef.current = nextPosition
      cameraScaleRef.current = clampedZoom
      previousZoomRef.current = clampedZoom
      controls.set({ ...nextPosition, scale: clampedZoom })
      onZoomChange(clampedZoom)
    },
    [controls, getPositionForZoom, onZoomChange],
  )

  useEffect(() => {
    const element = viewportRef.current
    if (!element) {
      return
    }

    const handleGestureStart = (event: Event) => {
      event.preventDefault()
      gestureStartZoomRef.current = zoom
    }

    const handleGestureChange = (event: Event) => {
      event.preventDefault()
      const scale = (event as Event & { scale?: number }).scale ?? 1
      const gesture = event as Event & { clientX?: number; clientY?: number }
      zoomAroundPoint(gestureStartZoomRef.current * scale, {
        x: gesture.clientX ?? viewport.width / 2,
        y: gesture.clientY ?? viewport.height / 2,
      })
    }

    element.addEventListener('gesturestart', handleGestureStart)
    element.addEventListener('gesturechange', handleGestureChange)
    return () => {
      element.removeEventListener('gesturestart', handleGestureStart)
      element.removeEventListener('gesturechange', handleGestureChange)
    }
  }, [viewport.height, viewport.width, zoom, zoomAroundPoint])

  useEffect(() => {
    if (isMobile || hasSetInitialViewRef.current) {
      return
    }

    const openingPosition = clampCameraPosition(
      getOpeningPosition(viewport.width, viewport.height, zoom),
      zoom,
      viewport.width,
      viewport.height,
    )
    cameraPositionRef.current = openingPosition
    cameraScaleRef.current = zoom
    controls.set({ ...openingPosition, scale: zoom })
    hasSetInitialViewRef.current = true
  }, [controls, isMobile, viewport.height, viewport.width, zoom])

  useEffect(() => {
    if (isMobile || homeViewKey === 0) {
      return
    }

    const openingPosition = clampCameraPosition(
      getOpeningPosition(viewport.width, viewport.height, zoom),
      zoom,
      viewport.width,
      viewport.height,
    )
    cameraPositionRef.current = openingPosition
    cameraScaleRef.current = zoom
    previousZoomRef.current = zoom
    void controls.start({
      ...openingPosition,
      scale: zoom,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeInOut' },
    })
  }, [controls, homeViewKey, isMobile, reduceMotion, viewport.height, viewport.width, zoom])

  useEffect(() => {
    if (isMobile || !isPannedOut) {
      return
    }

    const panOutPosition = getCanvasCenterPosition(viewport.width, viewport.height, fitScale)
    cameraPositionRef.current = panOutPosition
    cameraScaleRef.current = fitScale
    void controls.start({
      ...panOutPosition,
      scale: fitScale,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' },
    })
  }, [controls, fitScale, isMobile, isPannedOut, reduceMotion, viewport.height, viewport.width])

  useEffect(() => {
    if (isMobile || isPannedOut || previousZoomRef.current === zoom) {
      return
    }

    const focalPoint = { x: viewport.width / 2, y: viewport.height / 2 }
    const currentZoom = cameraScaleRef.current
    const nextPosition = getPositionForZoom(focalPoint, currentZoom, zoom)
    previousZoomRef.current = zoom
    cameraScaleRef.current = zoom
    setCameraPosition(
      nextPosition,
      zoom,
      reduceMotion ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' },
    )
  }, [
    getPositionForZoom,
    isMobile,
    isPannedOut,
    reduceMotion,
    setCameraPosition,
    viewport.height,
    viewport.width,
    zoom,
  ])

  useEffect(() => {
    if (isMobile || !panTarget) {
      return
    }

    const target = clampCameraPosition(
      getCenteredPosition(panTarget, viewport.width, viewport.height, effectiveScale),
      effectiveScale,
      viewport.width,
      viewport.height,
    )
    cameraPositionRef.current = target
    cameraScaleRef.current = effectiveScale
    void controls
      .start({
        ...target,
        scale: effectiveScale,
        transition: reduceMotion
          ? { duration: 0 }
          : { duration: 0.6, ease: 'easeInOut' },
      })
      .then(onPanComplete)
  }, [controls, effectiveScale, isMobile, onPanComplete, panTarget, reduceMotion, viewport.height, viewport.width])

  useEffect(() => {
    if (isMobile || !focusTarget) {
      return
    }

    const placement = layout.find((entry) => entry.id === focusTarget)
    const asset = placement ? assetById[placement.id] : undefined
    if (!placement || !asset) {
      onFocusComplete()
      return
    }

    const target = clampCameraPosition(
      {
        x: viewport.width / 2 - (placement.x + asset.width / 2) * effectiveScale,
        y: viewport.height / 2 - (placement.y + asset.height / 2) * effectiveScale,
      },
      effectiveScale,
      viewport.width,
      viewport.height,
    )
    cameraPositionRef.current = target
    cameraScaleRef.current = effectiveScale
    void controls
      .start({
        ...target,
        scale: effectiveScale,
        transition: reduceMotion
          ? { duration: 0 }
          : { duration: 0.6, ease: 'easeInOut' },
      })
      .then(onFocusComplete)
  }, [
    controls,
    effectiveScale,
    focusTarget,
    isMobile,
    layout,
    onFocusComplete,
    reduceMotion,
    viewport.height,
    viewport.width,
  ])

  if (isMobile) {
    return (
      <main className={styles.mobileStage} aria-label="HINC AS canvas content">
        <LogoAnchor x={0} y={0} logoColour={logoColour} className={styles.mobileLogo} />
        {assets.map((asset, index) => {
          const placement = layout.find((entry) => entry.id === asset.id)
          return (
            <CanvasAsset
              key={`${asset.id}-${resetKey}`}
              asset={asset}
              x={placement?.x ?? 0}
              y={placement?.y ?? 0}
              rotation={0}
              activeTool={activeTool}
              isErased={erasedIds.has(asset.id)}
              index={index}
              isMobile
            />
          )
        })}
      </main>
    )
  }

  return (
    <main
      ref={viewportRef}
      className={styles.viewport}
      aria-label="HINC AS pannable canvas"
      onWheel={(event) => {
        event.preventDefault()
        const direction = event.deltaY > 0 ? -1 : 1
        zoomAroundPoint(zoom + direction * WHEEL_ZOOM_STEP, {
          x: event.clientX,
          y: event.clientY,
        })
      }}
    >
      <motion.div
        className={styles.stage}
        role="application"
        aria-label="Pannable HINC spatial canvas"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        }}
        drag={!isPannedOut && !canvasIsContained}
        dragMomentum={false}
        dragElastic={0.04}
        dragConstraints={{
          left: Math.min(0, viewport.width - CANVAS_WIDTH * effectiveScale),
          right: 0,
          top: Math.min(0, viewport.height - CANVAS_HEIGHT * effectiveScale),
          bottom: 0,
        }}
        animate={controls}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        onUpdate={(latest) => {
          if (typeof latest.x === 'number' && typeof latest.y === 'number') {
            cameraPositionRef.current = { x: latest.x, y: latest.y }
          }
          if (typeof latest.scale === 'number') {
            cameraScaleRef.current = latest.scale
          }
          updateNearestTrackedAsset(cameraPositionRef.current, cameraScaleRef.current)
        }}
      >
        <div className={styles.scaleLayer}>
          <LogoAnchor
            x={mainLogoAnchor.x}
            y={mainLogoAnchor.y}
            width={mainLogoAnchor.width}
            height={mainLogoAnchor.height}
            logoColour={logoColour}
            className={styles.logoAnchor}
          />
          {logoAnchors.slice(1).map((anchor) => (
            <LogoAnchor
              key={anchor.id}
              x={anchor.x}
              y={anchor.y}
              width={anchor.width}
              height={anchor.height}
              logoColour={logoColour}
              className={styles.logoAnchor}
            />
          ))}
          {layout.map((placement, index) => {
            const asset = assetById[placement.id]
            if (!asset) {
              return null
            }

            return (
              <CanvasAsset
                key={`${placement.id}-${resetKey}`}
                asset={asset}
                x={placement.x}
                y={placement.y}
                rotation={placement.rotation}
                activeTool={activeTool}
                isErased={erasedIds.has(placement.id)}
                index={index}
                isMobile={false}
              />
            )
          })}
        </div>
      </motion.div>
      {isPannedOut ? <PanOutView onNavigate={onNavigateZone} /> : null}
    </main>
  )
}
