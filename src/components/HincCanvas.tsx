'use client'

import { useCallback, useEffect, useState } from 'react'
import CanvasStage from '@/components/canvas/CanvasStage'
import InteractionBar from '@/components/toolbar/InteractionBar'
import NavigationBar, { navigationTargets } from '@/components/toolbar/NavigationBar'
import SurveyOverlay from '@/components/survey/SurveyOverlay'
import { assets } from '@/lib/assets'
import { CanvasStoreProvider, useCanvasStore } from '@/lib/canvasStore'
import { generateLayout } from '@/lib/layoutEngine'
import { getNextCaseCombo, getNextColourCombo, getNextFontCombo } from '@/lib/themes'
import { zones, type ZoneId } from '@/lib/zones'

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return isMobile
}

function HincCanvasInner() {
  const { state, dispatch } = useCanvasStore()
  const isMobile = useIsMobile()
  const [canvasVersion] = useState(0)
  const [homeViewKey, setHomeViewKey] = useState(0)
  const [activeNavigationTargetId, setActiveNavigationTargetId] = useState<string>(
    navigationTargets[0].id,
  )
  const navigationTargetIds = navigationTargets.map((target) => target.id)
  const layoutSignature = assets
    .map((asset) =>
      [
        asset.id,
        asset.width,
        asset.height,
        'fixedPlacement' in asset ? asset.fixedPlacement.x : '',
        'fixedPlacement' in asset ? asset.fixedPlacement.y : '',
      ].join(':'),
    )
    .join('|')

  useEffect(() => {
    dispatch({ type: 'set-layout', layout: generateLayout(zones, assets) })
  }, [dispatch, layoutSignature])

  useEffect(() => {
    document.documentElement.dataset.font = String(state.fontCombo)
    document.documentElement.dataset.colour = String(state.colourCombo)
    document.documentElement.dataset.case = String(state.caseCombo)
  }, [state.caseCombo, state.colourCombo, state.fontCombo])

  const clearPanTarget = useCallback(() => {
    dispatch({ type: 'set-pan-target', zoneId: null })
  }, [dispatch])
  const clearFocusTarget = useCallback(() => {
    dispatch({ type: 'set-focus-target', id: null })
  }, [dispatch])
  const handleReturnHome = useCallback(() => {
    dispatch({ type: 'set-panned-out', value: false })
    dispatch({ type: 'set-pan-target', zoneId: null })
    dispatch({ type: 'set-focus-target', id: null })
    dispatch({ type: 'set-zoom', zoom: 1 })
    setHomeViewKey((key) => key + 1)
  }, [dispatch])
  const handleZoomChange = useCallback(
    (zoom: number) => {
      dispatch({ type: 'set-panned-out', value: false })
      dispatch({ type: 'set-zoom', zoom })
    },
    [dispatch],
  )
  const handleNavigateToAsset = useCallback(
    (id: string) => {
      setActiveNavigationTargetId(id)
      dispatch({ type: 'set-focus-target', id })
    },
    [dispatch],
  )

  return (
    <>
      <CanvasStage
        layout={state.layout}
        erasedIds={state.erasedIds}
        activeTool={state.activeTool}
        colourCombo={state.colourCombo}
        zoom={state.zoom}
        isPannedOut={state.isPannedOut}
        panTarget={state.panTarget}
        focusTarget={state.focusTarget}
        trackedAssetIds={navigationTargetIds}
        isMobile={isMobile}
        homeViewKey={homeViewKey}
        onZoomChange={handleZoomChange}
        onPanComplete={clearPanTarget}
        onFocusComplete={clearFocusTarget}
        onNearestAssetChange={setActiveNavigationTargetId}
        onNavigateZone={(zoneId: ZoneId) => dispatch({ type: 'set-pan-target', zoneId })}
        resetKey={canvasVersion}
      />
      <NavigationBar
        zoom={state.zoom}
        activeTargetId={activeNavigationTargetId}
        onPanOut={handleReturnHome}
        onZoomChange={handleZoomChange}
        onNavigateToAsset={handleNavigateToAsset}
        onSurveyOpen={() => dispatch({ type: 'set-survey-open', value: true })}
      />
      <InteractionBar
        activeTool={state.activeTool}
        fontCombo={state.fontCombo}
        colourCombo={state.colourCombo}
        caseCombo={state.caseCombo}
        snapPosition={state.toolbarSnap}
        isMobile={isMobile}
        onToolChange={(tool) => dispatch({ type: 'set-active-tool', tool })}
        onFontChange={() =>
          dispatch({
            type: 'set-font-combo',
            index: getNextFontCombo(state.fontCombo),
          })
        }
        onColourChange={() =>
          dispatch({
            type: 'set-colour-combo',
            index: getNextColourCombo(state.colourCombo),
          })
        }
        onCaseChange={() =>
          dispatch({
            type: 'set-case-combo',
            index: getNextCaseCombo(state.caseCombo),
          })
        }
        onSnapChange={(position) =>
          dispatch({ type: 'set-toolbar-snap', position })
        }
      />
      <SurveyOverlay
        isOpen={state.surveyOpen}
        onClose={() => dispatch({ type: 'set-survey-open', value: false })}
      />
    </>
  )
}

export default function HincCanvas() {
  return (
    <CanvasStoreProvider>
      <HincCanvasInner />
    </CanvasStoreProvider>
  )
}
