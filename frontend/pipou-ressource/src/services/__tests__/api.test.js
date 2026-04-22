import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock import.meta.env avant l'import du module
vi.stubEnv('VITE_API_URL', 'http://test-api:3001/api')

const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const storage = {}
const localStorageMock = {
  getItem: vi.fn((key) => storage[key] ?? null),
  setItem: vi.fn((key, val) => { storage[key] = val }),
  removeItem: vi.fn((key) => { delete storage[key] }),
}
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Import après les mocks
const { api } = await import('@/services/api')

beforeEach(() => {
  vi.clearAllMocks()
  Object.keys(storage).forEach(k => delete storage[k])
})

function mockResponse(body, ok = true, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(body),
  })
}

describe('api service', () => {
  describe('request()', () => {
    it('construit la bonne URL', async () => {
      mockResponse({ status: true })
      await api.get('/users')
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api:3001/api/users',
        expect.any(Object),
      )
    })

    it('envoie Content-Type JSON par défaut', async () => {
      mockResponse({ status: true })
      await api.get('/test')
      const opts = mockFetch.mock.calls[0][1]
      expect(opts.headers['Content-Type']).toBe('application/json')
    })

    it('ajoute Authorization si auth=true et token présent', async () => {
      storage.token = 'jwt-123'
      mockResponse({ status: true })
      await api.get('/me', true)
      const opts = mockFetch.mock.calls[0][1]
      expect(opts.headers['Authorization']).toBe('Bearer jwt-123')
    })

    it('n\'ajoute pas Authorization si auth=false', async () => {
      storage.token = 'jwt-123'
      mockResponse({ status: true })
      await api.get('/public')
      const opts = mockFetch.mock.calls[0][1]
      expect(opts.headers['Authorization']).toBeUndefined()
    })

    it('stringify le body pour POST', async () => {
      mockResponse({ status: true })
      await api.post('/data', { name: 'test' })
      const opts = mockFetch.mock.calls[0][1]
      expect(opts.method).toBe('POST')
      expect(opts.body).toBe(JSON.stringify({ name: 'test' }))
    })

    it('n\'envoie pas de body pour GET', async () => {
      mockResponse({ status: true })
      await api.get('/data')
      const opts = mockFetch.mock.calls[0][1]
      expect(opts.body).toBeNull()
    })

    it('throw sur réponse non-ok avec le message d\'erreur', async () => {
      mockResponse({ message: 'Non autorisé' }, false, 401)
      await expect(api.get('/secret', true)).rejects.toThrow('Non autorisé')
    })

    it('throw avec message par défaut si pas de message dans la réponse', async () => {
      mockResponse({}, false, 500)
      await expect(api.get('/broken')).rejects.toThrow('Erreur serveur')
    })
  })

  describe('méthodes HTTP', () => {
    it('api.get appelle avec méthode GET', async () => {
      mockResponse({})
      await api.get('/path')
      expect(mockFetch.mock.calls[0][1].method).toBe('GET')
    })

    it('api.post appelle avec méthode POST', async () => {
      mockResponse({})
      await api.post('/path', {})
      expect(mockFetch.mock.calls[0][1].method).toBe('POST')
    })

    it('api.put appelle avec méthode PUT', async () => {
      mockResponse({})
      await api.put('/path', {})
      expect(mockFetch.mock.calls[0][1].method).toBe('PUT')
    })

    it('api.delete appelle avec méthode DELETE', async () => {
      mockResponse({})
      await api.delete('/path')
      expect(mockFetch.mock.calls[0][1].method).toBe('DELETE')
    })
  })
})
