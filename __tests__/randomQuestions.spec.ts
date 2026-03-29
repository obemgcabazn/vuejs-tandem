import { describe, it, expect, vi } from 'vitest'
import { randomQuestions } from '@/helpers/randomQuestions'
import type { Question } from '@/types/types'

describe('randomQuestions helper', () => {
  it('возвращает нужное количество вопросов из массива', () => {
    const questions: Question[] = [
      {
        id: 1,
        question: 'Q1',
        variants: ['A', 'B'],
        correct: 'A',
      },
      {
        id: 2,
        question: 'Q2',
        variants: ['A', 'B'],
        correct: 'B',
      },
      {
        id: 3,
        question: 'Q3',
        variants: ['A', 'B'],
        correct: 'A',
      },
      {
        id: 4,
        question: 'Q4',
        variants: ['A', 'B'],
        correct: 'B',
      },
    ]

    // детерминируем Math.random, чтобы избежать флаки-тестов
    const mockRandomValues = [0.1, 0.9, 0.3, 0.7]
    let callIndex = 0
    const randomSpy = vi
      .spyOn(Math, 'random')
      .mockImplementation(() => mockRandomValues[callIndex++ % mockRandomValues.length] ?? 0.5)

    const count = 2
    const result = randomQuestions(count, questions)

    expect(result).toHaveLength(count)
    // убеждаемся, что элементы из исходного массива
    for (const q of result) {
      expect(questions).toContain(q)
    }

    randomSpy.mockRestore()
  })

  it('не падает, если count больше длины массива', () => {
    const questions: Question[] = [
      {
        id: 1,
        question: 'Q1',
        variants: ['A', 'B'],
        correct: 'A',
      },
    ]

    const result = randomQuestions(10, questions)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(questions[0])
  })
})
