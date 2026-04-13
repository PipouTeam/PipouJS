import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)

  const isLoggedIn = computed(() => !!token.value)
  const userName   = computed(() => user.value ? `${user.value.first_name} ${user.value.last_name}` : '')

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password })
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user',  JSON.stringify(data.user))
  }

  async function register(firstName, lastName, email, password) {
    await api.post('/auth/register', {
      first_name: firstName,
      last_name:  lastName,
      email,
      password,
    })
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { user, token, isLoggedIn, userName, login, register, logout }
})
