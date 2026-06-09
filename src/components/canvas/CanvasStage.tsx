'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  useAnimationControls,
  useReducedMotion,
  type Transition,
} from 'framer-motion'
import { assets, logoAnchors, mainLogoAnchor, type AssetDefinition } from '@/lib/assets'
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
const MOBILE_OPENING_FRAME = {
  x: 5030,
  y: 1350,
  width: 1500,
  height: 2050,
} as const

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

const getFrameScale = (
  frame: { width: number; height: number },
  viewportWidth: number,
  viewportHeight: number,
  insetX: number,
  insetY: number,
) =>
  Math.min(
    (viewportWidth - insetX * 2) / frame.width,
    (viewportHeight - insetY * 2) / frame.height,
  )

const getFramedPosition = (
  frame: { x: number; y: number; width: number; height: number },
  viewportWidth: number,
  viewportHeight: number,
  scale: number,
) => ({
  x: viewportWidth / 2 - (frame.x + frame.width / 2) * scale,
  y: viewportHeight / 2 - (frame.y + frame.height / 2) * scale,
})

const getMobileOpeningScale = (viewportWidth: number, viewportHeight: number) =>
  clamp(getFrameScale(MOBILE_OPENING_FRAME, viewportWidth, viewportHeight, 24, 96), 0.18, 0.36)

const getOpeningCamera = (
  isMobile: boolean,
  viewportWidth: number,
  viewportHeight: number,
  scale: number,
) =>
  clampCameraPosition(
    isMobile
      ? getFramedPosition(MOBILE_OPENING_FRAME, viewportWidth, viewportHeight, scale)
      : getOpeningPosition(viewportWidth, viewportHeight, scale),
    scale,
    viewportWidth,
    viewportHeight,
  )

const getMobileAssetFrame = (
  placement: AssetPlacement,
  asset: AssetDefinition,
) => {
  const width =
    asset.type === 'product'
      ? Math.max(asset.width, 1350)
      : asset.type === 'text' || asset.type === 'survey' || asset.type === 'message'
        ? Math.max(asset.width, 1100)
        : asset.width
  const height =
    asset.type === 'product'
      ? Math.max(asset.height, 1150)
      : asset.type === 'text' || asset.type === 'survey' || asset.type === 'message'
        ? Math.max(asset.height, 820)
        : asset.height

  return {
    x: placement.x + asset.width / 2 - width / 2,
    y: placement.y + asset.height / 2 - height / 2,
    width,
    height,
  }
}

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
  const activeTouchPointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchStartDistanceRef = useRef<number | null>(null)
  const pinchStartZoomRef = useRef(zoom)
  const pinchStartCanvasPointRef = useRef<{ x: number; y: number } | null>(null)
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null)
  const previousZoomRef = useRef(zoom)
  const cameraPositionRef = useRef({ x: 0, y: 0 })
  const cameraScaleRef = useRef(zoom)
  const nearestTrackedAssetRef = useRef<string | null>(null)
  const [viewport, setViewport] = useState({ width: 1280, height: 800 })
  const hasSetInitialViewRef = useRef(false)
  const initialViewModeRef = useRef<'desktop' | 'mobile' | null>(null)
  const logoColour = colourCombinations[colourCombo]?.logoColour ?? colourCombinations[0].logoColour
  const fitScale = useMemo(
    () => Math.min((viewport.width - 96) / CANVAS_WIDTH, (viewport.height - 96) / CANVAS_HEIGHT),
    [viewport],
  )
  const mobileOpeningScale = useMemo(
    () => getMobileOpeningScale(viewport.width, viewport.height),
    [viewport.height, viewport.width],
  )
  const openingScale = isMobile ? mobileOpeningScale : zoom
  const openingCamera = useMemo(
    () => getOpeningCamera(isMobile, viewport.width, viewport.height, openingScale),
    [isMobile, openingScale, viewport.height, viewport.width],
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
      setViewport({
        width: window.visualViewport?.width ?? window.innerWidth,
        height: window.visualViewport?.height ?? window.innerHeight,
      })
    }
    const visualViewport = window.visualViewport

    updateViewport()
    window.addEventListener('resize', updateViewport)
    window.addEventListener('orientationchange', updateViewport)
    visualViewport?.addEventListener('resize', updateViewport)
    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('orientationchange', updateViewport)
      visualViewport?.removeEventListener('resize', updateViewport)
    }
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

  const endMobilePointerGesture = useCallback((pointerId: number) => {
    activeTouchPointersRef.current.delete(pointerId)
    if (activeTouchPointersRef.current.size < 2) {
      pinchStartDistanceRef.current = null
      pinchStartCanvasPointRef.current = null
      onZoomChange(Number(cameraScaleRef.current.toFixed(2)))
    }
    if (activeTouchPointersRef.current.size === 1) {
      lastPanPointRef.current = Array.from(activeTouchPointersRef.current.values())[0]
    } else if (activeTouchPointersRef.current.size === 0) {
      lastPanPointRef.current = null
    }
  }, [onZoomChange])

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
    const viewMode = isMobile ? 'mobile' : 'desktop'
    if (hasSetInitialViewRef.current && initialViewModeRef.current === viewMode) {
      return
    }

    const initialScale = openingScale
    const openingPosition = openingCamera
    cameraPositionRef.current = openingPosition
    cameraScaleRef.current = initialScale
    previousZoomRef.current = initialScale
    void controls.start({
      ...openingPosition,
      scale: initialScale,
      transition: { duration: 0 },
    })
    if (isMobile) {
      onZoomChange(Number(initialScale.toFixed(2)))
    }
    hasSetInitialViewRef.current = true
    initialViewModeRef.current = viewMode
  }, [controls, isMobile, onZoomChange, openingCamera, openingScale])

  useEffect(() => {
    if (homeViewKey === 0) {
      return
    }

    const homeScale = openingScale
    const openingPosition = openingCamera
    cameraPositionRef.current = openingPosition
    cameraScaleRef.current = homeScale
    previousZoomRef.current = homeScale
    void controls.start({
      ...openingPosition,
      scale: homeScale,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeInOut' },
    })
    if (isMobile) {
      onZoomChange(Number(homeScale.toFixed(2)))
    }
  }, [
    controls,
    homeViewKey,
    isMobile,
    onZoomChange,
    openingCamera,
    openingScale,
    reduceMotion,
  ])

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
    if (!focusTarget) {
      return
    }

    const placement = layout.find((entry) => entry.id === focusTarget)
    const asset = placement ? assetById[placement.id] : undefined
    if (!placement || !asset) {
      onFocusComplete()
      return
    }

    const framePaddingX = isMobile ? 72 : 0
    const framePaddingY = isMobile ? 220 : 0
    const mobileFrame = isMobile ? getMobileAssetFrame(placement, asset) : null
    const targetScale = isMobile && mobileFrame
      ? clamp(
          getFrameScale(
            mobileFrame,
            viewport.width,
            viewport.height,
            framePaddingX,
            framePaddingY,
          ),
          0.12,
          0.62,
        )
      : effectiveScale
    const target = clampCameraPosition(
      isMobile && mobileFrame
        ? getFramedPosition(mobileFrame, viewport.width, viewport.height, targetScale)
        : {
            x: viewport.width / 2 - (placement.x + asset.width / 2) * targetScale,
            y: viewport.height / 2 - (placement.y + asset.height / 2) * targetScale,
          },
      targetScale,
      viewport.width,
      viewport.height,
    )
    cameraPositionRef.current = target
    cameraScaleRef.current = targetScale
    previousZoomRef.current = targetScale
    void controls
      .start({
        ...target,
        scale: targetScale,
        transition: reduceMotion
          ? { duration: 0 }
          : { duration: 0.6, ease: 'easeInOut' },
      })
      .then(onFocusComplete)
    if (isMobile) {
      onZoomChange(Number(targetScale.toFixed(2)))
    }
  }, [
    controls,
    effectiveScale,
    focusTarget,
    isMobile,
    layout,
    onFocusComplete,
    onZoomChange,
    reduceMotion,
    viewport.height,
    viewport.width,
  ])

  return (
    <main
      ref={viewportRef}
      className={styles.viewport}
      aria-label="HINC AS pannable canvas"
      onPointerDown={(event) => {
        if (!isMobile || event.pointerType !== 'touch') {
          return
        }

        activeTouchPointersRef.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        })
        if (activeTouchPointersRef.current.size === 1) {
          lastPanPointRef.current = { x: event.clientX, y: event.clientY }
        }
        if (activeTouchPointersRef.current.size === 2) {
          const points = Array.from(activeTouchPointersRef.current.values())
          const center = {
            x: (points[0].x + points[1].x) / 2,
            y: (points[0].y + points[1].y) / 2,
          }
          const currentPosition = cameraPositionRef.current
          const currentScale = cameraScaleRef.current
          pinchStartDistanceRef.current = Math.hypot(
            points[0].x - points[1].x,
            points[0].y - points[1].y,
          )
          pinchStartZoomRef.current = currentScale
          pinchStartCanvasPointRef.current = {
            x: (center.x - currentPosition.x) / currentScale,
            y: (center.y - currentPosition.y) / currentScale,
          }
          lastPanPointRef.current = null
        }
      }}
      onPointerMove={(event) => {
        if (
          !isMobile ||
          event.pointerType !== 'touch' ||
          !activeTouchPointersRef.current.has(event.pointerId)
        ) {
          return
        }

        const nextPoint = {
          x: event.clientX,
          y: event.clientY,
        }
        const previousPoint = activeTouchPointersRef.current.get(event.pointerId)
        activeTouchPointersRef.current.set(event.pointerId, nextPoint)

        if (activeTouchPointersRef.current.size === 1) {
          event.preventDefault()
          const lastPoint = lastPanPointRef.current ?? previousPoint ?? nextPoint
          const currentScale = cameraScaleRef.current
          const nextPosition = clampCameraPosition(
            {
              x: cameraPositionRef.current.x + nextPoint.x - lastPoint.x,
              y: cameraPositionRef.current.y + nextPoint.y - lastPoint.y,
            },
            currentScale,
            viewport.width,
            viewport.height,
          )
          cameraPositionRef.current = nextPosition
          controls.set({ ...nextPosition, scale: currentScale })
          lastPanPointRef.current = nextPoint
          return
        }

        if (
          activeTouchPointersRef.current.size < 2 ||
          !pinchStartDistanceRef.current ||
          !pinchStartCanvasPointRef.current
        ) {
          return
        }

        event.preventDefault()
        const points = Array.from(activeTouchPointersRef.current.values())
        const nextDistance = Math.hypot(
          points[0].x - points[1].x,
          points[0].y - points[1].y,
        )
        const center = {
          x: (points[0].x + points[1].x) / 2,
          y: (points[0].y + points[1].y) / 2,
        }
        const nextZoom = Number(
          clamp(
            pinchStartZoomRef.current * (nextDistance / pinchStartDistanceRef.current),
            MIN_ZOOM,
            MAX_ZOOM,
          ).toFixed(3),
        )
        const nextPosition = clampCameraPosition(
          {
            x: center.x - pinchStartCanvasPointRef.current.x * nextZoom,
            y: center.y - pinchStartCanvasPointRef.current.y * nextZoom,
          },
          nextZoom,
          viewport.width,
          viewport.height,
        )
        cameraPositionRef.current = nextPosition
        cameraScaleRef.current = nextZoom
        previousZoomRef.current = nextZoom
        controls.set({ ...nextPosition, scale: nextZoom })
      }}
      onPointerUp={(event) => {
        if (event.pointerType === 'touch') {
          endMobilePointerGesture(event.pointerId)
        }
      }}
      onPointerCancel={(event) => {
        if (event.pointerType === 'touch') {
          endMobilePointerGesture(event.pointerId)
        }
      }}
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
        initial={{
          ...openingCamera,
          scale: openingScale,
        }}
        drag={!isMobile && !isPannedOut && !canvasIsContained}
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
            autoPlay
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
                isMobile={isMobile}
              />
            )
          })}
        </div>
      </motion.div>
      {isPannedOut ? <PanOutView onNavigate={onNavigateZone} /> : null}
    </main>
  )
}
