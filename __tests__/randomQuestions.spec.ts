import { describe, it, expect, vi } from 'vitest'
import { randomQuestions } from '@/helpers/randomQuestions'
import type { ITask } from '@/types/types'

describe('randomQuestions helper', () => {
  it('возвращает нужное количество вопросов из массива', () => {
    const questions: ITask[] = [
      {
        id: '1',
        topicId: '813f9901-ed98-4729-83b4-65270f8d8dd9',
        title: 'Напишите функцию sum',
        description:
          'Напишите функцию `sum(a, b)`, которая принимает два числа и возвращает их сумму.\n\nПример:\n```js\nsum(2, 3) // 5\nsum(-1, 4) // 3\n```',
        type: 'code',
        difficulty: 'easy',
        xpReward: 15,
        order: 30,
        options: null,
        userSubmission: null,
      },
      {
        id: '2',
        topicId: '813f9901-ed98-4729-83b4-65270f8d8dd9',
        title: 'Напишите функцию sum',
        description:
          'Напишите функцию `sum(a, b)`, которая принимает два числа и возвращает их сумму.\n\nПример:\n```js\nsum(2, 3) // 5\nsum(-1, 4) // 3\n```',
        type: 'code',
        difficulty: 'easy',
        xpReward: 15,
        order: 31,
        options: null,
        userSubmission: null,
      },
      {
        id: '3',
        topicId: '813f9901-ed98-4729-83b4-65270f8d8dd9',
        title: 'Напишите функцию sum',
        description:
          'Напишите функцию `sum(a, b)`, которая принимает два числа и возвращает их сумму.\n\nПример:\n```js\nsum(2, 3) // 5\nsum(-1, 4) // 3\n```',
        type: 'code',
        difficulty: 'easy',
        xpReward: 15,
        order: 32,
        options: null,
        userSubmission: null,
      },
      {
        id: '4',
        topicId: '813f9901-ed98-4729-83b4-65270f8d8dd9',
        title: 'Напишите функцию sum',
        description:
          'Напишите функцию `sum(a, b)`, которая принимает два числа и возвращает их сумму.\n\nПример:\n```js\nsum(2, 3) // 5\nsum(-1, 4) // 3\n```',
        type: 'code',
        difficulty: 'easy',
        xpReward: 15,
        order: 33,
        options: null,
        userSubmission: null,
      },
    ]

    //устанавливаем значение Math.random для теста
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
    const questions: ITask[] = [
      {
        id: '3',
        topicId: '813f9901-ed98-4729-83b4-65270f8d8dd9',
        title: 'Напишите функцию sum',
        description:
          'Напишите функцию `sum(a, b)`, которая принимает два числа и возвращает их сумму.\n\nПример:\n```js\nsum(2, 3) // 5\nsum(-1, 4) // 3\n```',
        type: 'code',
        difficulty: 'easy',
        xpReward: 15,
        order: 31,
        options: null,
        userSubmission: null,
      },
    ]

    const result = randomQuestions(10, questions)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(questions[0])
  })
})
