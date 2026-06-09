export const CANVAS_WIDTH = 9000
export const CANVAS_HEIGHT = 6800

export type ZoneId =
  | 'opening'
  | 'identity'
  | 'philosophical'
  | 'interactive'
  | 'products'

export interface Zone {
  id: ZoneId
  label: string
  x: number
  y: number
  width: number
  height: number
}

export const zones = [
  { id: 'opening', label: 'Opening', x: 3450, y: 2550, width: 1900, height: 1200 },
  { id: 'identity', label: 'Identity', x: 650, y: 650, width: 2300, height: 1800 },
  {
    id: 'philosophical',
    label: 'Philosophical',
    x: 6000,
    y: 850,
    width: 2100,
    height: 1700,
  },
  {
    id: 'interactive',
    label: 'Interactive',
    x: 1050,
    y: 4300,
    width: 2300,
    height: 1500,
  },
  {
    id: 'products',
    label: 'Products',
    x: 5750,
    y: 4050,
    width: 2300,
    height: 1600,
  },
] as const satisfies readonly Zone[]

export const zoneById = Object.fromEntries(
  zones.map((zone) => [zone.id, zone]),
) as Record<ZoneId, Zone>
