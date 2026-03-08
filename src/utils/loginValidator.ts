const LOGIN_MIN = 3
const LOGIN_MAX = 12

interface ValidationError {
  isValid: boolean
  error: string
}

function validateName(name: string): ValidationError {
  const testName = name.trim()
  const conditions = testName.length >= LOGIN_MIN && testName.length <= LOGIN_MAX
  let validationErrorText = ''

  if (testName.length < LOGIN_MIN) {
    validationErrorText = `Логин должен содержать минимум ${LOGIN_MIN} символа`
  } else if (testName.length > LOGIN_MAX) {
    validationErrorText = `Логин должен содержать не более ${LOGIN_MAX} символов`
  }

  return {
    isValid: conditions,
    error: validationErrorText,
  }
}

function validatePassword(password: string): ValidationError {
  const validationObj = { isValid: true, error: '' }
  if (!/[a-z]/.test(password)) {
    validationObj.isValid = false
    validationObj.error = 'Пароль должен содержать хотя бы одну строчную букву'
  }
  if (!/[A-Z]/.test(password)) {
    validationObj.isValid = false
    validationObj.error = 'Пароль должен содержать хотя бы одну прописную букву'
  }
  if (!/\d/.test(password)) {
    validationObj.isValid = false
    validationObj.error = 'Пароль должен содержать хотя бы одну цифру'
  }
  return validationObj
}

export { validateName, validatePassword }
