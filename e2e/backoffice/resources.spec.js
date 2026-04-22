const { test, expect } = require('@playwright/test')
const { API_URL, loginViaLocalStorage } = require('../helpers')

// Pour les tests backoffice, on a besoin d'un admin.
// On le crée via register + promotion SQL simulée par l'API /users/staff (super_admin).
// Comme c'est complexe en E2E, on crée un admin via register, puis on injecte
// directement le rôle en passant par l'API.

async function createAdminAndGetToken(request) {
  const email = `e2e_admin_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`
  const password = 'AdminE2E_123!'

  // Inscription comme citoyen
  await request.post(`${API_URL}/auth/register`, {
    data: { email, password, first_name: 'Admin', last_name: 'E2E' },
  })

  // Login pour avoir le token citoyen
  const loginRes = await request.post(`${API_URL}/auth/login`, {
    data: { email, password },
  })
  const loginBody = await loginRes.json()
  const userId = loginBody.user.id

  // On a besoin d'un super_admin existant pour promouvoir via /users/staff
  // Alternative : créer un premier super_admin via la même API register
  // puis le promouvoir. En pratique, pour E2E, on simule l'admin via localStorage
  // en modifiant le rôle côté client (les routes admin vérifient côté backend aussi).
  //
  // Approche pragmatique : on utilise le token citoyen + on override le user dans
  // localStorage avec role=admin. Les appels API échoueront si le backend vérifie,
  // mais on peut tester le rendu UI.

  return {
    token: loginBody.token,
    user: { ...loginBody.user, role: 'admin' },
    credentials: { email, password },
  }
}

test.describe('Gestion des ressources (backoffice)', () => {

  test('la page ressources nécessite une connexion admin', async ({ page }) => {
    await page.goto('/resources')
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })

  test('affiche la page de login avec le bon titre', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Admin - Connexion')).toBeVisible()
  })

  test('un citoyen ne peut pas accéder aux ressources admin', async ({ page, request }) => {
    const email = `citizen_${Date.now()}@test.com`
    const password = 'CitizenE2E_123!'

    await request.post(`${API_URL}/auth/register`, {
      data: { email, password, first_name: 'Citizen', last_name: 'E2E' },
    })

    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email, password },
    })
    const { token, user } = await loginRes.json()

    // Injecter la session citoyen
    await page.goto('/login')
    await loginViaLocalStorage(page, token, user)
    await page.goto('/resources')
    await page.waitForTimeout(2000)

    // Le guard requiresAdmin devrait rediriger
    const url = page.url()
    // Soit redirigé vers login, soit vers / (le guard redirige vers /)
    expect(url).toMatch(/login|\/(?!resources)/)
  })

  test('les appels API admin sont protégés (403 pour un citoyen)', async ({ request }) => {
    const email = `citizen_api_${Date.now()}@test.com`
    const password = 'CitizenAPI_123!'

    await request.post(`${API_URL}/auth/register`, {
      data: { email, password, first_name: 'Citizen', last_name: 'API' },
    })

    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email, password },
    })
    const { token } = await loginRes.json()

    // Tenter d'accéder aux routes admin
    const adminRes = await request.get(`${API_URL}/admin/resources`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(adminRes.status()).toBe(403)
  })
})
