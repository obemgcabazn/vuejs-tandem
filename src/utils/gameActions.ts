import type { GameState, ZonesMap } from '@/types'
import { TOTAL_ZONES } from '@/types'
import { createInitialGameState, zoneCanBeClicked } from './gameState'
import { allZonesCompleted } from './zones'

export function applyStart(prev: GameState): GameState {
  const zones: ZonesMap = { ...prev.zones }
  const z1 = zones[1]
  if (z1) {
    zones[1] = { ...z1, status: 'available' }
  }
  return { ...prev, zones }
}

export function applyZoneInProgress(prev: GameState, zoneId: number): GameState | null {
  const zone = prev.zones[zoneId]
  if (!zone || !zoneCanBeClicked(zone)) return null
  const zones: ZonesMap = { ...prev.zones }
  zones[zoneId] = { ...zone, status: 'in-progress' }
  return { ...prev, zones, currentZoneId: zoneId }
}

export function applyZoneCompleted(prev: GameState, zoneId: number): GameState {
  const zones: ZonesMap = { ...prev.zones }
  const zone = zones[zoneId]
  if (!zone) return prev
  zones[zoneId] = { ...zone, status: 'completed' }
  if (zoneId < TOTAL_ZONES) {
    const nextZone = zones[zoneId + 1]
    if (nextZone) {
      zones[zoneId + 1] = { ...nextZone, status: 'available' }
    }
  }
  const next = { ...prev, zones, currentZoneId: null }
  if (allZonesCompleted(next.zones)) {
    next.conveyorModalShown = true
  }
  return next
}

export function applyReset(zoneNames: Record<number, string>): GameState {
  return createInitialGameState(zoneNames)
}

export function applyCloseConveyor(prev: GameState): GameState {
  return { ...prev, conveyorModalShown: false }
}

export function applyHideOverlay(prev: GameState): GameState {
  return { ...prev, overlayHidden: true }
}
