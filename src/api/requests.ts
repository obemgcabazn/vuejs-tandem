import { apiFetch } from '@/utils/apiFetch'
import { apiEndpoints } from './endpoints'

const getBaseUrl = () => import.meta.env.VITE_API_URL

export async function getAllTopics() {
  return apiFetch(getBaseUrl() + apiEndpoints.topics.getAllTopics)
}

export async function getTopicById(id: string) {
  return apiFetch(getBaseUrl() + apiEndpoints.topics.getTopicById(id))
}

export async function getTasksByTopicId(id: string) {
  return apiFetch(getBaseUrl() + apiEndpoints.topics.getTasksByTopicId(id))
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
