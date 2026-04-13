<template>
  <v-container>

    <v-row>
      <Title :message="pageTitle" class="mb-6" />
      <SearchBar
        :categories="categoryNames"
        :relations="relationNames"
        @filter="handleFilter"
      />

      <!-- Chargement -->
      <v-col v-if="loading" cols="12" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </v-col>

      <!-- Erreur API -->
      <v-col v-else-if="fetchError" cols="12">
        <v-alert type="error" variant="tonal" rounded="lg">{{ fetchError }}</v-alert>
      </v-col>

      <!-- Liste vide -->
      <v-col v-else-if="filteredRessources.length === 0" cols="12" class="text-center py-12">
        <v-icon icon="mdi-file-search-outline" size="64" color="grey-lighten-1" />
        <p class="text-body-1 text-grey mt-4">Aucune ressource trouvée.</p>
      </v-col>

      <!-- Cartes -->
      <v-col
        v-for="(ressource, index) in filteredRessources"
        :key="ressource.id"
        cols="12"
        sm="6"
        md="4"
      >
        <CatalogueCard
          :id="ressource.id"
          :titre="ressource.title"
          :relation="ressource.relation_type || '—'"
          :text="excerpt(ressource.content)"
          :categorie="ressource.category || '—'"
          :image="fallbackImages[index % fallbackImages.length]"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import imgStress        from '@/assets/img/stress-1.jpg'
import imgCommunication from '@/assets/img/communication.jpg'
import imgLeadership    from '@/assets/img/leadership.jpg'
import imgEcoute        from '@/assets/img/ecoute.jpg'
import imgConflit       from '@/assets/img/conflit.jpg'
import imgTutoring      from '@/assets/img/tutoring.jpg'

const pageTitle = 'Catalogue des ressources'

const fallbackImages = [imgStress, imgCommunication, imgLeadership, imgEcoute, imgConflit, imgTutoring]

const loading    = ref(true)
const fetchError = ref('')
const ressources = ref([])

const searchFilters = ref({ search: '', category: null, relation: null })

onMounted(async () => {
  try {
    const data = await api.get('/resources?limit=100')
    ressources.value = data.resources ?? []
  } catch (e) {
    fetchError.value = e.message || 'Impossible de charger les ressources.'
  } finally {
    loading.value = false
  }
})

const handleFilter = (filters) => {
  searchFilters.value = filters
}

const categoryNames = computed(() => {
  const names = ressources.value.map(r => r.category).filter(Boolean)
  return [...new Set(names)].sort()
})

const relationNames = computed(() => {
  const names = ressources.value.map(r => r.relation_type).filter(Boolean)
  return [...new Set(names)].sort()
})

const filteredRessources = computed(() => {
  return ressources.value.filter(r => {
    const matchSearch = !searchFilters.value.search ||
      r.title.toLowerCase().includes(searchFilters.value.search.toLowerCase()) ||
      (r.content || '').toLowerCase().includes(searchFilters.value.search.toLowerCase())
    const matchCategory = !searchFilters.value.category || r.category === searchFilters.value.category
    const matchRelation = !searchFilters.value.relation || r.relation_type === searchFilters.value.relation
    return matchSearch && matchCategory && matchRelation
  })
})

function excerpt(text, maxLength = 120) {
  if (!text) return ''
  if (/youtube\.com|youtu\.be/.test(text)) return 'Contenu vidéo YouTube.'
  if (/\/uploads\//.test(text) || text.startsWith('http')) return 'Document PDF.'
  return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + '…' : text
}
</script>
