import type { ZonesMap } from '@/types'
import { TOTAL_ZONES } from '@/types'

export function allZonesCompleted(zones: ZonesMap): boolean {
  for (let id = 1; id <= TOTAL_ZONES; id++) {
    const zone = zones[id]
    if (!zone || zone.status !== 'completed') return false
  }
  return true
}

export function completedCount(zones: ZonesMap): number {
  let count = 0
  for (let id = 1; id <= TOTAL_ZONES; id++) {
    if (zones[id]?.status === 'completed') count += 1
  }
  return count
}

export function progressPercent(zones: ZonesMap): number {
  return Math.round((completedCount(zones) / TOTAL_ZONES) * 100)
}
