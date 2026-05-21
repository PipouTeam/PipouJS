import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock du service API
vi.mock('@/services/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'

// Mock localStorage
const storage = {}
const localStorageMock = {
  getItem: vi.fn((key) => storage[key] ?? null),
  setItem: vi.fn((key, val) => { storage[key] = val }),
  removeItem: vi.fn((key) => { delete storage[key] }),
}
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  Object.keys(storage).forEach(k => delete storage[k])
})

describe('auth store (pipou-ressource)', () => {
  describe('état initial', () => {
    it('isLoggedIn est false sans token', () => {
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(false)
    })

    it('userName est vide sans user', () => {
      const store = useAuthStore()
      expect(store.userName).toBe('')
    })
  })

  describe('login()', () => {
    it('stocke token et user dans le state', async () => {
      api.post.mockResolvedValueOnce({
        token: 'jwt-token',
        user: { id: 1, first_name: 'Jean', last_name: 'Dupont' },
      })

      const store = useAuthStore()
      await store.login('jean@test.com', 'password')

      expect(store.token).toBe('jwt-token')
      expect(store.user.first_name).toBe('Jean')
      expect(store.isLoggedIn).toBe(true)
      expect(store.userName).toBe('Jean Dupont')
    })

    it('persiste dans localStorage', async () => {
      api.post.mockResolvedValueOnce({
        token: 'jwt-token',
        user: { id: 1, first_name: 'Jean', last_name: 'Dupont' },
      })

      const store = useAuthStore()
      await store.login('jean@test.com', 'password')

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'jwt-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', expect.any(String))
    })

    it('appelle l\'API avec les bons paramètres', async () => {
      api.post.mockResolvedValueOnce({ token: 't', user: {} })

      const store = useAuthStore()
      await store.login('a@b.com', 'pass')

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'a@b.com',
        password: 'pass',
      })
    })
  })

  describe('register()', () => {
    it('appelle l\'API avec les bons paramètres', async () => {
      api.post.mockResolvedValueOnce({})

      const store = useAuthStore()
      await store.register('Jean', 'Dupont', 'jean@test.com', 'password')

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean@test.com',
        password: 'password',
      })
    })
  })

  describe('logout()', () => {
    it('vide le state et localStorage', async () => {
      api.post.mockResolvedValueOnce({
        token: 'jwt-token',
        user: { id: 1, first_name: 'Jean', last_name: 'Dupont' },
      })

      const store = useAuthStore()
      await store.login('a@b.com', 'pass')

      store.logout()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isLoggedIn).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })
})
