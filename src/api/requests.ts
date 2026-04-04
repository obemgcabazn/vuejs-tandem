import { apiFetch } from '@/utils/apiFetch'
import { apiEndpoints } from './endpoints'
import type {
  ITopicResponse,
  ITaskResponse,
  IPublicRoomResponse,
  LeaderboardPayload,
  PostToLeaderboard,
} from '@/types/types'

const getBaseUrl = () => import.meta.env.VITE_API_URL

export async function getAllTopics(): Promise<ITopicResponse> {
  const response = await apiFetch(getBaseUrl() + apiEndpoints.topics.getAllTopics)
  if (!response.ok) {
    throw new Error('Failed to fetch topics')
  }
  const data: ITopicResponse = await response.json()
  return data
}

export async function getTopicById(id: string) {
  return apiFetch(getBaseUrl() + apiEndpoints.topics.getTopicById(id))
}

export async function getTasksByTopicId(id: string): Promise<ITaskResponse> {
  const response = await apiFetch(getBaseUrl() + apiEndpoints.topics.getTasksByTopicId(id))
  if (!response.ok) {
    throw new Error('Failed to fetch tasks')
  }
  const data: ITaskResponse = await response.json()
  return data
}

export interface JudgeAnswerPayload {
  taskId: string
  answer: string
}

export async function postToJudgeUsersAnswer(payload: JudgeAnswerPayload) {
  return apiFetch(getBaseUrl() + apiEndpoints.judgeUsersAnswer.postToJudgeUsersAnswer, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export async function getAllPublicRooms(): Promise<IPublicRoomResponse> {
  const response = await apiFetch(getBaseUrl() + apiEndpoints.game.getAllPublickRooms)
  if (!response.ok) {
    throw new Error('Failed to fetch public rooms')
  }
  const data: IPublicRoomResponse = await response.json()
  return data
}

export interface JudgeHintPayload {
  taskId: string
  currentAnswer: string
}

export async function postToJudgeForHint(payload: JudgeHintPayload) {
  return apiFetch(getBaseUrl() + apiEndpoints.judgeUsersAnswer.postToJudgeForHint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export async function patchUserName(name: string) {
  const response = await apiFetch(getBaseUrl() + apiEndpoints.users.patchMe, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) throw new Error('Failed to update name')
  const data = await response.json()
  return data.data ?? data
}

export async function patchUserAvatar(avatarUrl: string | null) {
  const response = await apiFetch(getBaseUrl() + apiEndpoints.users.patchMe, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatarUrl }),
  })
  if (!response.ok) throw new Error('Failed to update avatar')
  const data = await response.json()
  return data.data ?? data
}

export async function getLeaderboard(): Promise<LeaderboardPayload[]> {
  const response = await apiFetch(getBaseUrl() + apiEndpoints.leaderboard)
  if (!response.ok) throw new Error('Failed to fetch leaderboard')
  const data = await response.json()
  return data.data ?? data
}

export async function postToLeaderboard(payload: PostToLeaderboard) {
  return apiFetch(getBaseUrl() + apiEndpoints.leaderboard, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}
