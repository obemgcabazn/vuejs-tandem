import { describe, it, expect } from 'vitest'
import { allZonesCompleted, completedCount, progressPercent } from '@/utils/zones'
import type { ZonesMap } from '@/types'

function makeZones(
  statuses: Record<number, 'closed' | 'available' | 'in-progress' | 'completed'>,
): ZonesMap {
  const zones: ZonesMap = {}
  for (const [id, status] of Object.entries(statuses)) {
    zones[Number(id)] = {
      id: Number(id),
      name: `Zone ${id}`,
      status,
    }
  }
  return zones
}

describe('zones utils', () => {
  it('allZonesCompleted returns false when not all completed', () => {
    const zones = makeZones({
      1: 'completed',
      2: 'completed',
      3: 'available',
      4: 'closed',
    })
    expect(allZonesCompleted(zones)).toBe(false)
  })

  it('allZonesCompleted returns true when all four completed', () => {
    const zones = makeZones({
      1: 'completed',
      2: 'completed',
      3: 'completed',
      4: 'completed',
    })
    expect(allZonesCompleted(zones)).toBe(true)
  })

  it('progressPercent returns 0 when no zones completed', () => {
    const zones = makeZones({
      1: 'closed',
      2: 'closed',
      3: 'closed',
      4: 'closed',
    })
    expect(progressPercent(zones)).toBe(0)
  })

  it('progressPercent returns 100 when all completed', () => {
    const zones = makeZones({
      1: 'completed',
      2: 'completed',
      3: 'completed',
      4: 'completed',
    })
    expect(progressPercent(zones)).toBe(100)
  })

  it('completedCount counts only completed zones', () => {
    const zones = makeZones({
      1: 'completed',
      2: 'in-progress',
      3: 'completed',
      4: 'closed',
    })
    expect(completedCount(zones)).toBe(2)
  })
})
