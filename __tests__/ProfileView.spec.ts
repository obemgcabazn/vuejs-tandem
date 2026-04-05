import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import ProfileView from '@/views/ProfileView.vue'

const { apiFetchMock, patchUserNameMock, patchUserAvatarMock, getLeaderboardMock } = vi.hoisted(
  () => ({
    apiFetchMock: vi.fn(),
    patchUserNameMock: vi.fn(),
    patchUserAvatarMock: vi.fn(),
    getLeaderboardMock: vi.fn(),
  }),
)

vi.mock('@/utils', () => ({
  apiFetch: apiFetchMock,
}))

vi.mock('@/api/requests', () => ({
  patchUserName: patchUserNameMock,
  patchUserAvatar: patchUserAvatarMock,
  getLeaderboard: getLeaderboardMock,
}))

// --- Тестовые данные ---

type MockProfile = {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  avatarUrl: string | null
}

const mockProfile: MockProfile = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: '2024-01-01T00:00:00.000Z',
  avatarUrl: null,
}

const mockStats = { totalGames: 5, totalPoints: 200 }

const mockProgress = [
  {
    topicId: 'topic-1',
    topicTitle: 'JavaScript Basics',
    totalTasks: 10,
    completedTasks: 7,
    percentage: 70,
  },
  {
    topicId: 'topic-2',
    topicTitle: 'Vue.js',
    totalTasks: 8,
    completedTasks: 2,
    percentage: 25,
  },
]

const mockLeaderboard = [
  {
    id: 'lb-1',
    userId: 'user-2',
    userEmail: 'other@example.com',
    points: 500,
    gameDate: '2024-03-01T00:00:00.000Z',
  },
  {
    id: 'lb-2',
    userId: 'user-1',
    userEmail: 'test@example.com',
    points: 300,
    gameDate: '2024-03-02T00:00:00.000Z',
  },
]

function setupMocks(profileOverride: Partial<typeof mockProfile> = {}) {
  const profile = { ...mockProfile, ...profileOverride }

  apiFetchMock.mockImplementation((url: string) => {
    if (url.includes('/auth/me'))
      return Promise.resolve({ ok: true, json: async () => ({ data: profile }) })
    if (url.includes('/users/me/stats'))
      return Promise.resolve({ ok: true, json: async () => ({ data: mockStats }) })
    if (url.includes('/users/me/progress'))
      return Promise.resolve({ ok: true, json: async () => ({ data: mockProgress }) })
    return Promise.resolve({ ok: false, json: async () => ({}) })
  })

  getLeaderboardMock.mockResolvedValue(mockLeaderboard)
}

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  // --- Состояния загрузки / ошибки ---

  it('показывает loading сразу после монтирования', async () => {
    apiFetchMock.mockReturnValue(new Promise(() => {})) // зависший промис
    getLeaderboardMock.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(ProfileView)
    await nextTick() // ждём обновления DOM после loading.value = true
    expect(wrapper.text()).toContain('Загрузка...')
  })

  it('показывает сообщение об ошибке, если API недоступен', async () => {
    apiFetchMock.mockRejectedValue(new Error('Network error'))
    getLeaderboardMock.mockResolvedValue([])
    const wrapper = mount(ProfileView)
    await flushPromises()
    expect(wrapper.text()).toContain('Не удалось загрузить данные профиля')
  })

  it('скрывает loading после загрузки', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    expect(wrapper.text()).not.toContain('Loading...')
  })

  // --- Отображение данных профиля ---

  it('отображает имя в input и email пользователя', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    // имя хранится в <input>, .text() его не читает — сужаем тип через instanceof
    const nameEl = wrapper.find('input.profile__input').element
    expect(nameEl).toBeInstanceOf(HTMLInputElement)
    if (nameEl instanceof HTMLInputElement) {
      expect(nameEl.value).toBe('Test User')
    }
    expect(wrapper.text()).toContain('test@example.com')
  })

  it('отображает роль пользователя', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    expect(wrapper.text()).toContain('user')
  })

  it('отображает дату регистрации в формате dd.mm.yyyy', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    expect(wrapper.text()).toContain('01.01.2024')
  })

  // --- Аватар ---

  it('показывает инициал, если avatarUrl отсутствует', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    const initials = wrapper.find('.profile__avatar-initials')
    expect(initials.exists()).toBe(true)
    expect(initials.text()).toBe('T') // первая буква 'Test User'
  })

  it('показывает img аватара, если задан avatarUrl', async () => {
    setupMocks({ avatarUrl: 'https://example.com/avatar.png' })
    const wrapper = mount(ProfileView)
    await flushPromises()
    const img = wrapper.find('img.profile__avatar-img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/avatar.png')
  })

  it('показывает инициал, если avatarUrl задан, но img не загрузился', async () => {
    setupMocks({ avatarUrl: 'https://example.com/broken.png' })
    const wrapper = mount(ProfileView)
    await flushPromises()
    const img = wrapper.find('img.profile__avatar-img')
    await img.trigger('error') // имитируем ошибку загрузки
    expect(wrapper.find('.profile__avatar-initials').exists()).toBe(true)
  })

  // --- Редактирование имени ---

  it('поле имени отключено по умолчанию', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    const nameInput = wrapper.find('input.profile__input')
    expect(nameInput.attributes('disabled')).toBeDefined()
  })

  it('включает поле имени после клика на карандаш', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    await wrapper.find('.profile__icon-btn').trigger('click')
    const nameInput = wrapper.find('input.profile__input')
    expect(nameInput.attributes('disabled')).toBeUndefined()
  })

  it('вызывает patchUserName при нажатии Enter с новым именем', async () => {
    patchUserNameMock.mockResolvedValue({ name: 'New Name' })
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    await wrapper.find('.profile__icon-btn').trigger('click')
    const nameInput = wrapper.find('input.profile__input')
    await nameInput.setValue('New Name')
    await nameInput.trigger('keyup', { key: 'Enter' })
    await flushPromises()
    expect(patchUserNameMock).toHaveBeenCalledWith('New Name')
  })

  it('не вызывает patchUserName, если имя не изменилось', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    await wrapper.find('.profile__icon-btn').trigger('click')
    // имя то же самое — 'Test User'
    await wrapper.find('.profile__icon-btn').trigger('click') // save click
    await flushPromises()
    expect(patchUserNameMock).not.toHaveBeenCalled()
  })

  it('выходит из режима редактирования по Escape без сохранения', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    await wrapper.find('.profile__icon-btn').trigger('click')
    const nameInput = wrapper.find('input.profile__input')
    await nameInput.setValue('Some Changed Name')
    await nameInput.trigger('keyup', { key: 'Escape' })
    await flushPromises()
    expect(patchUserNameMock).not.toHaveBeenCalled()
    expect(nameInput.attributes('disabled')).toBeDefined()
  })

  // --- Прогресс ---

  it('отображает прогресс-бары для всех тем', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    expect(wrapper.text()).toContain('JavaScript Basics')
    expect(wrapper.text()).toContain('Vue.js')
    const bars = wrapper.findAll('.profile__progress-fill')
    expect(bars).toHaveLength(2)
  })

  it('устанавливает корректную ширину progress-fill', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    // стили заданы inline — проверяем через html()
    const html = wrapper.html()
    expect(html).toContain('width: 70%')
    expect(html).toContain('width: 25%')
  })

  it('отображает дробь выполненных задач', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    expect(wrapper.text()).toContain('7 / 10')
    expect(wrapper.text()).toContain('2 / 8')
  })

  // --- Таблица рекордов ---

  it('отображает строки таблицы рекордов', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    expect(wrapper.text()).toContain('other@example.com')
    expect(wrapper.text()).toContain('test@example.com')
    expect(wrapper.text()).toContain('500')
    expect(wrapper.text()).toContain('300')
  })

  it('выделяет строку текущего пользователя классом profile__lb-row--me', async () => {
    setupMocks()
    const wrapper = mount(ProfileView)
    await flushPromises()
    // ровно одна строка текущего пользователя
    const meRows = wrapper.findAll('.profile__lb-row--me')
    const otherRows = wrapper.findAll('.profile__lb-row:not(.profile__lb-row--me)')
    expect(meRows).toHaveLength(1)
    expect(otherRows).toHaveLength(1)
    // строка текущего пользователя содержит его email
    expect(wrapper.find('.profile__lb-row--me').text()).toContain('test@example.com')
  })

  it('показывает "No entries yet" при пустом leaderboard', async () => {
    apiFetchMock.mockImplementation((url: string) => {
      if (url.includes('/auth/me'))
        return Promise.resolve({ ok: true, json: async () => ({ data: mockProfile }) })
      if (url.includes('/users/me/stats'))
        return Promise.resolve({ ok: true, json: async () => ({ data: mockStats }) })
      if (url.includes('/users/me/progress'))
        return Promise.resolve({ ok: true, json: async () => ({ data: mockProgress }) })
      return Promise.resolve({ ok: false, json: async () => ({}) })
    })
    getLeaderboardMock.mockResolvedValue([])
    const wrapper = mount(ProfileView)
    await flushPromises()
    expect(wrapper.text()).toContain('Записей пока нет.')
  })
})
