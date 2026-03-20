import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestionTestComponent from '@/components/CabAndElectronics/questionTestComponent/questionTestComponent.vue'
import type { ITaskResponse } from '@/types/types'

describe('QuestionTestComponent', () => {
  const baseQuestion: ITaskResponse = {
    id: '1',
    description: 'Описание вопроса',
    title: 'Какой правильный ответ?',
    options: ['A', 'B', 'C'],
    difficulty: 'easy',
    order: 1,
    topicId: 'topic-1',
    type: 'single-choice',
    userSubmission: null,
    xpReward: 1,
  }

  it('отображает текст вопроса и варианты', () => {
    const wrapper = mount(QuestionTestComponent, {
      props: {
        questionProperty: baseQuestion,
      },
    })

    expect(wrapper.text()).toContain(baseQuestion.title)
    baseQuestion.options.forEach((variant) => {
      expect(wrapper.text()).toContain(variant)
    })
  })

  it('эмитит correctAnswer при выборе правильного ответа', async () => {
    vi.useFakeTimers()

    const wrapper = mount(QuestionTestComponent, {
      props: {
        questionProperty: baseQuestion,
      },
    })

    const correctIndex = baseQuestion.options.indexOf('B')
    expect(correctIndex).toBeGreaterThanOrEqual(0)
    const variantNodes = wrapper.findAll('.variant-text')
    const correctNode = variantNodes[correctIndex]
    expect(correctNode).toBeDefined()
    await correctNode!.trigger('click')

    await wrapper.find('button').trigger('click')

    // сразу после клика должен появиться текст "Верно!"
    expect(wrapper.text()).toContain('Верно!')

    // событие correctAnswer эмитится через setTimeout
    await vi.runAllTimersAsync()

    expect(wrapper.emitted('correctAnswer')).toBeTruthy()
    // сообщение должно очиститься после таймера
    expect(wrapper.text()).not.toContain('Верно!')

    vi.useRealTimers()
  })

  it('эмитит incorrectAnswer при выборе неправильного ответа', async () => {
    const wrapper = mount(QuestionTestComponent, {
      props: {
        questionProperty: baseQuestion,
      },
    })

    const wrongIndex = baseQuestion.options.findIndex((v) => v !== 'B')
    expect(wrongIndex).toBeGreaterThanOrEqual(0)
    const variantNodes = wrapper.findAll('.variant-text')
    const wrongNode = variantNodes[wrongIndex]
    expect(wrongNode).toBeDefined()
    await wrongNode!.trigger('click')

    await wrapper.find('button').trigger('click')

    expect(wrapper.text()).toContain('Неверно!')
    expect(wrapper.emitted('incorrectAnswer')).toBeTruthy()
  })
})
