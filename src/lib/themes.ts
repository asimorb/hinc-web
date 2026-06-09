export type FontComboIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type ColourComboIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type CaseComboIndex = 0 | 1 | 2

export interface FontCombination {
  id: FontComboIndex
  display: string
  body: string
  character: string
}

export interface ColourCombination {
  id: ColourComboIndex
  name: string
  background: string
  text: string
  accent: string
  logoColour: string
}

export interface CaseCombination {
  id: CaseComboIndex
  name: string
  textTransform: 'uppercase' | 'lowercase' | 'none'
}

export const fontCombinations = [
  {
    id: 0,
    display: 'Instrument Serif',
    body: 'Risha Neo UwU',
    character: 'Literary Serif / Vernacular Script',
  },
  {
    id: 1,
    display: 'Montserrat',
    body: 'Karla',
    character: 'Geometric / Humanist',
  },
  {
    id: 2,
    display: 'DotGothic16',
    body: 'Space Mono',
    character: 'Pixel / Monospace',
  },
  {
    id: 3,
    display: 'Cardo',
    body: 'Hind',
    character: 'Classical Serif / Humanist Sans',
  },
  {
    id: 4,
    display: 'Rethink Sans',
    body: 'Spectral',
    character: 'Grotesque / Literary Serif',
  },
  {
    id: 5,
    display: 'Young Serif',
    body: 'Instrument Sans',
    character: 'Chunky Serif / Neutral Sans',
  },
  {
    id: 6,
    display: 'Space Mono',
    body: 'Plus Jakarta Sans',
    character: 'Monospace / Geometric Sans',
  },
] as const satisfies readonly FontCombination[]

export const colourCombinations = [
  {
    id: 0,
    name: 'HINC Base',
    background: '#F2EFE9',
    text: '#1A1A1A',
    accent: '#C41E1E',
    logoColour: '#C41E1E',
  },
  {
    id: 1,
    name: 'Sand + Navy + Amber',
    background: '#D4C88A',
    text: '#1B3A6B',
    accent: '#E07B20',
    logoColour: '#B3261E',
  },
  {
    id: 2,
    name: 'Periwinkle + Orange + Navy',
    background: '#C5CBE8',
    text: '#E07B20',
    accent: '#1B3A6B',
    logoColour: '#5A1E72',
  },
  {
    id: 3,
    name: 'Dark Brown + Cyan + Orange',
    background: '#3D2B1A',
    text: '#00C2C2',
    accent: '#E07B20',
    logoColour: '#F2EFE9',
  },
  {
    id: 4,
    name: 'Cool Grey + Mid-Grey + Orange',
    background: '#C8C8C8',
    text: '#6B6B6B',
    accent: '#E07B20',
    logoColour: '#1A1A1A',
  },
  {
    id: 5,
    name: 'Lilac + Lime Green',
    background: '#C4A8D4',
    text: '#7BC67B',
    accent: '#7BC67B',
    logoColour: '#4B146E',
  },
  {
    id: 6,
    name: 'Deep Navy + Amber',
    background: '#1E2D5E',
    text: '#E07B20',
    accent: '#E07B20',
    logoColour: '#00C2C2',
  },
  {
    id: 7,
    name: 'Terracotta + Cyan',
    background: '#D4907A',
    text: '#00C2C2',
    accent: '#00C2C2',
    logoColour: '#3D2B1A',
  },
  {
    id: 8,
    name: 'Sky Blue + Orange-Red',
    background: '#A8C8E8',
    text: '#D44020',
    accent: '#D44020',
    logoColour: '#1B3A6B',
  },
] as const satisfies readonly ColourCombination[]

export const caseCombinations = [
  {
    id: 0,
    name: 'Lowercase',
    textTransform: 'lowercase',
  },
  {
    id: 1,
    name: 'Original case',
    textTransform: 'none',
  },
  {
    id: 2,
    name: 'Uppercase',
    textTransform: 'uppercase',
  },
] as const satisfies readonly CaseCombination[]

export const getNextFontCombo = (current: FontComboIndex): FontComboIndex =>
  ((current + 1) % fontCombinations.length) as FontComboIndex

export const getNextColourCombo = (
  current: ColourComboIndex,
): ColourComboIndex => ((current + 1) % colourCombinations.length) as ColourComboIndex

export const getNextCaseCombo = (current: CaseComboIndex): CaseComboIndex =>
  ((current + 1) % caseCombinations.length) as CaseComboIndex
