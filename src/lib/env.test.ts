import { describe, it, expect, beforeEach, vi } from 'vitest'

// Dynamic import ensures env.ts reads the env vars set during the test

describe('buildApiUrl', () => {
  beforeEach(() => {
    ;(process as any).env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com/'
    vi.resetModules()
  })

  it('removes duplicate slashes when building API URLs', async () => {
    const { buildApiUrl } = await import('./env')
    expect(buildApiUrl('/users')).toBe('https://api.example.com/users')
  })
})

describe('validateEnv', () => {
  it('throws in production when required variables are missing', async () => {
    const originalEnv = process.env.NODE_ENV
    ;(process as any).env.NODE_ENV = 'production'
    delete process.env.NEXT_PUBLIC_API_BASE_URL
    delete process.env.NEXT_PUBLIC_BASE_URL
    vi.resetModules()
    const { validateEnv } = await import('./env')
    expect(() => validateEnv()).toThrow(/Missing required environment variables/)
    ;(process as any).env.NODE_ENV = originalEnv
  })
})
