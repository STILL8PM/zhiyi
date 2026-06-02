/**
 * 表单校验工具测试 —— validate.test.ts
 *
 * 测试范围：
 * - isEmail: 邮箱格式校验
 * - isPhone: 中国大陆手机号校验
 * - isStrongPassword: 密码强度校验
 * - getPasswordStrength: 密码强度评分
 * - isPasswordMatch: 确认密码一致性
 *
 * 用例编号前缀: VAL-001 ~ VAL-017
 */
import { describe, it, expect } from 'vitest'
import {
  isEmail,
  isPhone,
  isStrongPassword,
  getPasswordStrength,
  isPasswordMatch,
} from '@/utils/validate'

// ==================== isEmail ====================

describe('isEmail — 邮箱格式校验', () => {
  // VAL-001
  it('标准邮箱格式应返回 true', () => {
    expect(isEmail('test@example.com')).toBe(true)
    expect(isEmail('user.name@domain.co')).toBe(true)
    expect(isEmail('a@b.c')).toBe(true)
  })

  // VAL-002
  it('缺少 @ 符号应返回 false', () => {
    expect(isEmail('testexample.com')).toBe(false)
    expect(isEmail('abc')).toBe(false)
  })

  // VAL-003
  it('缺少域名部分应返回 false', () => {
    expect(isEmail('test@')).toBe(false)
    expect(isEmail('test@.com')).toBe(false)
  })

  // VAL-004
  it('空字符串应返回 false', () => {
    expect(isEmail('')).toBe(false)
  })

  // 边界：含空格的邮箱
  it('含空格的邮箱应返回 false', () => {
    expect(isEmail('test @example.com')).toBe(false)
    expect(isEmail(' test@example.com')).toBe(false)
  })
})

// ==================== isPhone ====================

describe('isPhone — 手机号格式校验', () => {
  // VAL-005
  it('标准 11 位大陆手机号应返回 true', () => {
    expect(isPhone('13800138000')).toBe(true)
    expect(isPhone('15912345678')).toBe(true)
    expect(isPhone('18888888888')).toBe(true)
    expect(isPhone('19900000000')).toBe(true)
  })

  // VAL-006
  it('号码长度不足 11 位应返回 false', () => {
    expect(isPhone('1380013800')).toBe(false)
    expect(isPhone('12345')).toBe(false)
  })

  // VAL-007
  it('号码长度超过 11 位应返回 false', () => {
    expect(isPhone('138001380000')).toBe(false)
  })

  // VAL-008
  it('以 2 开头的 11 位号码应返回 false（非手机号段）', () => {
    expect(isPhone('23800138000')).toBe(false)
  })

  // VAL-009
  it('包含非数字字符应返回 false', () => {
    expect(isPhone('1380013800a')).toBe(false)
    expect(isPhone('138-0013-8000')).toBe(false)
  })
})

// ==================== isStrongPassword ====================

describe('isStrongPassword — 密码强度校验', () => {
  // VAL-010
  it('≥8 位且含字母和数字的密码应返回 true', () => {
    expect(isStrongPassword('abc12345')).toBe(true)
    expect(isStrongPassword('Password1')).toBe(true)
    expect(isStrongPassword('a1b2c3d4')).toBe(true)
  })

  // VAL-011
  it('长度不足 8 位应返回 false', () => {
    expect(isStrongPassword('a1b2c3d')).toBe(false)
    expect(isStrongPassword('ab12')).toBe(false)
  })

  // VAL-012
  it('只有字母无数字应返回 false', () => {
    expect(isStrongPassword('abcdefgh')).toBe(false)
  })

  // VAL-013
  it('只有数字无字母应返回 false', () => {
    expect(isStrongPassword('12345678')).toBe(false)
  })

  // VAL-014
  it('空字符串应返回 false', () => {
    expect(isStrongPassword('')).toBe(false)
  })
})

// ==================== getPasswordStrength ====================

describe('getPasswordStrength — 密码强度评分', () => {
  // VAL-015
  it('弱密码（不足 8 位且仅数字）应返回 level 1（一般）', () => {
    // '123': 仅含数字，score=1 → levels[1]='一般'
    const result = getPasswordStrength('123')
    expect(result.level).toBe(1)
    expect(result.text).toBe('一般')
  })

  // VAL-016
  it('含大小写字母+数字+特殊字符的密码应返回较高 level', () => {
    const result = getPasswordStrength('Abc123!@#')
    // ≥8位(1) + 大小写(1) + 数字(1) + 特殊字符(1) = 4 → "很强"
    expect(result.level).toBe(4)
    expect(result.text).toBe('很强')
  })

  it('≥8 位 + 数字 + 仅小写字母应返回 level 2（强）', () => {
    // 'abcdef12': ≥8位(1) + 无大写(0) + 有数字(1) = score=2 → levels[2]='强'
    const result = getPasswordStrength('abcdef12')
    expect(result.level).toBe(2)
    expect(result.text).toBe('强')
  })
})

// ==================== isPasswordMatch ====================

describe('isPasswordMatch — 确认密码一致性', () => {
  // VAL-017
  it('相同密码应返回 true', () => {
    expect(isPasswordMatch('abc123', 'abc123')).toBe(true)
  })

  it('不同密码应返回 false', () => {
    expect(isPasswordMatch('abc123', 'abc124')).toBe(false)
  })

  it('大小写不同应返回 false', () => {
    expect(isPasswordMatch('Abc123', 'abc123')).toBe(false)
  })
})
