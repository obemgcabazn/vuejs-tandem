import Config from '../config.ts'

interface ValidationError {
  isValid: boolean
  error: string
}

function validateName(name: string): ValidationError {
  const testName = name.trim()
  const conditions =
    testName.length >= Config.loginMinLength && testName.length <= Config.loginMaxLength
  let validationErrorText = ''

  if (testName.length < Config.loginMinLength) {
    validationErrorText = `Логин должен содержать минимум ${Config.loginMinLength} символа`
  } else if (testName.length > Config.loginMaxLength) {
    validationErrorText = `Логин должен содержать не более ${Config.loginMaxLength} символов`
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
