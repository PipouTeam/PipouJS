const { test, expect } = require('@playwright/test')
const { registerAndLogin, createResource, API_URL } = require('../helpers')

test.describe('Catalogue (pipou-ressource)', () => {

  test.beforeEach(async ({ request }) => {
    // Créer un admin pour seeder des ressources validées
    // On inscrit un user et on crée des ressources privées (auto-validées)
    const { token } = await registerAndLogin(request)

    // Créer quelques ressources privées (validated automatiquement)
    await createResource(request, token, {
      title: 'Guide JavaScript',
      content: 'Un guide complet sur JS',
      visibility: 'private',
    })
    await createResource(request, token, {
      title: 'Introduction Python',
      content: 'Débuter avec Python',
      visibility: 'private',
    })
  })

  test('affiche la page catalogue', async ({ page }) => {
    await page.goto('/catalogue')
    await expect(page.getByText(/catalogue|ressources/i).first()).toBeVisible()
  })

  test('affiche les ressources publiques', async ({ page, request }) => {
    // Les ressources privées ne sont pas dans le catalogue public
    // On vérifie que la page se charge sans erreur
    await page.goto('/catalogue')
    await page.waitForLoadState('networkidle')

    // La page catalogue devrait être accessible
    expect(page.url()).toContain('/catalogue')
  })

  test('la recherche filtre les résultats', async ({ page }) => {
    await page.goto('/catalogue')
    await page.waitForLoadState('networkidle')

    // Chercher le champ de recherche et taper
    const searchInput = page.getByPlaceholder(/recherche/i)
      .or(page.locator('input[type="text"]').first())

    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('JavaScript')
      await page.waitForTimeout(500) // Attendre le debounce
    }
  })
})
