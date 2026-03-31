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
  avatarUrl?: string | null
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

export interface ITopicData {
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
  options: string[] | null
  order: number
  title: string
  topicId: string
  type: string
  userSubmission: null
  xpReward: number
}

// export interface Room {
//   id: string
//   hostId: string
//   members: Map<string, RoomMember>
//   isPrivate: boolean // NEW
//   status: 'waiting' | 'in_progress' | 'finished'
//   topicId: string | null
//   currentTaskIndex: number
//   createdAt: Date
//   lastActivityAt: Date
// }

export interface IPublicRoomResponse {
  data: IPublicRoomDto[]
  timestamp: string
}

export interface IPublicRoomDto {
  id: string
  hostName: string
  topicId: string | null
  memberCount: number
  maxMembers: 6
  status: RoomStatus
  createdAt: Date
}

export type RoomStatus = 'waiting' | 'in_progress' | 'finished'

export interface IRoomMember {
  userId: string
  name: string
  score: number
  ready: boolean
  rank: number
}

export interface IRoomResponse {
  roomId: string
  status: RoomStatus
  hostId: string
  topicId: string
  members: IRoomMember[]
}
export interface IRoom {
  roomId: string
  hostName: string
  topicId: string | null
  memberCount: number
  maxMembers: number
  status: RoomStatus
}
export interface RoomCreatedEvent {
  roomId: string
  hostName: string // email/name создателя
  topicId: string | null
  membersCount: number // всегда 1 при создании
}

export interface IGameTask {
  task: ITask
  taskIndex: number
  totalTasks: number
}

export interface ITask {
  description: string
  id: string
  timeLimit: number
  title: string
  type: string
}

export interface ITaskCompleted {
  taskId: string
  scores: ITaskCompletedScore[]
}

export interface ITaskCompletedScore {
  userId: string
  name: string
  score: number
  totalScore: number
}

export interface ITaskFinishedScore extends ITaskCompletedScore {
  rank: number
}
