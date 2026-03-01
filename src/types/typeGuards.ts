import type { ZoneData, ZoneStatus, ZonesMap } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isZoneStatus(value: unknown): value is ZoneStatus {
  return (
    typeof value === 'string' &&
    (value === 'closed' ||
      value === 'available' ||
      value === 'in-progress' ||
      value === 'completed')
  )
}

export function isZoneData(value: unknown): value is ZoneData {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'number' && typeof value.name === 'string' && isZoneStatus(value.status)
  )
}

export function isZonesMap(value: unknown): value is ZonesMap {
  if (!isRecord(value)) return false
  return Object.values(value).every(isZoneData)
}
