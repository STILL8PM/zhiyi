/**
 * 表单校验工具
 * 提供常用的正则校验函数
 */

/** 邮箱格式校验 */
export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** 手机号格式校验（中国大陆） */
export function isPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

/** 密码强度: ≥8位，含字母和数字 */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
}

/** 获取密码强度描述 */
export function getPasswordStrength(password: string): { level: number; text: string } {
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

  const levels = ['弱', '一般', '强', '很强']
  return { level: score, text: levels[Math.min(score, 3)] || '弱' }
}

/** 确认密码是否一致 */
export function isPasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword
}
