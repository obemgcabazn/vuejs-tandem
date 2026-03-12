export const questions = [
  {
    id: 1,
    question: 'Что такое JavaScript?',
    variants: [
      'Язык программирования',
      'Фреймворк',
      'Библиотека',
      'Система управления базами данных',
    ],
    correct: 'Язык программирования',
  },
  {
    id: 2,
    question: 'Какой оператор используется для присваивания значения?',
    variants: ['==', '=', '===', '=>'],
    correct: '=',
  },
  {
    id: 3,
    question: 'Что такое замыкание?',
    variants: ['Функция внутри функции', 'Объект', 'Массив', 'Строка'],
    correct: 'Функция внутри функции',
  },
  {
    id: 4,
    question: 'Что возвращает метод String.prototype.charAt()?',
    variants: ['Первая буква строки', 'Длину строки', 'Массив букв', 'Последнюю букву строки'],
    correct: 'Первая буква строки',
  },
  {
    id: 5,
    question: 'Какой метод используется для добавления элемента в конец массива?',
    variants: ['push()', 'pop()', 'shift()', 'unshift()'],
    correct: 'push()',
  },
  {
    id: 6,
    question: 'Какой символ используется для комментариев в JavaScript?',
    variants: ['//', '/*', '<!--', '\\'],
    correct: '//',
  },
  {
    id: 7,
    question: 'Что такое объект в JavaScript?',
    variants: ['Тип данных', 'Метод', 'Переменная', 'Функция'],
    correct: 'Тип данных',
  },
  {
    id: 8,
    question: 'Какой метод используется для преобразования массива в строку?',
    variants: ['join()', 'split()', 'toString()', 'concat()'],
    correct: 'join()',
  },
  {
    id: 9,
    question: "Что означает 'NaN' в JavaScript?",
    variants: ['Не число', 'Ошибка', 'Состояние', 'Проблема'],
    correct: 'Не число',
  },
  {
    id: 10,
    question: 'Какой оператор используется для сравнения значений без учета типа?',
    variants: ['==', '===', '!==', '!='],
    correct: '==',
  },
  {
    id: 11,
    question: 'Что такое Promises?',
    variants: ['Асинхронный объект', 'Тип данных', 'Метод', 'Цикл'],
    correct: 'Асинхронный объект',
  },
  {
    id: 12,
    question: 'Какой метод позволяет обрабатывать массивы в JavaScript?',
    variants: ['forEach()', 'handle()', 'process()', 'execute()'],
    correct: 'forEach()',
  },
  {
    id: 13,
    question: 'Какой оператор используется для проверки типа данных?',
    variants: ['typeof', 'instanceof', 'is', 'check'],
    correct: 'typeof',
  },
  {
    id: 14,
    question: 'Какой метод массивов возвращает последний элемент массива?',
    variants: ['pop()', 'slice()', 'shift()', 'splice()'],
    correct: 'pop()',
  },
  {
    id: 15,
    question: 'Как объявить переменную с использованием let?',
    variants: ['let x = 5;', 'var x = 5;', 'const x = 5;', 'x = 5;'],
    correct: 'let x = 5;',
  },
  {
    id: 16,
    question: 'Что делает метод JSON.stringify()?',
    variants: [
      'Преобразует объект в строку',
      'Преобразует строку в объект',
      'Считывает JSON',
      'Записывает JSON',
    ],
    correct: 'Преобразует объект в строку',
  },
]

export const taskForCode = [
  'seatbelt',
  'wrench',
  'windshield',
  'screw',
  'headlight',
  'steering',
  'gearbox',
  'sunvisor',
]
