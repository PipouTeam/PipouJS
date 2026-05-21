const { test, expect } = require('@playwright/test')
const { registerAndLogin, loginViaLocalStorage } = require('../helpers')

test.describe('Création de ressource (pipou-ressource)', () => {

  test('accès à /creer nécessite une connexion', async ({ page }) => {
    await page.goto('/creer')
    await expect(page).toHaveURL(/connexion/, { timeout: 5000 })
  })

  test('créer une ressource via API et la retrouver dans mes-ressources', async ({ page, request }) => {
    const { token, user } = await registerAndLogin(request)

    // Créer la ressource via l'API (privée = auto-validated)
    await request.post('http://localhost:3001/api/resources', {
      data: { title: 'Ma ressource E2E', visibility: 'private' },
      headers: { Authorization: `Bearer ${token}` },
    })

    // Vérifier dans mes-ressources via le navigateur
    await page.goto('/')
    await loginViaLocalStorage(page, token, user)
    await page.goto('/mes-ressources')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await expect(page.getByText('Ma ressource E2E')).toBeVisible({ timeout: 10000 })
  })

  test('mes-ressources affiche les ressources de l\'utilisateur', async ({ page, request }) => {
    const { token, user } = await registerAndLogin(request)

    // Créer une ressource via l'API
    await request.post('http://localhost:3001/api/resources', {
      data: { title: 'Ressource API E2E', visibility: 'private' },
      headers: { Authorization: `Bearer ${token}` },
    })

    // Naviguer vers mes-ressources
    await page.goto('/')
    await loginViaLocalStorage(page, token, user)
    await page.goto('/mes-ressources')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await expect(page.getByText('Ressource API E2E')).toBeVisible({ timeout: 10000 })
  })
})
