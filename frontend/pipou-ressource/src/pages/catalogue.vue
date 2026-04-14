<template>
  <v-container>
    <v-row>
      <Title :message="pageTitle" class="mb-6" />

      <SearchBar
        :categories="categories"
        :relations="relationTypes"
        :resource-types="resourceTypes"
        @filter="handleFilter"
      />

      <!-- Chargement -->
      <v-col v-if="loading" cols="12" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </v-col>

      <!-- Erreur -->
      <v-col v-else-if="error" cols="12">
        <v-alert type="error" variant="tonal" rounded="sm">{{ error }}</v-alert>
      </v-col>

      <!-- Aucun résultat -->
      <v-col v-else-if="resources.length === 0" cols="12" class="text-center py-12">
        <v-icon icon="mdi-magnify" size="48" color="grey-lighten-1" />
        <p class="text-body-1 text-grey mt-4">Aucune ressource trouvée.</p>
      </v-col>

      <!-- Grille de ressources -->
      <v-col v-else cols="12">
        <ResourceList
          :items="resources"
          view="grid"
          show-excerpt
          show-relation
          :show-progress="isLoggedIn"
          :favorite-ids="favoriteIds"
          :saved-ids="savedIds"
          @toggle-favorite="toggleFavorite"
          @toggle-saved="toggleSaved"
        />
      </v-col>

      <!-- Pagination -->
      <v-col v-if="totalPages > 1" cols="12" class="d-flex justify-center pt-4">
        <v-pagination
          v-model="page"
          :length="totalPages"
          rounded="sm"
          @update:model-value="fetchResources"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'

const pageTitle = 'Catalogue des ressources'

const resources     = ref([])
const categories    = ref([])
const relationTypes = ref([])
const resourceTypes = ref([])
const favorites     = ref([])
const saved         = ref([])
const loading       = ref(false)
const error         = ref('')
const page          = ref(1)
const totalPages    = ref(1)
const isLoggedIn    = !!localStorage.getItem('token')

const favoriteIds = computed(() => new Set(favorites.value.map(f => f.id)))
const savedIds    = computed(() => new Set(saved.value.map(s => s.id)))

const filters = ref({
  search: '',
  category_id: null,
  relation_type_id: null,
  resource_type_id: null,
})

onMounted(async () => {
  try {
    const [catData, relData, rtData] = await Promise.all([
      api.get('/categories'),
      api.get('/relation-types'),
      api.get('/resource-types'),
    ])
    categories.value    = catData.categories ?? catData
    relationTypes.value = relData.relation_types ?? relData
    resourceTypes.value = rtData.resource_types ?? rtData
    if (isLoggedIn) {
      const dashboard = await api.get('/progress/dashboard', true)
      favorites.value = dashboard.favorites ?? []
      saved.value     = dashboard.saved ?? []
    }
  } catch (e) {
    console.error('Erreur chargement filtres:', e)
  }
  fetchResources()
})

function handleFilter(f) {
  filters.value = f
  page.value = 1
  fetchResources()
}

async function toggleFavorite(resourceId) {
  try {
    if (favoriteIds.value.has(resourceId)) {
      await api.delete(`/progress/favorites/${resourceId}`, true)
      favorites.value = favorites.value.filter(f => f.id !== resourceId)
    } else {
      await api.post(`/progress/favorites/${resourceId}`, null, true)
      const r = resources.value.find(r => r.id === resourceId)
      if (r) favorites.value.push(r)
    }
  } catch {}
}

async function toggleSaved(resourceId) {
  try {
    if (savedIds.value.has(resourceId)) {
      await api.delete(`/progress/saved/${resourceId}`, true)
      saved.value = saved.value.filter(s => s.id !== resourceId)
    } else {
      await api.post(`/progress/saved/${resourceId}`, null, true)
      const r = resources.value.find(r => r.id === resourceId)
      if (r) saved.value.push(r)
    }
  } catch {}
}

async function fetchResources() {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams()
    params.set('page', page.value)
    params.set('limit', '12')
    if (filters.value.search) params.set('search', filters.value.search)
    if (filters.value.category_id) params.set('category_id', filters.value.category_id)
    if (filters.value.relation_type_id) params.set('relation_type_id', filters.value.relation_type_id)
    if (filters.value.resource_type_id) params.set('resource_type_id', filters.value.resource_type_id)

    const auth = !!localStorage.getItem('token')
    const data = await api.get(`/resources?${params}`, auth)
    resources.value  = data.resources
    totalPages.value = data.pages
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
