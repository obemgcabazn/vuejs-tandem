export type ZoneStatus = 'closed' | 'available' | 'in-progress' | 'completed'

export interface ZoneData {
  id: number
  name: string
  status: ZoneStatus
}

export type ZonesMap = Record<number, ZoneData>

export interface GameState {
  zones: ZonesMap
  currentZoneId: number | null
  conveyorModalShown: boolean
  vasilkiCount: number
  errorCount: number
  overlayHidden: boolean
}

export interface ZonePath {
  zoneId: number
  pathD: string
  labelX: number
  labelY: number
}

export const ZONE_PATHS: ZonePath[] = [
  {
    zoneId: 1,
    pathD: 'M 0 323 L 800 323 L 800 516 L 0 516 Z',
    labelX: 400,
    labelY: 425,
  },
  {
    zoneId: 2,
    pathD: 'M 350 194 L 800 194 L 800 323 L 350 323 Z',
    labelX: 575,
    labelY: 258,
  },
  {
    zoneId: 3,
    pathD: 'M 350 0 L 800 0 L 800 194 L 350 194 Z',
    labelX: 575,
    labelY: 97,
  },
  {
    zoneId: 4,
    pathD: 'M 0 0 L 350 0 L 350 323 L 0 323 Z',
    labelX: 175,
    labelY: 161,
  },
]

export interface Question {
  id: number
  question: string
  variants: Array<string>
  correct: string
}

export const TOTAL_ZONES = 4
export const MAX_VASILKI = 5
export const MAX_ERRORS = 2

export type User = {
  email: string
  name?: string
  password?: string
  role?: 'user'
  createdAt?: string
  id?: string
  avatarUrl?: string
}

export interface ITaskResponse {
  timestamp: string
  data: ITask[]
}

export interface ITopicResponse {
  data: {
    data: ITopicData[]
    total: number
    page: number
    limit: number
  }
}

export enum ETopics {
  JavaScript_Fundamentals = 'JavaScript_Fundamentals',
  TypeScript_Basics = 'TypeScript_Basics',
}

interface ITopicData {
  id: string
  title: string
  description: string
  order: number
  tasksTotal: number
  userProgress: number | null
}
export interface ITask {
  description: string
  difficulty: string
  id: string
  options: string[]
  order: number
  title: string
  topicId: string
  type: string
  userSubmission: null
  xpReward: number
}
