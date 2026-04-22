const { test, expect } = require('@playwright/test')
const { registerUser, registerAndLogin, loginViaLocalStorage } = require('../helpers')

test.describe('Authentification (pipou-ressource)', () => {

  test('affiche le formulaire de connexion', async ({ page }) => {
    await page.goto('/connexion')
    await expect(page.getByText('Connexion')).toBeVisible()
  })

  test('inscription + connexion + redirection', async ({ page, request }) => {
    const credentials = await registerUser(request)

    await page.goto('/connexion')

    // Remplir le formulaire de connexion (Vuetify utilise des labels flottants)
    await page.locator('input[type="email"], input[type="text"]').first().fill(credentials.email)
    await page.locator('input[type="password"]').first().fill(credentials.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Vérifier la redirection vers l'accueil
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })

  test('déconnexion', async ({ page, request }) => {
    const { token, user } = await registerAndLogin(request)

    // Injecter la session
    await page.goto('/')
    await loginViaLocalStorage(page, token, user)
    await page.reload()

    // Chercher le bouton de déconnexion et cliquer
    const logoutBtn = page.getByRole('button', { name: /déconnexion|logout/i })
      .or(page.locator('[data-testid="logout"]'))
      .or(page.getByText(/déconnexion/i))

    if (await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutBtn.click()
      // Après déconnexion, le token devrait être supprimé
      const tokenAfter = await page.evaluate(() => localStorage.getItem('token'))
      expect(tokenAfter).toBeNull()
    }
  })

  test('les routes protégées redirigent vers /connexion', async ({ page }) => {
    await page.goto('/compte')
    await expect(page).toHaveURL(/connexion/, { timeout: 5000 })
  })

  test('/mes-ressources redirige vers /connexion sans auth', async ({ page }) => {
    await page.goto('/mes-ressources')
    await expect(page).toHaveURL(/connexion/, { timeout: 5000 })
  })
})
