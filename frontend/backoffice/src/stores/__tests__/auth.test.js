import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock axios
vi.mock('axios', () => {
  const defaults = { headers: { common: {} } }
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      defaults,
    },
  }
})

import { useAuthStore } from '../auth'
import axios from 'axios'

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
  axios.defaults.headers.common = {}
})

describe('auth store (backoffice)', () => {
  describe('getters', () => {
    it('isAuthenticated est false sans token ni user', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('isAdmin est false sans user', () => {
      const store = useAuthStore()
      expect(store.isAdmin).toBe(false)
    })

    it('isAdmin est true pour un admin', () => {
      const store = useAuthStore()
      store.user = { role: 'admin' }
      store.token = 'token'
      expect(store.isAdmin).toBe(true)
    })

    it('isAdmin est true pour un super_admin', () => {
      const store = useAuthStore()
      store.user = { role: 'super_admin' }
      store.token = 'token'
      expect(store.isAdmin).toBe(true)
    })

    it('isAdmin est false pour un citoyen', () => {
      const store = useAuthStore()
      store.user = { role: 'citizen' }
      store.token = 'token'
      expect(store.isAdmin).toBe(false)
    })
  })

  describe('login()', () => {
    it('stocke token et user, configure axios', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          token: 'jwt-token',
          user: { id: 1, role: 'admin', first_name: 'Admin' },
        },
      })

      const store = useAuthStore()
      const result = await store.login('admin@test.com', 'password')

      expect(result).toBe(true)
      expect(store.token).toBe('jwt-token')
      expect(store.user.role).toBe('admin')
      expect(store.isAuthenticated).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'jwt-token')
      expect(axios.defaults.headers.common['Authorization']).toBe('Bearer jwt-token')
    })

    it('retourne false et stocke l\'erreur en cas d\'échec', async () => {
      axios.post.mockRejectedValueOnce({
        response: { data: { message: 'Identifiants invalides' } },
      })

      const store = useAuthStore()
      const result = await store.login('bad@test.com', 'wrong')

      expect(result).toBe(false)
      expect(store.error).toBe('Identifiants invalides')
      expect(store.token).toBeNull()
    })

    it('gère loading pendant l\'appel', async () => {
      let resolveLogin
      axios.post.mockReturnValueOnce(new Promise(r => { resolveLogin = r }))

      const store = useAuthStore()
      const loginPromise = store.login('a@b.com', 'pass')

      expect(store.loading).toBe(true)
      resolveLogin({ data: { token: 't', user: {} } })
      await loginPromise
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchUser()', () => {
    it('récupère l\'utilisateur via /auth/me', async () => {
      axios.get.mockResolvedValueOnce({
        data: { user: { id: 1, role: 'admin' } },
      })

      const store = useAuthStore()
      store.token = 'jwt-token'
      await store.fetchUser()

      expect(store.user.role).toBe('admin')
      expect(axios.defaults.headers.common['Authorization']).toBe('Bearer jwt-token')
    })

    it('logout si l\'appel échoue', async () => {
      axios.get.mockRejectedValueOnce(new Error('Token expiré'))

      const store = useAuthStore()
      store.token = 'expired-token'
      store.user = { id: 1 }
      await store.fetchUser()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })

    it('ne fait rien sans token', async () => {
      const store = useAuthStore()
      await store.fetchUser()
      expect(axios.get).not.toHaveBeenCalled()
    })
  })

  describe('logout()', () => {
    it('vide le state, localStorage et headers axios', () => {
      const store = useAuthStore()
      store.token = 'jwt-token'
      store.user = { id: 1 }
      axios.defaults.headers.common['Authorization'] = 'Bearer jwt-token'

      store.logout()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(axios.defaults.headers.common['Authorization']).toBeUndefined()
    })
  })
})
