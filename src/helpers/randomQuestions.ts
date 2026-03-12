import type { Question } from '@/types/types'
export function randomQuestions(count: number, questions: Question[]) {
  return questions.sort(() => Math.random() - 0.5).slice(0, count)
}
