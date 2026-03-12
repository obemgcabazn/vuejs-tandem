import OpenAI from 'openai'

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-OpenRouter-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
  },
})

export async function openrouterRequest(message: string) {
  const completion = await openai.chat.completions.create({
    model: 'openai/gpt-5.2',
    messages: [
      {
        role: 'user',
        content: message,
      },
    ],
  })

  return completion?.choices[0].message.content
}

export function textRequest(question: string, userMessage: string) {
  return `Есть вопрос: ${question}.Пользователю нужно кратко в 2-3 предложения ответить на вопрос и ответ пользователя: ${userMessage}. Напиши верно ли ответил пользователь на вопрос и если скорее всего нет, то напиши почему и как нужно ответить на вопрос и послединм словом напиши false, если верно, дай комментарий по поводу его ответа и послединм словом напиши true`
}
