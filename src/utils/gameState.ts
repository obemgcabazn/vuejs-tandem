import type { GameState, ZoneData } from '@/types'
import { TOTAL_ZONES } from '@/types'

function buildInitialZones(zoneNames: Record<number, string>): GameState['zones'] {
  const zones: GameState['zones'] = {}
  for (let id = 1; id <= TOTAL_ZONES; id++) {
    zones[id] = {
      id,
      name: zoneNames[id] ?? '',
      status: 'closed',
    }
  }
  return zones
}

export function createInitialGameState(zoneNames: Record<number, string>): GameState {
  return {
    zones: buildInitialZones(zoneNames),
    currentZoneId: null,
    conveyorModalShown: false,
    vasilkiCount: 2,
    errorCount: 1,
    overlayHidden: false,
  }
}

export function zoneCanBeClicked(zone: ZoneData): boolean {
  return zone.status === 'available'
}

export function zoneIsBlocked(zone: ZoneData): boolean {
  return zone.status === 'closed' || zone.status === 'in-progress' || zone.status === 'completed'
}
