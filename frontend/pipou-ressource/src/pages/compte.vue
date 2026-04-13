<template>
  <v-container class="mx-auto py-8" max-width="960">

    <div class="d-flex align-center justify-space-between mb-8">
      <h1 class="text-h5 font-weight-bold text-primary">Mon compte</h1>
      <v-btn
        color="error"
        variant="tonal"
        rounded="sm"
        prepend-icon="mdi-logout"
        @click="handleLogout"
      >
        Déconnexion
      </v-btn>
    </div>

    <!-- ── 1. INFORMATIONS PERSONNELLES ─────────────────────────────────── -->
    <v-card variant="outlined" rounded="lg" class="mb-6">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-6 pb-0">
        <v-icon icon="mdi-account-outline" class="mr-2" color="primary" />
        Informations personnelles
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="profileFormRef" @submit.prevent="handleUpdateProfile">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="profileForm.first_name"
                label="Prénom"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v?.trim() || 'Champ obligatoire.']"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="profileForm.last_name"
                label="Nom"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v?.trim() || 'Champ obligatoire.']"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="profileForm.email"
                label="Adresse e-mail"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                density="comfortable"
                :rules="emailRules"
              />
            </v-col>
          </v-row>

          <v-alert v-if="profileError"   type="error"   variant="tonal" density="compact" rounded="sm" class="mb-3">{{ profileError }}</v-alert>
          <v-alert v-if="profileSuccess" type="success" variant="tonal" density="compact" rounded="sm" class="mb-3">Profil mis à jour.</v-alert>

          <div class="d-flex justify-end">
            <v-btn type="submit" color="primary" variant="flat" rounded="sm" :loading="profileLoading" prepend-icon="mdi-content-save-outline">
              Enregistrer
            </v-btn>
          </div>
        </v-form>

        <v-divider class="my-6 border-opacity-25" />

        <!-- Changement de mot de passe -->
        <p class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-4">Changer le mot de passe</p>
        <v-form ref="passwordFormRef" @submit.prevent="handleChangePassword">
          <v-text-field
            v-model="passwordForm.current"
            label="Mot de passe actuel"
            :type="showPwd ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPwd ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            :rules="[v => !!v || 'Champ obligatoire.']"
            @click:append-inner="showPwd = !showPwd"
          />
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="passwordForm.new_password"
                label="Nouveau mot de passe"
                :type="showPwd ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-reset"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || 'Champ obligatoire.', v => v.length >= 8 || 'Minimum 8 caractères.']"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="passwordForm.confirm"
                label="Confirmer le mot de passe"
                :type="showPwd ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-check-outline"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || 'Champ obligatoire.', v => v === passwordForm.new_password || 'Les mots de passe ne correspondent pas.']"
              />
            </v-col>
          </v-row>

          <v-alert v-if="passwordError"   type="error"   variant="tonal" density="compact" rounded="sm" class="mb-3">{{ passwordError }}</v-alert>
          <v-alert v-if="passwordSuccess" type="success" variant="tonal" density="compact" rounded="sm" class="mb-3">Mot de passe mis à jour.</v-alert>

          <div class="d-flex justify-end">
            <v-btn type="submit" color="primary" variant="tonal" rounded="sm" :loading="passwordLoading" prepend-icon="mdi-lock-reset">
              Changer le mot de passe
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- ── 2. TABLEAU DE BORD ────────────────────────────────────────────── -->
    <v-card variant="outlined" rounded="lg" class="mb-6">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-6 pb-4">
        <v-icon icon="mdi-chart-box-outline" class="mr-2" color="primary" />
        Tableau de bord
      </v-card-title>
      <v-card-text class="px-6 pb-6">
        <v-row dense>
          <v-col v-for="stat in stats" :key="stat.label" cols="6" sm="3">
            <v-card variant="tonal" color="primary" rounded="lg" class="text-center pa-4">
              <v-icon :icon="stat.icon" size="32" class="mb-2" />
              <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
              <div class="text-caption text-medium-emphasis mt-1">{{ stat.label }}</div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ── 3. FAVORIS ────────────────────────────────────────────────────── -->
    <v-card variant="outlined" rounded="lg">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-6 pb-4">
        <v-icon icon="mdi-heart-outline" class="mr-2" color="primary" />
        Mes ressources favorites
      </v-card-title>
      <v-card-text class="px-6 pb-6">

        <!-- Filtres -->
        <v-row dense class="mb-4">
          <v-col cols="12" sm="5">
            <v-text-field
              v-model="favFilters.search"
              label="Rechercher"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="favFilters.category"
              :items="categories"
              item-title="name"
              item-value="id"
              label="Catégorie"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="favFilters.resourceType"
              :items="resourceTypes"
              item-title="name"
              item-value="id"
              label="Type"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
        </v-row>

        <!-- État non disponible -->
        <div v-if="favNotAvailable" class="text-center py-10">
          <v-icon icon="mdi-clock-outline" size="48" color="grey-lighten-1" />
          <p class="text-body-2 text-grey mt-3">Les favoris seront disponibles prochainement.</p>
        </div>

        <!-- Liste vide -->
        <div v-else-if="filteredFavorites.length === 0" class="text-center py-10">
          <v-icon icon="mdi-heart-off-outline" size="48" color="grey-lighten-1" />
          <p class="text-body-2 text-grey mt-3">Aucune ressource favorite trouvée.</p>
        </div>

        <!-- Liste des favoris -->
        <v-list v-else lines="two" class="pa-0">
          <v-list-item
            v-for="fav in filteredFavorites"
            :key="fav.id"
            :to="`/article/${fav.id}`"
            rounded="lg"
            class="mb-2 border"
          >
            <template #prepend>
              <v-icon :icon="typeIcon(fav.resource_type)" color="primary" class="mr-2" />
            </template>
            <v-list-item-title class="font-weight-medium">{{ fav.title }}</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip size="x-small" variant="tonal" color="primary" rounded="sm" class="mr-1">{{ fav.category || '—' }}</v-chip>
              <v-chip size="x-small" variant="tonal" color="grey"    rounded="sm">{{ fav.resource_type || '—' }}</v-chip>
            </v-list-item-subtitle>
            <template #append>
              <v-btn icon="mdi-arrow-right" variant="text" color="primary" size="small" :to="`/article/${fav.id}`" />
            </template>
          </v-list-item>
        </v-list>

      </v-card-text>
    </v-card>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router    = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/')
}

// ── Profil ───────────────────────────────────────────────────────────────────
const profileFormRef  = ref(null)
const profileLoading  = ref(false)
const profileError    = ref('')
const profileSuccess  = ref(false)
const showPwd         = ref(false)

const profileForm = ref({
  first_name: authStore.user?.first_name ?? '',
  last_name:  authStore.user?.last_name  ?? '',
  email:      authStore.user?.email      ?? '',
})

const emailRules = [
  v => !!v?.trim()          || 'L\'adresse e-mail est obligatoire.',
  v => /.+@.+\..+/.test(v) || 'Format invalide.',
]

async function handleUpdateProfile() {
  const { valid } = await profileFormRef.value.validate()
  if (!valid) return
  profileLoading.value = true
  profileError.value   = ''
  profileSuccess.value = false
  try {
    await api.put('/auth/me', profileForm.value, true)
    profileSuccess.value = true
    setTimeout(() => profileSuccess.value = false, 3000)
  } catch (e) {
    profileError.value = e.message
  } finally {
    profileLoading.value = false
  }
}

// ── Mot de passe ─────────────────────────────────────────────────────────────
const passwordFormRef  = ref(null)
const passwordLoading  = ref(false)
const passwordError    = ref('')
const passwordSuccess  = ref(false)

const passwordForm = ref({ current: '', new_password: '', confirm: '' })

async function handleChangePassword() {
  const { valid } = await passwordFormRef.value.validate()
  if (!valid) return
  passwordLoading.value = true
  passwordError.value   = ''
  passwordSuccess.value = false
  try {
    await api.put('/auth/me/password', {
      current_password: passwordForm.value.current,
      new_password:     passwordForm.value.new_password,
    }, true)
    passwordSuccess.value = true
    passwordFormRef.value.reset()
    setTimeout(() => passwordSuccess.value = false, 3000)
  } catch (e) {
    passwordError.value = e.message
  } finally {
    passwordLoading.value = false
  }
}

// ── Statistiques ─────────────────────────────────────────────────────────────
const ownResourcesCount = ref(0)
const favoritesCount    = ref(0)
const exploitedCount    = ref(0)

const stats = computed(() => [
  { label: 'Ressources publiées', value: ownResourcesCount.value, icon: 'mdi-file-document-outline' },
  { label: 'Articles favoris',    value: favoritesCount.value,    icon: 'mdi-heart-outline'          },
  { label: 'Articles consultés',  value: exploitedCount.value,    icon: 'mdi-eye-check-outline'      },
])

// ── Favoris ───────────────────────────────────────────────────────────────────
const favorites       = ref([])
const favNotAvailable = ref(false)
const categories      = ref([])
const resourceTypes   = ref([])

const favFilters = ref({ search: '', category: null, resourceType: null })

const filteredFavorites = computed(() => {
  return favorites.value.filter(f => {
    const matchSearch = !favFilters.value.search ||
      f.title.toLowerCase().includes(favFilters.value.search.toLowerCase())
    const matchCat  = !favFilters.value.category     || f.category_id    === favFilters.value.category
    const matchType = !favFilters.value.resourceType || f.resource_type_id === favFilters.value.resourceType
    return matchSearch && matchCat && matchType
  })
})

const typeIcon = type => ({
  'Vidéo':       'mdi-play-circle-outline',
  'Article':     'mdi-text-box-outline',
  'PDF':         'mdi-file-pdf-box',
  'Podcast':     'mdi-microphone-outline',
  'Cours':       'mdi-school-outline',
  'Jeu':         'mdi-gamepad-variant-outline',
  'Carte défi':  'mdi-cards-outline',
}[type] ?? 'mdi-file-outline')

onMounted(async () => {
  // Ressources propres
  try {
    const mine = await api.get('/resources/mine', true)
    ownResourcesCount.value = mine.resources?.length ?? 0
  } catch {}

  // Référentiels pour les filtres
  try {
    const [cat, rtype] = await Promise.all([
      api.get('/categories'),
      api.get('/resource-types'),
    ])
    categories.value   = cat.categories    ?? []
    resourceTypes.value = rtype.resourceTypes ?? []
  } catch {}

  // Favoris + stats (endpoint pas encore disponible)
  try {
    const dashboard = await api.get('/progress/dashboard', true)
    favorites.value      = dashboard.favorites ?? []
    favoritesCount.value = dashboard.favorites?.length ?? 0
    exploitedCount.value = dashboard.exploited?.length ?? 0
  } catch {
    favNotAvailable.value = true
  }
})
</script>
