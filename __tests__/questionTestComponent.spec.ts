import { beforeEach, describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import QuestionTestComponent from '@/components/CabAndElectronics/questionTestComponent/questionTestComponent.vue'
import type { ITaskResponse } from '@/types/types'

const {
  addVasilkiMock,
  addErrorMock,
  setErrorMock,
  postToJudgeUsersAnswerMock,
  postToJudgeForHintMock,
} = vi.hoisted(() => ({
  addVasilkiMock: vi.fn(),
  addErrorMock: vi.fn(),
  setErrorMock: vi.fn(),
  postToJudgeUsersAnswerMock: vi.fn(),
  postToJudgeForHintMock: vi.fn(),
}))

vi.mock('@/stores/game', () => ({
  useGameStore: () => ({
    addVasilki: addVasilkiMock,
    addError: addErrorMock,
    setError: setErrorMock,
  }),
}))

vi.mock('@/api/requests', () => ({
  postToJudgeUsersAnswer: postToJudgeUsersAnswerMock,
  postToJudgeForHint: postToJudgeForHintMock,
}))

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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('показывает ошибку, если ответ не выбран', async () => {
    const wrapper = mount(QuestionTestComponent, {
      props: {
        questionProperty: baseQuestion,
      },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('Выберите вариант ответа')
    expect(postToJudgeUsersAnswerMock).not.toHaveBeenCalled()
  })

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

  it('показывает успех после успешной проверки', async () => {
    postToJudgeUsersAnswerMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          score: 100,
          feedback: 'Верно!',
          zoneProgress: { vasilkiCount: 2, errorCount: 0 },
        },
      }),
    })

    const wrapper = mount(QuestionTestComponent, {
      props: {
        questionProperty: baseQuestion,
      },
    })

    const variantNodes = wrapper.findAll('.variant-text')
    await variantNodes[1]!.trigger('click')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Верно!')
    expect(addVasilkiMock).toHaveBeenCalled()
  })

  it('показывает подсказку при неверном ответе', async () => {
    postToJudgeUsersAnswerMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          score: 10,
          feedback: 'Неверно!',
          zoneProgress: { vasilkiCount: 0, errorCount: 1 },
        },
      }),
    })
    postToJudgeForHintMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          hint: 'Подумай о let и const',
        },
      }),
    })

    const wrapper = mount(QuestionTestComponent, {
      props: {
        questionProperty: baseQuestion,
      },
    })

    const variantNodes = wrapper.findAll('.variant-text')
    await variantNodes[0]!.trigger('click')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Подсказка:')
    expect(setErrorMock).toHaveBeenCalledWith(1)
  })
})
