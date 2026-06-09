'use client'

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { ProductId } from './assets'
import type { AssetPlacement } from './layoutEngine'
import type { CaseComboIndex, ColourComboIndex, FontComboIndex } from './themes'
import type { ZoneId } from './zones'

export type ActiveTool = 'select' | 'erase' | null
export type SnapPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface CanvasState {
  layout: AssetPlacement[]
  erasedIds: Set<string>
  activeTool: ActiveTool
  fontCombo: FontComboIndex
  colourCombo: ColourComboIndex
  caseCombo: CaseComboIndex
  toolbarSnap: SnapPosition
  isPannedOut: boolean
  surveyOpen: boolean
  panTarget: ZoneId | null
  focusTarget: string | null
  zoom: number
}

export type CanvasAction =
  | { type: 'set-layout'; layout: AssetPlacement[] }
  | { type: 'reset-session'; layout: AssetPlacement[]; zoom: number }
  | { type: 'erase-asset'; id: string }
  | { type: 'set-active-tool'; tool: ActiveTool }
  | { type: 'set-font-combo'; index: FontComboIndex }
  | { type: 'set-colour-combo'; index: ColourComboIndex }
  | { type: 'set-case-combo'; index: CaseComboIndex }
  | { type: 'set-toolbar-snap'; position: SnapPosition }
  | { type: 'set-panned-out'; value: boolean }
  | { type: 'set-survey-open'; value: boolean }
  | { type: 'set-pan-target'; zoneId: ZoneId | null }
  | { type: 'set-focus-target'; id: string | null }
  | { type: 'navigate-product'; productId: ProductId }
  | { type: 'set-zoom'; zoom: number }

const initialState: CanvasState = {
  layout: [],
  erasedIds: new Set<string>(),
  activeTool: null,
  fontCombo: 0,
  colourCombo: 0,
  caseCombo: 0,
  toolbarSnap: 'top-right',
  isPannedOut: false,
  surveyOpen: false,
  panTarget: null,
  focusTarget: null,
  zoom: 1,
}

const productZoneMap: Record<ProductId, ZoneId> = {
  vanly: 'products',
  laerly: 'products',
  budge: 'products',
  revamp: 'products',
}

const reducer = (state: CanvasState, action: CanvasAction): CanvasState => {
  switch (action.type) {
    case 'set-layout':
      return { ...state, layout: action.layout }
    case 'reset-session':
      return {
        ...state,
        layout: action.layout,
        erasedIds: new Set<string>(),
        activeTool: null,
        isPannedOut: false,
        panTarget: null,
        focusTarget: null,
        zoom: action.zoom,
      }
    case 'erase-asset': {
      const erasedIds = new Set(state.erasedIds)
      erasedIds.add(action.id)
      return { ...state, erasedIds }
    }
    case 'set-active-tool':
      return { ...state, activeTool: action.tool }
    case 'set-font-combo':
      return { ...state, fontCombo: action.index }
    case 'set-colour-combo':
      return { ...state, colourCombo: action.index }
    case 'set-case-combo':
      return { ...state, caseCombo: action.index }
    case 'set-toolbar-snap':
      return { ...state, toolbarSnap: action.position }
    case 'set-panned-out':
      return { ...state, isPannedOut: action.value }
    case 'set-survey-open':
      return { ...state, surveyOpen: action.value }
    case 'set-pan-target':
      return { ...state, panTarget: action.zoneId, isPannedOut: false }
    case 'set-focus-target':
      return { ...state, focusTarget: action.id, isPannedOut: false }
    case 'navigate-product':
      return { ...state, panTarget: productZoneMap[action.productId] }
    case 'set-zoom':
      return { ...state, zoom: action.zoom }
  }
}

const CanvasStoreContext = createContext<
  { state: CanvasState; dispatch: Dispatch<CanvasAction> } | undefined
>(undefined)

export function CanvasStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(() => ({ state, dispatch }), [state])

  return (
    <CanvasStoreContext.Provider value={value}>
      {children}
    </CanvasStoreContext.Provider>
  )
}

export const useCanvasStore = () => {
  const context = useContext(CanvasStoreContext)
  if (!context) {
    throw new Error('useCanvasStore must be used within CanvasStoreProvider')
  }
  return context
}
