'use client'

import Image from 'next/image'
import type { CSSProperties } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './ProductCard.module.css'

export interface ProductCardProps {
  name: string
  tagline: string
  status?: string
  logo?: {
    src: string
    width: number
    height: number
    displayWidth?: number
    displayHeight?: number
  }
}

export default function ProductCard({ name, tagline, status, logo }: ProductCardProps) {
  const reduceMotion = useReducedMotion()
  const logoStyle = logo
    ? ({
        width: logo.displayWidth ?? 480,
        height: logo.displayHeight ?? 184,
      } as CSSProperties)
    : undefined

  return (
    <motion.article
      className={styles.card}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -4,
              transition: { duration: 0.2, ease: 'easeOut' },
        }
      }
    >
      <h3 className={logo ? styles.logoTitle : undefined} style={logoStyle}>
        {logo ? (
          <Image
            src={logo.src}
            alt={name}
            width={logo.width}
            height={logo.height}
            className={styles.logo}
            style={logoStyle}
            sizes="350px"
          />
        ) : (
          name
        )}
      </h3>
      <p>{tagline}</p>
      {status ? <span>{status}</span> : null}
    </motion.article>
  )
}
