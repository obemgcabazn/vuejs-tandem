Разбирался в auth-модуле, который написал @obemgcabazn.
Основная логика в `src/stores/auth.ts`.  
Функционал реализует Pinia-store для аутентификации: управление пользователем, логином/регистрацией, хранением токенов, обновлением токенов и выходом из аккаунта через localStorage и API-бэкенд.  

В useAuthStore из localStorage берётся сохранённый user (если есть) и кладётся в ref<User | null>.
Есть реактивные флаги loading (идёт ли запрос) и error (строка ошибки или null).
Компьютед isAuthenticated возвращает true, если user не null.  

Есть асинхронная функция login(email, password), которая:
Собирает userData с email и password, формирует POST запрос на VITE_API_URL + '/auth/login'.
При успешном ответе парсит JSON, вызывает setToken (сохраняет токены в localStorage), сохраняет userData в стор и в localStorage.  

Функция register(email, name, password), которая
Аналогично login: шлёт POST на /auth/register с email, name, password.
Если статус 409 — пишет ошибку 'Email уже зарегистрирован'.
Если 400 — читает message из тела и пишет его либо 'Ошибка валидации'.
Если другой неуспешный статус — 'Неизвестная ошибка сервера'.
При успехе: парсит ответ, вызывает setToken, сохраняет пользователя в стор и localStorage.  

Функция refreshTokens():
Берёт refresh-token из localStorage. Если его нет — возвращает false.
Шлёт POST на /auth/refresh с refreshToken.
Если ответ не ok — возвращает false.
При успехе парсит TokenResp, вызывает setToken, возвращает true.
При любой ошибке в запросе ловит исключение и возвращает false.  

Функция logout():
Удаляет из localStorage ключи: user, access-token, refresh-token, token-expires-at.
Сбрасывает user в null (пользователь разлогинен).  

Функция setToken(tokenObj) (вне стора):
Достаёт accessToken, refreshToken, expiresIn из tokenObj.data.
Кладёт токены в localStorage (access-token, refresh-token) и считает момент истечения: Date.now() + expiresIn * 1000, записывая его как строку в token-expires-at.

