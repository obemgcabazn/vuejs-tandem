import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestionTestComponent from '@/components/CabAndElectronics/questionTestComponent/questionTestComponent.vue'
import type { Question } from '@/types/types'

describe('QuestionTestComponent', () => {
  const baseQuestion: Question = {
    id: 1,
    question: 'Какой правильный ответ?',
    variants: ['A', 'B', 'C'],
    correct: 'B',
  }

  it('отображает текст вопроса и варианты', () => {
    const wrapper = mount(QuestionTestComponent, {
      props: {
        questionProperty: baseQuestion,
      },
    })

    expect(wrapper.text()).toContain(baseQuestion.question)
    baseQuestion.variants.forEach((variant) => {
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

    const correctIndex = baseQuestion.variants.indexOf(baseQuestion.correct)
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

    const wrongIndex = baseQuestion.variants.findIndex((v) => v !== baseQuestion.correct)
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
