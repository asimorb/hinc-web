'use client'

import Image from 'next/image'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { assets, products, type AssetDefinition } from '@/lib/assets'
import type { ActiveTool } from '@/lib/canvasStore'
import ProductCard from './ProductCard'
import styles from './CanvasAsset.module.css'

export interface CanvasAssetProps {
  asset: AssetDefinition
  x: number
  y: number
  rotation: number
  activeTool: ActiveTool
  isErased: boolean
  index: number
  isMobile: boolean
}

const getProduct = (id: string) => products.find((product) => product.id === id)
type ErasePoint = { x: number; y: number }
type EraseStroke = ErasePoint[]
const ERASER_RADIUS = 24
const ERASER_STROKE_WIDTH = ERASER_RADIUS * 2
const countWords = (value: string) =>
  value.trim().length === 0 ? 0 : value.trim().split(/\s+/).length

const limitWords = (value: string, maxWords: number) =>
  value.trim().split(/\s+/).slice(0, maxWords).join(' ')

export default function CanvasAsset({
  asset,
  x,
  y,
  rotation,
  activeTool,
  isErased,
  index,
  isMobile,
}: CanvasAssetProps) {
  const reduceMotion = useReducedMotion()
  const maskId = useId().replaceAll(':', '')
  const assetRef = useRef<HTMLDivElement>(null)
  const erasePointerIdRef = useRef<number | null>(null)
  const [isErasing, setIsErasing] = useState(false)
  const [eraseStrokes, setEraseStrokes] = useState<EraseStroke[]>([])
  const [surveyValue, setSurveyValue] = useState('')
  const [messageValue, setMessageValue] = useState('')
  const [messageSent, setMessageSent] = useState(false)
  const isDraggable = activeTool === 'select' && !isMobile
  const canErase = activeTool === 'erase' && asset.isErasable && !isMobile
  const isInteractive = isDraggable || canErase
  const usesPaletteMask = asset.src && asset.id.startsWith('pix-planet-')
  const product = asset.type === 'product' ? getProduct(asset.id) : undefined
  const classes = [
    styles.asset,
    isInteractive ? styles.interactive : '',
    reduceMotion ? styles.reduceMotion : '',
    styles[asset.type],
    asset.variant ? styles[asset.variant] : '',
    styles[asset.id.replaceAll('-', '_')] ?? '',
    canErase ? styles.eraser : '',
  ]
    .filter(Boolean)
    .join(' ')
  const assetStyle = {
    left: x,
    top: y,
    width: asset.width,
    height: asset.height,
    rotate: reduceMotion || isMobile ? 0 : rotation,
  } as const
  const maskUrl = `url(#erase-mask-${maskId})`
  const assetSurfaceStyle =
    eraseStrokes.length > 0
      ? ({
          mask: maskUrl,
          WebkitMask: maskUrl,
        } as CSSProperties)
      : undefined
  const paletteMaskStyle = usesPaletteMask
    ? ({
        '--asset-mask': `url("${asset.src}")`,
      } as CSSProperties)
    : undefined
  const getPointFromClient = (clientX: number, clientY: number): ErasePoint | null => {
    const rect = assetRef.current?.getBoundingClientRect()
    if (!rect) {
      return null
    }

    return {
      x: ((clientX - rect.left) / rect.width) * asset.width,
      y: ((clientY - rect.top) / rect.height) * asset.height,
    }
  }
  const getPoint = (event: ReactPointerEvent<HTMLDivElement>): ErasePoint | null =>
    getPointFromClient(event.clientX, event.clientY)

  const addErasePoint = (point: ErasePoint) => {
    setEraseStrokes((current) => {
      const next = [...current]
      const latest = next[next.length - 1]
      if (!latest) {
        return [[point]]
      }
      const previous = latest[latest.length - 1]
      if (!previous) {
        next[next.length - 1] = [point]
        return next
      }

      const distance = Math.hypot(point.x - previous.x, point.y - previous.y)
      const steps = Math.max(1, Math.ceil(distance / ERASER_RADIUS))
      const interpolated = Array.from({ length: steps }, (_, step) => {
        const progress = (step + 1) / steps
        return {
          x: previous.x + (point.x - previous.x) * progress,
          y: previous.y + (point.y - previous.y) * progress,
        }
      })
      next[next.length - 1] = [...latest, ...interpolated]
      return next
    })
  }

  useEffect(() => {
    if (!isErasing || erasePointerIdRef.current === null) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== erasePointerIdRef.current) {
        return
      }

      event.preventDefault()
      const point = getPointFromClient(event.clientX, event.clientY)
      if (point) {
        addErasePoint(point)
      }
    }
    const stopErasing = (event: PointerEvent) => {
      if (event.pointerId !== erasePointerIdRef.current) {
        return
      }

      erasePointerIdRef.current = null
      setIsErasing(false)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', stopErasing)
    window.addEventListener('pointercancel', stopErasing)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopErasing)
      window.removeEventListener('pointercancel', stopErasing)
    }
  }, [asset.height, asset.width, isErasing])

  const surveyWords = countWords(surveyValue)
  const messageWords = countWords(messageValue)

  return (
    <motion.div
      ref={assetRef}
      className={classes}
      role={asset.type === 'image' || asset.type === 'sketch' ? 'img' : 'group'}
      aria-label={asset.alt ?? asset.id}
      style={assetStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: isErased ? 0 : 1 }}
      transition={{ delay: index * 0.08, duration: 0.2 }}
      drag={isDraggable}
      dragListener={isDraggable}
      dragMomentum={false}
      whileDrag={reduceMotion ? undefined : { scale: 1.02 }}
      onPointerDown={(event) => {
        if (!canErase) {
          return
        }
        event.preventDefault()
        event.stopPropagation()
        const point = getPoint(event)
        if (!point) {
          return
        }
        event.currentTarget.setPointerCapture(event.pointerId)
        erasePointerIdRef.current = event.pointerId
        setIsErasing(true)
        setEraseStrokes((current) => [...current, [point]])
      }}
      onPointerMove={(event) => {
        if (!canErase || !isErasing) {
          return
        }
        event.preventDefault()
        event.stopPropagation()
        const point = getPoint(event)
        if (point) {
          addErasePoint(point)
        }
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
        erasePointerIdRef.current = null
        setIsErasing(false)
      }}
      onPointerCancel={() => {
        erasePointerIdRef.current = null
        setIsErasing(false)
      }}
    >
      {eraseStrokes.length > 0 ? (
        <svg className={styles.eraseMaskSvg} viewBox={`0 0 ${asset.width} ${asset.height}`} aria-hidden="true">
          <defs>
            <mask
              id={`erase-mask-${maskId}`}
              x="0"
              y="0"
              width={asset.width}
              height={asset.height}
              maskUnits="userSpaceOnUse"
            >
              <rect width={asset.width} height={asset.height} fill="white" />
              {eraseStrokes.map((stroke, strokeIndex) =>
                stroke.length === 1 ? (
                  <circle
                    key={`${asset.id}-${strokeIndex}`}
                    cx={stroke[0].x}
                    cy={stroke[0].y}
                    r={ERASER_RADIUS}
                    fill="black"
                  />
                ) : (
                  <polyline
                    key={`${asset.id}-${strokeIndex}`}
                    points={stroke.map((point) => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke="black"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={ERASER_STROKE_WIDTH}
                  />
                ),
              )}
            </mask>
          </defs>
        </svg>
      ) : null}
      <div className={styles.assetSurface} style={assetSurfaceStyle}>
        {asset.src && usesPaletteMask ? (
          <div
            className={styles.paletteMask}
            style={paletteMaskStyle}
            role="img"
            aria-label={asset.alt ?? ''}
          />
        ) : null}
        {asset.src && !usesPaletteMask ? (
          <Image
            src={asset.src}
            alt={asset.alt ?? ''}
            width={asset.width}
            height={asset.height}
            draggable={false}
            className={styles.image}
            style={{ objectFit: asset.objectFit ?? 'cover' }}
            sizes={`${asset.width}px`}
          />
        ) : null}
        {asset.type === 'text' ? (
          asset.id === 'identity-etymology' ? (
            <p className={styles.etymology} aria-label="Latin etymology of hinc">
              <span>
                <strong>hic</strong>
                <em>HERE</em>
              </span>
              <span>
                <strong>huc</strong>
                <em>TO HERE</em>
              </span>
              <span>
                <strong>hinc</strong>
                <em>FROM HERE</em>
              </span>
            </p>
          ) : asset.variant === 'body' ? (
            <p className={styles.bodyStatement}>{asset.content}</p>
          ) : (
            <figure className={styles.quote}>
              <blockquote>
                We cannot choose where we are cast into this world, but it is only from
                here--confronting the exact landscape of our present existence--that we
                can begin to strip away illusions, embrace our ultimate responsibility,
                and design an authentic future.
              </blockquote>
              <figcaption>-- Heidegger</figcaption>
            </figure>
          )
        ) : null}
        {asset.type === 'survey' ? (
          <section className={styles.surveyPrompt}>
            <span>One question, for now</span>
            <h2>{asset.content}</h2>
            <div className={styles.responseField} data-empty={surveyValue.length === 0}>
              <textarea
                aria-label="Technology survey response"
                value={surveyValue}
                rows={6}
                onChange={(event) => {
                  const words = event.target.value.trim().split(/\s+/)
                  setSurveyValue(
                    words.length > 200 ? words.slice(0, 200).join(' ') : event.target.value,
                  )
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onPointerMove={(event) => event.stopPropagation()}
              />
            </div>
            <small aria-live="polite">{200 - surveyWords}</small>
          </section>
        ) : null}
        {asset.type === 'message' ? (
          <form
            className={styles.messageField}
            onSubmit={(event) => {
              event.preventDefault()
              if (messageValue.trim().length > 0) {
                setMessageSent(true)
              }
            }}
          >
            <label>
              <span>{asset.content}</span>
              <div className={styles.messageLine}>
                <textarea
                  aria-label="Leave a message for HINC"
                  value={messageValue}
                  rows={2}
                  onChange={(event) => {
                    const next = event.target.value
                    setMessageSent(false)
                    setMessageValue(countWords(next) > 400 ? limitWords(next, 400) : next)
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  onPointerMove={(event) => event.stopPropagation()}
                />
                <small aria-live="polite">{400 - messageWords}</small>
              </div>
            </label>
            <button type="submit">
              {messageSent ? 'Message held' : 'Leave message'}
            </button>
          </form>
        ) : null}
        {product ? (
          <ProductCard
            name={product.name}
            tagline={product.tagline}
            status={'status' in product ? product.status : undefined}
            logo={product.logo}
          />
        ) : null}
      </div>
    </motion.div>
  )
}

export const assetById = Object.fromEntries(
  assets.map((asset) => [asset.id, asset]),
) as Record<string, AssetDefinition>
