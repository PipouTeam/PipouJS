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
      <v-col
        v-else
        v-for="r in resources"
        :key="r.id"
        cols="12"
        sm="6"
        md="4"
      >
        <CatalogueCard
          :id="r.id"
          :titre="r.title"
          :text="r.content"
          :categorie="r.category || ''"
          :relation="r.relation_type || ''"
          :resource-type="r.resource_type || ''"
          :thumbnail-url="r.thumbnail_url || ''"
          :media-url="r.media_url || ''"
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
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'

const pageTitle = 'Catalogue des ressources'

const resources     = ref([])
const categories    = ref([])
const relationTypes = ref([])
const resourceTypes = ref([])
const loading       = ref(false)
const error         = ref('')
const page          = ref(1)
const totalPages    = ref(1)

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

    const data = await api.get(`/resources?${params}`)
    resources.value  = data.resources
    totalPages.value = data.pages
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
