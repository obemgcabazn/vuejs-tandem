export function randomQuestions<T>(count: number, questions: T[]): T[] {
  return questions.sort(() => Math.random() - 0.5).slice(0, count)
}
