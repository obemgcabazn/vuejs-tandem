1. Список персональных фич:
   1. **Rich UI Screen:** ProfileView — экран профиля со сложной логикой и состоянием — **20 баллов**
   2. **Custom Auth:** Собственная авторизация (JWT + refresh token + middleware) без BaaS — **20 баллов**
   3. **API Layer:** Выделение слоя работы с API (apiFetch + requests.ts) — **10 баллов**
   4. **State Manager:** Использование Pinia (auth store) — **10 баллов**
   5. **Vue:** Использование фреймворка Vue — **5 баллов**
   6. **Auto-deploy:** Автоматический деплой через Netlify — **5 баллов**
   7. **Theme Switcher:** Переключение Light/Dark темы через CSS-переменные и класс на `html` — **10 баллов**
   8. **Unit Tests (Basic):** Тесты для ProfileView, LoginView, zones (покрытие 20%+) — **10 баллов**
   9. **Leaderboard:** Таблица рекордов с сохранением результатов — **5 баллов**

   ИТОГО: **95 баллов**

---

2. Описание работы:

   Описание приложения:
   JavaScript-тренажёр в формате завода БелАЗ: игрок проходит по цехам, исправляет ошибки в коде,
   зарабатывает васильки и очки. Чтобы открыть следующий цех, нужно набрать 5 васильков подряд,
   не допустив 2 ошибок в одном цехе. Реализована онлайн-игра между пользователями по WebSocket.

---

3. Личные Feature Components:

   **Feature 1 — ProfileView (Rich UI Screen)**

   Экран профиля пользователя со следующим функционалом:
   - Аватар: отображение по URL, fallback на инициал, кнопки редактирования и удаления
   - Имя пользователя: inline-редактирование с подтверждением (Enter) и отменой (Esc)
   - Статистика: загрузка `/users/me/stats` и `/users/me/progress` через `Promise.all`
   - Прогресс-бары: отображение процента выполнения по каждой теме
   - Таблица результатов: отображение позиции в leaderboard
   - Все операции мутации (PATCH avatar, PATCH name) изолированы через API-слой (`requests.ts`)
   - Состояние ошибок и загрузки обрабатывается отдельно для каждой секции

   Коммиты:
   - `feat(ProfileView): add ability to change username`
   - `feat(ProfileView): ability to add link to avatar photo`
   - `feat(ProfileView): add ability to remove user avatar`
   - `feat(Profile): update design`
   - `feat(ProfileView): progress bars`
   - `feat(ProvilePage): result table`

   **Feature 2 — Система авторизации (Custom Auth + API Layer)**

   Собственная система аутентификации на JWT без BaaS:
   - Login / Register через кастомный backend (`/auth/login`, `/auth/register`)
   - Access token + Refresh token: автоматическое обновление при истечении срока (за 30 сек до истечения)
   - `apiFetch.ts` — обёртка над `fetch` с логикой проверки `token-expires-at`, вызовом `refreshTokens()`
     и повторным запросом с новым токеном при 401
   - `useAuthStore` (Pinia): хранит пользователя, методы `login / logout / register / refreshTokens`
   - `loginValidator.ts`: валидация логина (3–12 символов) и пароля (строчные, прописные, цифра)
   - Router guard `beforeEach`: редирект на `/login` для защищённых маршрутов (`meta: { requiresAuth: true }`)
   - Изначально реализована авторизация через Supabase JWT, затем переведена на собственный backend

   Коммиты:
   - `feat(Authorization): add Supabase jwt authorization`
   - `feat: update authorization to new API`
   - `feat: add authorization, refresh jwt token, add validation for login/registration page`
   - `feat: add pinia, auth store`
   - `fix: remove store only email in localStorage`

   **Feature 3 — OnlineMiniGame (Complex Component + Real-time)**

   Онлайн мини-игра в реальном времени с использованием WebSocket (socket.io):
   - Лобби с отображением активных комнат (`room:created`, `room:state`)
   - Создание и присоединение к комнате по теме
   - Игровой процесс: вопросы по теме, синхронизация состояния между участниками
   - Матчмейкинг через socket-события (`room:create`, `room:join`)
   - Автоматическое обновление токена перед подключением (интеграция с JWT auth)
   - Таблица рекордов по результатам игр

   Коммиты:
   - `feat: add list of topics in online-mini-game`
   - `feat: add RoomVue component`
   - `feat: add online-mini-game (enter room, game)`
   - `feat: finished online-mini-game`
   - `feat: add leaderboard`

   **Feature 4 — Theme Switcher**

   Переключение Light/Dark темы:
   - Pinia store (`useThemeStore`): `isDark`, `toggle()`, сохранение в `localStorage`
   - Класс `dark` добавляется на `<html>` (`document.documentElement`)
   - CSS-переменные в `:root` (светлая) переопределяются в `html.dark` (тёмная)
   - Кнопка ☀️/🌙 в навигации
   - Охват: 21 файл (все ключевые компоненты и вьюшки)

   Коммиты:
   - `feat: add theme switcher`

   **Feature 5 — Unit Tests**

   Тесты с использованием Vitest + Vue Test Utils:
   - `LoginView.spec.ts` — тесты формы входа и регистрации
   - `ProfileView.spec.ts` — тесты экрана профиля
   - `zones.spec.ts` — тесты игровой логики (`allZonesCompleted`, `completedCount`, `progressPercent`)

   Коммиты:
   - `feat: add tests in __tests__ folder`
   - `feat(tests): add test to ProfileView, Login`

   **Feature 6 — Rich Text Editor (Quill)**

   Встроенный WYSIWYG-редактор Quill в `aiBlockComponent`:
   - Позволяет форматировать ответ перед отправкой на проверку
   - Кастомная стилизация тулбара и контейнера под тему приложения

   Коммиты:
   - `feat: add Grock checking on codeComponent`
