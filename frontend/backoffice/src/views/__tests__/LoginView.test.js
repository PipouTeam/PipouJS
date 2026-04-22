import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import LoginView from '../LoginView.vue'

// Mock vue-router
const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

// Mock axios (utilisé par le store auth)
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

import axios from 'axios'

const vuetify = createVuetify({ components, directives })

function mountComponent() {
  return mount(LoginView, {
    global: {
      plugins: [createPinia(), vuetify],
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  // Mock localStorage
  const storage = {}
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: vi.fn((key) => storage[key] ?? null),
      setItem: vi.fn((key, val) => { storage[key] = val }),
      removeItem: vi.fn((key) => { delete storage[key] }),
    },
    configurable: true,
  })
})

describe('LoginView', () => {
  it('affiche le formulaire de connexion', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Admin - Connexion')
    expect(wrapper.text()).toContain('Se connecter')
  })

  it('contient les champs email et password', () => {
    const wrapper = mountComponent()
    const inputs = wrapper.findAll('input')
    const emailInput = inputs.find(i => i.attributes('type') === 'email')
    const passwordInput = inputs.find(i => i.attributes('type') === 'password')
    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
  })

  it('redirige vers / après un login réussi', async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: 'jwt', user: { id: 1, role: 'admin' } },
    })

    const wrapper = mountComponent()

    // Remplir les champs
    const inputs = wrapper.findAll('input')
    await inputs.find(i => i.attributes('type') === 'email').setValue('admin@test.com')
    await inputs.find(i => i.attributes('type') === 'password').setValue('password')

    // Soumettre le formulaire
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    // Attendre la résolution de la Promise
    await vi.waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/')
    })
  })

  it('affiche une erreur en cas d\'échec de login', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Identifiants invalides' } },
    })

    const wrapper = mountComponent()

    const inputs = wrapper.findAll('input')
    await inputs.find(i => i.attributes('type') === 'email').setValue('bad@test.com')
    await inputs.find(i => i.attributes('type') === 'password').setValue('wrong')

    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Identifiants invalides')
    })
  })
})
