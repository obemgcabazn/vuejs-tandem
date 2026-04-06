import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LoginView from '@/views/LoginView.vue'

type AuthMock = {
  login: ReturnType<typeof vi.fn>
  register: ReturnType<typeof vi.fn>
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const { authMock, pushMock } = vi.hoisted(() => {
  const authMock: AuthMock = {
    login: vi.fn(),
    register: vi.fn(),
    isAuthenticated: false,
    loading: false,
    error: null,
  }
  return { authMock, pushMock: vi.fn() }
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authMock,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    authMock.isAuthenticated = false
    authMock.loading = false
    authMock.error = null
  })

  // --- Рендеринг ---

  it('рендерит форму входа по умолчанию', () => {
    const wrapper = mount(LoginView)
    expect(wrapper.text()).toContain('Вход')
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    // поле имени отсутствует в режиме входа
    expect(wrapper.find('input[type="text"]').exists()).toBe(false)
  })

  it('переключается в режим регистрации', async () => {
    const wrapper = mount(LoginView)
    const switchBtn = wrapper.findAll('button').find((b) => b.text().includes('Создать аккаунт'))
    await switchBtn!.trigger('click')
    expect(wrapper.text()).toContain('Регистрация')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('возвращается в режим входа после переключения', async () => {
    const wrapper = mount(LoginView)
    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Создать аккаунт'))!
      .trigger('click')
    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Уже есть аккаунт'))!
      .trigger('click')
    expect(wrapper.text()).toContain('Вход')
    expect(wrapper.find('input[type="text"]').exists()).toBe(false)
  })

  it('отображает ошибку сервера, когда auth.error не null', () => {
    authMock.error = 'Invalid credentials'
    const wrapper = mount(LoginView)
    expect(wrapper.text()).toContain('Invalid credentials')
  })

  // --- Валидация email ---

  it('не показывает ошибку email до blur (touched = false)', () => {
    const wrapper = mount(LoginView)
    expect(wrapper.text()).not.toContain('Введите корректный email')
  })

  it('показывает ошибку при некорректном email после blur', async () => {
    const wrapper = mount(LoginView)
    const input = wrapper.find('input[type="email"]')
    await input.setValue('not-an-email')
    await input.trigger('blur')
    expect(wrapper.text()).toContain('Введите корректный email')
  })

  it('не показывает ошибку email при корректном значении', async () => {
    const wrapper = mount(LoginView)
    const input = wrapper.find('input[type="email"]')
    await input.setValue('user@example.com')
    await input.trigger('blur')
    expect(wrapper.text()).not.toContain('Введите корректный email')
  })

  // --- Валидация пароля ---

  it('показывает ошибку при отсутствии прописной буквы', async () => {
    const wrapper = mount(LoginView)
    const input = wrapper.find('input[type="password"]')
    await input.setValue('alllowercase1')
    await input.trigger('blur')
    expect(wrapper.text()).toContain('Пароль должен содержать хотя бы одну прописную букву')
  })

  it('показывает ошибку при отсутствии строчной буквы', async () => {
    const wrapper = mount(LoginView)
    const input = wrapper.find('input[type="password"]')
    await input.setValue('ALLUPPERCASE1')
    await input.trigger('blur')
    expect(wrapper.text()).toContain('Пароль должен содержать хотя бы одну строчную букву')
  })

  it('показывает ошибку при отсутствии цифры', async () => {
    const wrapper = mount(LoginView)
    const input = wrapper.find('input[type="password"]')
    await input.setValue('NoDigitHere')
    await input.trigger('blur')
    expect(wrapper.text()).toContain('Пароль должен содержать хотя бы одну цифру')
  })

  // --- Валидация имени (режим регистрации) ---

  it('показывает ошибку при слишком коротком имени', async () => {
    const wrapper = mount(LoginView)
    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Создать аккаунт'))!
      .trigger('click')
    const nameInput = wrapper.find('input[type="text"]')
    await nameInput.setValue('ab')
    await nameInput.trigger('blur')
    expect(wrapper.text()).toContain('Логин должен содержать минимум 3 символа')
  })

  it('показывает ошибку при слишком длинном имени', async () => {
    const wrapper = mount(LoginView)
    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Создать аккаунт'))!
      .trigger('click')
    const nameInput = wrapper.find('input[type="text"]')
    await nameInput.setValue('ThisNameIsTooLongForValidation')
    await nameInput.trigger('blur')
    expect(wrapper.text()).toContain('Логин должен содержать не более 12 символов')
  })

  // --- Отправка формы ---

  it('не вызывает auth.login при невалидной форме', async () => {
    const wrapper = mount(LoginView)
    const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('Войти'))
    await submitBtn!.trigger('click')
    expect(authMock.login).not.toHaveBeenCalled()
  })

  it('вызывает auth.login с корректными данными', async () => {
    authMock.login.mockResolvedValue(undefined)
    const wrapper = mount(LoginView)
    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('input[type="password"]').setValue('ValidPass1')
    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Войти'))!
      .trigger('click')
    await flushPromises()
    expect(authMock.login).toHaveBeenCalledWith('user@example.com', 'ValidPass1')
  })

  it('редиректит на / после успешного входа', async () => {
    authMock.login.mockImplementation(() => {
      authMock.isAuthenticated = true
      return Promise.resolve()
    })
    const wrapper = mount(LoginView)
    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('input[type="password"]').setValue('ValidPass1')
    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Войти'))!
      .trigger('click')
    await flushPromises()
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('не редиректит, если isAuthenticated остаётся false', async () => {
    authMock.login.mockResolvedValue(undefined)
    const wrapper = mount(LoginView)
    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('input[type="password"]').setValue('ValidPass1')
    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Войти'))!
      .trigger('click')
    await flushPromises()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('вызывает auth.register с email, именем и паролем', async () => {
    authMock.register.mockResolvedValue(undefined)
    const wrapper = mount(LoginView)
    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Создать аккаунт'))!
      .trigger('click')
    await wrapper.find('input[type="text"]').setValue('MyLogin')
    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('input[type="password"]').setValue('ValidPass1')
    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Зарегистрироваться'))!
      .trigger('click')
    await flushPromises()
    expect(authMock.register).toHaveBeenCalledWith('user@example.com', 'MyLogin', 'ValidPass1')
  })
})
