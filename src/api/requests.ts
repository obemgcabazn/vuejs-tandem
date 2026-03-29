import { apiFetch } from '@/utils/apiFetch'
import { apiEndpoints } from './endpoints'
import type { ITopicResponse, ITaskResponse } from '@/types/types'

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
