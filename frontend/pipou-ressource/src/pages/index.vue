<template>
  <v-container class="mx-auto pt-8 pb-2" max-width="960">
    <Title :message="pageTitle" />

    <p class="text-body-1 text-grey-darken-2 mt-4 mb-8" style="line-height: 1.75; text-align: justify">
      Bienvenue sur la plateforme de ressources relationnelles, mise à disposition par le Ministère
      de la Santé et de la Prévention. Cet espace a pour vocation d'accompagner chacun dans la
      compréhension et la gestion de ses relations, qu'elles soient personnelles, professionnelles
      ou sociales. Vous y trouverez des ressources pédagogiques sélectionnées — vidéos, documents
      et fiches pratiques — pour mieux communiquer, gérer les conflits et développer l'écoute.
    </p>

    <!-- Statistiques -->
    <v-row class="mb-8" v-if="stats">
      <v-col v-for="s in statCards" :key="s.label" cols="12" sm="4">
        <v-card variant="tonal" :color="s.color" rounded="lg" class="pa-4 text-center">
          <v-icon :icon="s.icon" size="32" class="mb-2" />
          <p class="text-h4 font-weight-bold">{{ s.value }}</p>
          <p class="text-body-2">{{ s.label }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="border-opacity-25 mb-2" />
  </v-container>

  <!-- Carousel à la une -->
  <FeaturedCarousel />

  <!-- Ressources récentes -->
  <v-container class="mx-auto py-4" max-width="960">
    <h2 class="text-h5 font-weight-bold text-primary mb-6">
      <v-icon icon="mdi-clock-outline" class="mr-2" />
      Ressources récentes
    </h2>

    <div v-if="loadingRecent" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <ResourceList
      v-else-if="recentResources.length"
      :items="recentResources"
      view="grid"
      show-excerpt
      show-relation
      :show-progress="isLoggedIn"
      :favorite-ids="favoriteIds"
      :saved-ids="savedIds"
      @toggle-favorite="toggleFavorite"
      @toggle-saved="toggleSaved"
    />
  </v-container>

  <!-- Explorer par catégorie -->
  <v-container class="mx-auto py-4" max-width="960">
    <h2 class="text-h5 font-weight-bold text-primary mb-6">
      <v-icon icon="mdi-shape-outline" class="mr-2" />
      Explorer par catégorie
    </h2>

    <v-row>
      <v-col v-for="cat in categories" :key="cat.id" cols="6" sm="4" md="3">
        <v-card
          variant="outlined"
          rounded="lg"
          class="pa-4 text-center category-card"
          :to="`/catalogue?category=${cat.id}`"
        >
          <v-icon :icon="categoryIcon(cat.name)" size="32" color="primary" class="mb-2" />
          <p class="text-body-2 font-weight-medium">{{ cat.name }}</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Appel à l'action (non connecté) -->
  <v-container v-if="!isLoggedIn" class="mx-auto py-4 mb-8" max-width="960">
    <v-card color="primary" variant="flat" rounded="lg" class="pa-8 text-center">
      <h2 class="text-h5 font-weight-bold text-white mb-3">Rejoignez la communauté</h2>
      <p class="text-body-1 text-white mb-6" style="opacity: 0.85">
        Créez un compte pour publier vos propres ressources, sauvegarder vos favoris et échanger avec d'autres participants.
      </p>
      <div class="d-flex justify-center ga-4">
        <v-btn color="white" variant="flat" rounded="sm" prepend-icon="mdi-login" to="/connexion">
          Se connecter
        </v-btn>
        <v-btn color="white" variant="outlined" rounded="sm" prepend-icon="mdi-account-plus-outline" to="/connexion">
          Créer un compte
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import ResourceList from '@/components/ResourceList.vue'

const pageTitle = "Bienvenue sur l'espace Ressource Relationnelle"

const isLoggedIn = !!localStorage.getItem('token')

// Stats
const stats = ref(null)
const statCards = computed(() => {
  if (!stats.value) return []
  return [
    { icon: 'mdi-book-open-variant', value: stats.value.resources, label: 'Ressources disponibles', color: 'primary' },
    { icon: 'mdi-shape-outline',     value: stats.value.categories, label: 'Catégories', color: 'secondary' },
    { icon: 'mdi-account-group',     value: stats.value.contributors, label: 'Contributeurs', color: 'success' },
  ]
})

// Ressources récentes
const recentResources = ref([])
const loadingRecent = ref(true)

// Catégories
const categories = ref([])

// Favoris / Sauvegardés
const favorites = ref([])
const saved = ref([])
const favoriteIds = computed(() => new Set(favorites.value.map(f => f.id)))
const savedIds = computed(() => new Set(saved.value.map(s => s.id)))

onMounted(async () => {
  try {
    const [statsData, recentData, catData] = await Promise.all([
      api.get('/stats'),
      api.get('/resources?limit=6&sort=created_at'),
      api.get('/categories'),
    ])
    stats.value = statsData
    recentResources.value = recentData.resources ?? []
    categories.value = catData.categories ?? catData

    if (isLoggedIn) {
      try {
        const dashboard = await api.get('/progress/dashboard', true)
        favorites.value = dashboard.favorites ?? []
        saved.value = dashboard.saved ?? []
      } catch {}
    }
  } catch (e) {
    console.error('Erreur page accueil:', e)
  } finally {
    loadingRecent.value = false
  }
})

async function toggleFavorite(resource) {
  try {
    if (favoriteIds.value.has(resource.id)) {
      await api.delete(`/progress/favorites/${resource.id}`, true)
      favorites.value = favorites.value.filter(f => f.id !== resource.id)
    } else {
      await api.post(`/progress/favorites/${resource.id}`, null, true)
      favorites.value.push(resource)
    }
  } catch {}
}

async function toggleSaved(resource) {
  try {
    if (savedIds.value.has(resource.id)) {
      await api.delete(`/progress/saved/${resource.id}`, true)
      saved.value = saved.value.filter(s => s.id !== resource.id)
    } else {
      await api.post(`/progress/saved/${resource.id}`, null, true)
      saved.value.push(resource)
    }
  } catch {}
}

const categoryIcon = (name) => ({
  'Communication': 'mdi-message-text-outline',
  'Parentalité': 'mdi-baby-face-outline',
  'Santé': 'mdi-heart-pulse',
  'Bien-être': 'mdi-spa-outline',
  'Éducation': 'mdi-school-outline',
  'Professionnel': 'mdi-briefcase-outline',
  'Intelligence émotionnelle': 'mdi-head-heart-outline',
  'Monde professionnel': 'mdi-domain',
  'Qualité de vie': 'mdi-flower-outline',
  'Développement personnel': 'mdi-rocket-launch-outline',
}[name] || 'mdi-tag-outline')
</script>

<style scoped>
.category-card {
  transition: border-color 0.15s, box-shadow 0.15s;
}
.category-card:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
</style>
