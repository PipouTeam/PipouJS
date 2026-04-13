<template>
  <!-- Chargement -->
  <v-container v-if="loading" class="mx-auto py-16 text-center" max-width="960">
    <v-progress-circular indeterminate color="primary" size="48" />
  </v-container>

  <!-- Erreur / introuvable -->
  <v-container v-else-if="error" class="mx-auto py-16 text-center" max-width="960">
    <v-icon icon="mdi-alert-circle-outline" size="64" color="grey-lighten-1" />
    <p class="text-body-1 text-grey mt-4">{{ error }}</p>
    <v-btn variant="text" color="primary" prepend-icon="mdi-arrow-left" to="/catalogue" class="mt-4">
      Retour au catalogue
    </v-btn>
  </v-container>

  <!-- Contenu -->
  <template v-else>
    <ArticleHeader
      :title="resource.title"
      :content-type="resource.resource_type || 'Document'"
      :description="description"
    >
      <template #actions>
        <v-btn
          v-if="isLoggedIn"
          :color="isFavorite ? 'error' : 'primary'"
          :variant="isFavorite ? 'tonal' : 'outlined'"
          :prepend-icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'"
          rounded="sm"
          :loading="favLoading"
          @click="toggleFavorite"
        >
          {{ isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
        </v-btn>
      </template>
    </ArticleHeader>

    <ArticleContent
      :type="contentType"
      :file-url="contentUrl"
    />
  </template>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const route     = useRoute()
const authStore = useAuthStore()

const isLoggedIn = ref(authStore.isLoggedIn)
const loading    = ref(true)
const error      = ref('')
const resource   = ref(null)

// Favoris
const isFavorite = ref(false)
const favLoading = ref(false)

onMounted(async () => {
  const id = route.params.id
  try {
    const data = await api.get(`/resources/${id}`)
    resource.value = data.resource
  } catch (e) {
    error.value = e.message || 'Ressource introuvable.'
  } finally {
    loading.value = false
  }

  // État favori initial
  if (isLoggedIn.value) {
    try {
      const dash = await api.get('/progress/dashboard', true)
      isFavorite.value = dash.favorites?.some(f => f.id === Number(route.params.id)) ?? false
    } catch {}
  }
})

// Détection du type de contenu
const contentType = computed(() => {
  const c = resource.value?.content ?? ''
  if (!c) return 'unknown'
  if (/youtube\.com|youtu\.be/.test(c)) return 'youtube'
  if (/\/uploads\//.test(c) || c.endsWith('.pdf')) return 'pdf'
  return 'text'
})

// URL ou texte à passer à ArticleContent
const contentUrl = computed(() => resource.value?.content ?? '')

// Description dans l'en-tête : extrait du texte pour les ressources textuelles
const description = computed(() => {
  if (!resource.value) return ''
  const c = resource.value.content ?? ''
  if (contentType.value === 'text') {
    return c.length > 300 ? c.slice(0, 300).trimEnd() + '…' : c
  }
  return ''
})

async function toggleFavorite() {
  const id = route.params.id
  favLoading.value = true
  try {
    if (isFavorite.value) {
      await api.delete(`/progress/favorites/${id}`, true)
      isFavorite.value = false
    } else {
      await api.post(`/progress/favorites/${id}`, null, true)
      isFavorite.value = true
    }
  } catch (e) {
    console.error(e)
  } finally {
    favLoading.value = false
  }
}
</script>
