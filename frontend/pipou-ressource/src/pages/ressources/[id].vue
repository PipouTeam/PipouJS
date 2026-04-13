<template>
  <div v-if="loading" class="d-flex justify-center py-16">
    <v-progress-circular indeterminate color="primary" />
  </div>

  <v-container v-else-if="error" class="mx-auto py-8" max-width="720">
    <v-alert type="error" variant="tonal" rounded="sm">{{ error }}</v-alert>
    <v-btn variant="text" color="primary" prepend-icon="mdi-arrow-left" to="/catalogue" class="mt-4">
      Retour au catalogue
    </v-btn>
  </v-container>

  <template v-else-if="resource">
    <!-- En-tête commun -->
    <ArticleHeader
      :title="resource.title"
      :content-type="resource.resource_type || 'Ressource'"
      description=""
    />

    <v-container class="mx-auto pb-12" max-width="960">

      <!-- Métadonnées -->
      <div class="d-flex flex-wrap ga-2 mb-6">
        <v-chip v-if="resource.category" variant="tonal" color="secondary" prepend-icon="mdi-shape-outline" size="small">
          {{ resource.category }}
        </v-chip>
        <v-chip v-if="resource.relation_type" variant="tonal" color="info" prepend-icon="mdi-account-group-outline" size="small">
          {{ resource.relation_type }}
        </v-chip>
        <v-chip variant="tonal" color="grey" prepend-icon="mdi-eye-outline" size="small">
          {{ resource.views }} vue{{ resource.views > 1 ? 's' : '' }}
        </v-chip>
        <v-chip variant="tonal" color="grey" prepend-icon="mdi-account-outline" size="small">
          {{ resource.author_first_name }} {{ resource.author_last_name }}
        </v-chip>
      </div>

      <!-- Actions utilisateur -->
      <div v-if="isLoggedIn" class="d-flex ga-3 mb-6">
        <v-btn
          :color="isFavorite ? 'error' : 'default'"
          :variant="isFavorite ? 'tonal' : 'outlined'"
          :prepend-icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'"
          rounded="sm"
          size="small"
          :loading="favLoading"
          @click="toggleFavorite"
        >
          {{ isFavorite ? 'Favori' : 'Ajouter aux favoris' }}
        </v-btn>
        <v-btn
          :color="isSaved ? 'info' : 'default'"
          :variant="isSaved ? 'tonal' : 'outlined'"
          :prepend-icon="isSaved ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
          rounded="sm"
          size="small"
          :loading="savedLoading"
          @click="toggleSaved"
        >
          {{ isSaved ? 'Mis de côté' : 'Mettre de côté' }}
        </v-btn>
      </div>

      <!-- ============ RENDU PAR TYPE ============ -->

      <!-- PDF (Cours au format PDF) -->
      <template v-if="displayMode === 'pdf'">
        <ArticleContent type="pdf" :file-url="resource.media_url" />
      </template>

      <!-- Vidéo -->
      <template v-else-if="displayMode === 'video'">
        <!-- YouTube embed -->
        <v-card v-if="youtubeId" variant="outlined" rounded="lg" class="overflow-hidden mb-4">
          <div style="aspect-ratio: 16/9">
            <iframe
              :src="`https://www.youtube.com/embed/${youtubeId}`"
              class="w-100 h-100"
              style="border: none; display: block"
              allowfullscreen
            />
          </div>
        </v-card>
        <!-- Vidéo uploadée -->
        <ArticleContent v-else-if="resource.media_url" type="video" :file-url="resource.media_url" />
        <v-alert v-else type="info" variant="tonal" rounded="sm">Aucun contenu vidéo disponible.</v-alert>
      </template>

      <!-- Carte défi -->
      <template v-else-if="displayMode === 'challenge'">
        <v-card variant="outlined" rounded="lg" class="pa-6" style="border-left: 4px solid rgb(var(--v-theme-warning))">
          <div class="d-flex align-center ga-3 mb-4">
            <v-icon icon="mdi-lightning-bolt" color="warning" size="32" />
            <h2 class="text-h6 font-weight-bold">Défi</h2>
          </div>
          <div class="resource-content text-body-1" style="line-height: 1.75" v-html="resource.content" />
          <div v-if="resource.media_url" class="mt-4">
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-download-outline" :href="resource.media_url" download>
              Télécharger le support
            </v-btn>
          </div>
        </v-card>
      </template>

      <!-- Activité / Jeu (avec échange participants) -->
      <template v-else-if="displayMode === 'activity'">
        <v-card variant="outlined" rounded="lg" class="pa-6 mb-4">
          <div v-if="resource.content" class="resource-content text-body-1" style="line-height: 1.75" v-html="resource.content" />
          <div v-if="resource.media_url" class="mt-4">
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-open-in-new" :href="resource.media_url" target="_blank">
              Accéder à la ressource
            </v-btn>
          </div>
        </v-card>
        <!-- Placeholder échange en ligne -->
        <v-card variant="tonal" color="primary" rounded="lg" class="pa-6">
          <div class="d-flex align-center ga-3 mb-2">
            <v-icon icon="mdi-forum-outline" size="28" />
            <h3 class="text-subtitle-1 font-weight-bold">Échangez avec les participants</h3>
          </div>
          <p class="text-body-2 text-grey-darken-1">
            Cette fonctionnalité sera bientôt disponible. Vous pourrez échanger en ligne avec d'autres participants autour de cette activité.
          </p>
        </v-card>
      </template>

      <!-- Article / Fiche de lecture / Exercice / Défaut -->
      <template v-else>
        <v-card variant="outlined" rounded="lg" class="pa-6">
          <div v-if="resource.content" class="resource-content text-body-1" style="line-height: 1.75" v-html="resource.content" />
          <div v-if="resource.media_url" class="mt-4">
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-download-outline" :href="resource.media_url" download>
              Télécharger le fichier
            </v-btn>
          </div>
        </v-card>
      </template>

    </v-container>
  </template>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/services/api'

const route = useRoute()
const resource = ref(null)
const loading = ref(true)
const error = ref(null)

// Auth & progress state
const isLoggedIn  = !!localStorage.getItem('token')
const isFavorite  = ref(false)
const isSaved     = ref(false)
const favLoading  = ref(false)
const savedLoading = ref(false)

onMounted(async () => {
  try {
    const data = await api.get(`/resources/${route.params.id}`)
    resource.value = data.resource

    // Charger l'état favori/sauvegardé si connecté
    if (isLoggedIn) {
      try {
        const dashboard = await api.get('/progress/dashboard', true)
        const rid = resource.value.id
        isFavorite.value = dashboard.favorites?.some(f => f.id === rid) ?? false
        isSaved.value    = dashboard.saved?.some(s => s.id === rid) ?? false
      } catch {}
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

async function toggleFavorite() {
  favLoading.value = true
  try {
    if (isFavorite.value) {
      await api.delete(`/progress/favorites/${resource.value.id}`, true)
    } else {
      await api.post(`/progress/favorites/${resource.value.id}`, null, true)
    }
    isFavorite.value = !isFavorite.value
  } catch {} finally { favLoading.value = false }
}

async function toggleSaved() {
  savedLoading.value = true
  try {
    if (isSaved.value) {
      await api.delete(`/progress/saved/${resource.value.id}`, true)
    } else {
      await api.post(`/progress/saved/${resource.value.id}`, null, true)
    }
    isSaved.value = !isSaved.value
  } catch {} finally { savedLoading.value = false }
}

const displayMode = computed(() => {
  const type = resource.value?.resource_type
  if (!type) return 'default'
  if (type === 'Cours au format PDF') return 'pdf'
  if (type === 'Vidéo') return 'video'
  if (type === 'Carte défi') return 'challenge'
  if (['Activité / Jeu à réaliser', 'Jeu en ligne'].includes(type)) return 'activity'
  return 'default' // Article, Fiche de lecture, Exercice / Atelier
})

const youtubeId = computed(() => {
  const url = resource.value?.content || resource.value?.media_url || ''
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
})
</script>

<style scoped>
.resource-content :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1em 0 0.5em;
}

.resource-content :deep(h3) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 1em 0 0.5em;
}

.resource-content :deep(p) {
  margin: 0.5em 0;
}

.resource-content :deep(ul),
.resource-content :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.resource-content :deep(li) {
  margin: 0.25em 0;
}

.resource-content :deep(blockquote) {
  border-left: 3px solid #ccc;
  padding-left: 1em;
  margin: 0.75em 0;
  color: #666;
}

.resource-content :deep(strong) {
  font-weight: 600;
}

.resource-content :deep(hr) {
  border: none;
  border-top: 1px solid #ddd;
  margin: 1em 0;
}
</style>
