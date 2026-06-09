import type { AssetDefinition } from './assets'
import type { Zone } from './zones'

export interface AssetPlacement {
  id: string
  x: number
  y: number
  rotation: number
}

const MIN_SEPARATION = 170
const MAX_ATTEMPTS = 60

const randomBetween = (min: number, max: number): number =>
  Math.random() * (max - min) + min

const overlaps = (
  candidate: AssetPlacement,
  asset: AssetDefinition,
  placed: AssetPlacement[],
  assets: readonly AssetDefinition[],
): boolean =>
  placed.some((placement) => {
    const placedAsset = assets.find((entry) => entry.id === placement.id)
    if (!placedAsset || placedAsset.zoneId !== asset.zoneId) {
      return false
    }

    const separated =
      candidate.x + asset.width + MIN_SEPARATION < placement.x ||
      placement.x + placedAsset.width + MIN_SEPARATION < candidate.x ||
      candidate.y + asset.height + MIN_SEPARATION < placement.y ||
      placement.y + placedAsset.height + MIN_SEPARATION < candidate.y

    return !separated
  })

export const generateLayout = (
  zones: readonly Zone[],
  assets: readonly AssetDefinition[],
): AssetPlacement[] => {
  const placements: AssetPlacement[] = []

  assets.forEach((asset) => {
    const zone = zones.find((entry) => entry.id === asset.zoneId)
    if (!zone) {
      return
    }

    if (asset.fixedPlacement) {
      placements.push({
        id: asset.id,
        x: asset.fixedPlacement.x,
        y: asset.fixedPlacement.y,
        rotation: 0,
      })
      return
    }

    const maxX = Math.max(zone.x, zone.x + zone.width - asset.width)
    const maxY = Math.max(zone.y, zone.y + zone.height - asset.height)
    let candidate: AssetPlacement = {
      id: asset.id,
      x: randomBetween(zone.x, maxX),
      y: randomBetween(zone.y, maxY),
      rotation: 0,
    }

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      if (!overlaps(candidate, asset, placements, assets)) {
        break
      }

      candidate = {
        id: asset.id,
        x: randomBetween(zone.x, maxX),
        y: randomBetween(zone.y, maxY),
        rotation: 0,
      }
    }

    placements.push(candidate)
  })

  return placements
}
