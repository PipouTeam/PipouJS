// Helpers partagés pour les tests E2E

const API_URL = process.env.API_URL || 'http://localhost:3001/api'

/**
 * Inscrit un utilisateur et retourne ses identifiants.
 */
async function registerUser(request, overrides = {}) {
  const user = {
    email: `e2e_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`,
    password: 'TestE2E_123!',
    first_name: 'E2E',
    last_name: 'User',
    ...overrides,
  }

  await request.post(`${API_URL}/auth/register`, { data: user })
  return user
}

/**
 * Inscrit et connecte un utilisateur, retourne le token + user.
 */
async function registerAndLogin(request, overrides = {}) {
  const credentials = await registerUser(request, overrides)
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email: credentials.email, password: credentials.password },
  })
  const body = await res.json()
  return { token: body.token, user: body.user, credentials }
}

/**
 * Connecte un utilisateur existant, retourne le token.
 */
async function login(request, email, password) {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email, password },
  })
  const body = await res.json()
  return { token: body.token, user: body.user }
}

/**
 * Crée un admin via l'API (inscription + promotion directe en DB impossible,
 * donc on seed via l'API backend).
 * Note : En E2E on utilise un admin déjà seedé ou on fait register + SQL.
 * Ici on expose juste un login admin en supposant qu'un admin existe.
 */
async function loginAsAdmin(request, email = 'admin@test.com', password = 'AdminPass123!') {
  return login(request, email, password)
}

/**
 * Crée une ressource via l'API.
 */
async function createResource(request, token, data = {}) {
  const res = await request.post(`${API_URL}/resources`, {
    data: { title: 'E2E Resource', visibility: 'public', ...data },
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

/**
 * Injecte le token dans le localStorage du navigateur pour simuler un login.
 */
async function loginViaLocalStorage(page, token, user) {
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }, { token, user })
}

module.exports = {
  API_URL,
  registerUser,
  registerAndLogin,
  login,
  loginAsAdmin,
  createResource,
  loginViaLocalStorage,
}
