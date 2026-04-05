import { beforeEach, describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import QuestionTestComponent from '@/components/CabAndElectronics/questionTestComponent/questionTestComponent.vue'
import type { ITask } from '@/types/types'

const { addVasilkiMock, addErrorMock, postToJudgeUsersAnswerMock, postToJudgeForHintMock } =
  vi.hoisted(() => ({
    addVasilkiMock: vi.fn(),
    addErrorMock: vi.fn(),
    postToJudgeUsersAnswerMock: vi.fn(),
    postToJudgeForHintMock: vi.fn(),
  }))

vi.mock('@/stores/game', () => ({
  useGameStore: () => ({
    addVasilki: addVasilkiMock,
    addError: addErrorMock,
  }),
}))

vi.mock('@/api/requests', () => ({
  postToJudgeUsersAnswer: postToJudgeUsersAnswerMock,
  postToJudgeForHint: postToJudgeForHintMock,
}))

describe('QuestionTestComponent', () => {
  const baseQuestion: ITask = {
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
    timeLimit: 60,
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
    const options = baseQuestion.options ?? []
    options.forEach((variant) => {
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
    // Ошибка учитывается в родителе (CabAndElectronics) через addError; компонент только эмитит событие
    expect(wrapper.emitted('incorrectAnswer')).toHaveLength(1)
  })
})
