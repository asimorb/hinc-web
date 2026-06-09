'use client'

/**
 * LogoAnchor.tsx
 *
 * Interactive HINC AS wordmark / anteater anchor.
 *
 * What it does:
 * - Renders the supplied HINC SVG paths without redrawing or approximating the mark.
 * - Each click triggers a controlled movement sequence: snout dip, head turn,
 *   eye blink, tail yank, rear-leg kick, then body shift.
 * - A local animation guard prevents overlapping gestures.
 * - Motion is suppressed when the user prefers reduced motion, while click handling remains active.
 *
 * Props:
 * - x: canvas x-coordinate for absolute positioning.
 * - y: canvas y-coordinate for absolute positioning.
 * - logoColour: the resolved colour used for all fill and stroke geometry.
 * - className: optional class name applied to the positioned button wrapper.
 *
 * SVG structure prerequisite:
 * - This component assumes the source SVG remains separable into addressable primitives:
 *   body/back path, head/neck path, snout curve path, and eye circle.
 * - If the mark is later exported as one compound path, this component should not be used
 *   until the SVG is re-articulated at the design-file level.
 *
 * Integration:
 * - Place this file in components/canvas/LogoAnchor.tsx.
 * - Import into CanvasStage.tsx and render inside the absolutely positioned canvas stage:
 *   <LogoAnchor x={anchorX} y={anchorY} logoColour={resolvedLogoColour} />
 */

import type {
  CSSProperties,
  MouseEventHandler,
  PointerEventHandler,
} from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  motion,
  useAnimationControls,
  useReducedMotion,
  type AnimationControls,
} from 'framer-motion'

interface LogoAnchorProps {
  x: number
  y: number
  width?: number
  height?: number
  logoColour: string
  autoPlay?: boolean
  className?: string
}

const wrapperStyle = (
  x: number,
  y: number,
  width: number,
  height: number,
): CSSProperties => ({
  position: 'absolute',
  left: x,
  top: y,
  width,
  height,
  padding: 0,
  margin: 0,
  border: 0,
  background: 'transparent',
  cursor: 'pointer',
  lineHeight: 0,
  transform: 'translate3d(0, 0, 0)',
})

const svgElementStyle = (transformOrigin: string): CSSProperties => ({
  transformBox: 'view-box',
  transformOrigin,
  willChange: 'transform',
})

const playLogoSequence = async ({
  bodyControls,
  headControls,
  snoutControls,
  eyeControls,
  tailControls,
  legControls,
}: {
  bodyControls: AnimationControls
  headControls: AnimationControls
  snoutControls: AnimationControls
  eyeControls: AnimationControls
  tailControls: AnimationControls
  legControls: AnimationControls
}): Promise<void> => {
  const smoothEase = [0.16, 1, 0.3, 1] as const

  await Promise.all([
    snoutControls.start({
      rotate: [0, 4.5, 0],
      y: [0, 1.4, 0],
      transition: {
        type: 'tween',
        duration: 0.62,
        ease: smoothEase,
        times: [0, 0.48, 1],
      },
    }),
    headControls.start({
      rotate: [0, -2.2, 0],
      x: [0, 1.4, 0],
      transition: {
        type: 'tween',
        delay: 0.28,
        duration: 0.72,
        ease: smoothEase,
        times: [0, 0.5, 1],
      },
    }),
    eyeControls.start({
      scaleY: [1, 0.12, 1],
      transition: {
        type: 'tween',
        delay: 0.74,
        duration: 0.14,
        times: [0, 0.45, 1],
        ease: 'easeInOut',
      },
    }),
    bodyControls.start({
      scaleX: [1, 0.988, 0.994, 1],
      rotate: [0, -0.45, 0.25, 0],
      x: [0, -1, -0.3, 0],
      transition: {
        type: 'tween',
        delay: 0.86,
        duration: 0.82,
        ease: smoothEase,
        times: [0, 0.34, 0.68, 1],
      },
    }),
    tailControls.start({
      rotate: [0, -7.5, 5.5, -2, 0],
      y: [0, -11, 7, -3, 0],
      transition: {
        type: 'tween',
        delay: 0.88,
        duration: 0.9,
        ease: smoothEase,
        times: [0, 0.28, 0.55, 0.78, 1],
      },
    }),
    legControls.start({
      rotate: [0, 7.5, -2.4, 0],
      x: [0, 1.8, -0.6, 0],
      y: [0, -5, 1.2, 0],
      transition: {
        type: 'tween',
        delay: 1.02,
        duration: 0.56,
        ease: smoothEase,
        times: [0, 0.38, 0.72, 1],
      },
    }),
  ])
}

export default function LogoAnchor({
  x,
  y,
  width = 598,
  height = 302,
  logoColour,
  autoPlay = false,
  className,
}: LogoAnchorProps) {
  const bodyControls = useAnimationControls()
  const headControls = useAnimationControls()
  const snoutControls = useAnimationControls()
  const eyeControls = useAnimationControls()
  const tailControls = useAnimationControls()
  const legControls = useAnimationControls()
  const prefersReducedMotion = useReducedMotion()
  const hasAutoPlayedRef = useRef(false)

  const [isAnimating, setIsAnimating] = useState(false)

  const playSequence = useCallback(async () => {
    if (isAnimating) {
      return
    }

    setIsAnimating(true)

    try {
      if (!prefersReducedMotion) {
        await playLogoSequence({
          bodyControls,
          headControls,
          snoutControls,
          eyeControls,
          tailControls,
          legControls,
        })
      }
    } finally {
      bodyControls.set({ rotate: 0, scaleX: 1, x: 0, y: 0 })
      headControls.set({ rotate: 0, x: 0, y: 0 })
      snoutControls.set({ rotate: 0, x: 0, y: 0 })
      eyeControls.set({ scaleX: 1, scaleY: 1 })
      tailControls.set({ rotate: 0, x: 0, y: 0 })
      legControls.set({ rotate: 0, x: 0, y: 0 })
      setIsAnimating(false)
    }
  }, [
    bodyControls,
    eyeControls,
    headControls,
    isAnimating,
    legControls,
    prefersReducedMotion,
    snoutControls,
    tailControls,
  ])

  useEffect(() => {
    if (!autoPlay || hasAutoPlayedRef.current) {
      return
    }

    hasAutoPlayedRef.current = true
    const timer = window.setTimeout(() => {
      void playSequence()
    }, 650)

    return () => window.clearTimeout(timer)
  }, [autoPlay, playSequence])

  const handlePointerDown: PointerEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation()
  }

  const handleClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.stopPropagation()
    await playSequence()
  }

  return (
    <button
      type="button"
      aria-label="Animate HINC logo"
      className={className}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      style={wrapperStyle(x, y, width, height)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 597.8 302.4"
        width={width}
        height={height}
        role="img"
        aria-hidden="true"
      >
        <motion.path
          animate={bodyControls}
          d="M229.3,36.3C128.5,59.8,45.3,154.4,23.8,254.4c-1.5,6.9-2.8,13.7-2.9,20.1l-.2-1.8c.2.7.4.8.3.7-.1,0-.3,0,0,0,.8-.1,1.4-.9,1.5-1.8,10.7-24.8,24-48.4,38.3-71.4,14.6-22.8,31.5-44.4,53.1-61.3,7.5-6,16.6-9.2,26.4-8.8,17,.6,29.6,13.9,31,30.4.8,8.1-.6,15.3-1.5,22.5-2.5,26.9,2.1,54.3,11.4,79.5,0,0,4.4,11.7,4.4,11.7,0,0-22.3,9.2-22.3,9.2-14.2-28.7-22-60.7-20.7-92.8,0-3.6.4-7.7.9-11.2.8-5.7,2-11.4,1.7-16.4-.4-9.2-9.4-9.1-15.6-5-10.2,7.2-19.8,15.5-29.1,24.4-9,8.7-17.7,18-25.7,27.8-15.4,17.5-32.3,47.7-39.5,63.8-1.5,9.6-13.3,16.1-21.8,9.9-3.1-2.3-5.2-5.9-5.4-9.6.3-11.9,3.1-22.2,5.5-33.4,11.6-46.6,34.5-90,64.8-127.2C118.5,64,172.6,25.7,234.7,8.5c0,0,6.8,25,6.8,25,0,0-12.1,2.7-12.1,2.7h0Z"
          fill={logoColour}
          style={svgElementStyle('126px 146px')}
        />

        <motion.path
          animate={headControls}
          d="M231.3,183.6c-10.1,0-18.3,8.2-18.3,18.3h0v84.5"
          fill="none"
          stroke={logoColour}
          strokeWidth="24.6"
          strokeLinejoin="round"
          style={svgElementStyle('213px 286.4px')}
        />

        <motion.path
          animate={snoutControls}
          d="M199.7,167.7c-7.9,5.3-11.7,11.5-13.7,22"
          fill="none"
          stroke={logoColour}
          strokeWidth="12.3"
          strokeLinejoin="round"
          style={svgElementStyle('199.7px 167.7px')}
        />

        <path
          d="M253.4,183.6h26.1,0c8,0,15.2,4.5,18.6,11.7"
          fill="none"
          stroke={logoColour}
          strokeWidth="24.6"
          strokeLinejoin="round"
        />

        <motion.path
          animate={legControls}
          d="M399.3,286.4l-51.3-106.8h0c-6.2-12.9-21.6-18.3-34.4-12.1-12.9,6.2-18.3,21.6-12.1,34.4l-3.1-6.6,43.7,91.1"
          fill="none"
          stroke={logoColour}
          strokeWidth="24.6"
          strokeLinejoin="round"
          style={svgElementStyle('335px 286px')}
        />

        <motion.path
          animate={tailControls}
          d="M435,70.7c-39.7,13.5-62.1,39.7-58.3,68.3,3.8,28.6,33.1,55,76.4,68.7,43.3,13.8,93.7,12.7,131.2-2.7"
          fill="none"
          stroke={logoColour}
          strokeWidth="24.6"
          strokeLinejoin="round"
          style={svgElementStyle('435px 143px')}
        />

        <motion.circle
          animate={eyeControls}
          cx="126.4"
          cy="115.4"
          r="7.1"
          fill={logoColour}
          stroke={logoColour}
          strokeWidth="0.9"
          strokeMiterlimit="10"
          style={svgElementStyle('126.4px 115.4px')}
        />
      </svg>
    </button>
  )
}
