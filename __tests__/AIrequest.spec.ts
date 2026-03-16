import { describe, it, expect } from 'vitest'
import { textRequest } from '@/open AI Requests/openrouter.request'

describe('textRequest', () => {
  it('подставляет вопрос и ответ пользователя в шаблон', () => {
    const question = 'Что такое Vue.js?'
    const userMessage = 'Это фреймворк для создания пользовательских интерфейсов.'

    const result = textRequest(question, userMessage)

    expect(result).toContain(`Есть вопрос: ${question}.`)
    expect(result).toContain(`ответ пользователя: ${userMessage}`)
  })

  it('содержит указание на формат проверки ответа', () => {
    const result = textRequest('Q', 'A')

    expect(result).toContain('Напиши верно ли ответил пользователь на вопрос')
    expect(result).toContain('послединм словом напиши false')
    expect(result).toContain('послединм словом напиши true')
  })
})
