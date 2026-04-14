<template>
  <v-container class="mx-auto py-8" max-width="960">

    <!-- En-tête -->
    <div class="d-flex flex-wrap align-start justify-space-between gap-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold text-primary">Mes ressources</h1>
        <p class="text-body-2 text-grey-darken-1 mt-1">Vos publications, favoris et ressources mises de côté.</p>
      </div>
      <v-btn color="primary" variant="flat" rounded="sm" prepend-icon="mdi-plus" to="/creer" class="mt-2">
        Nouvelle ressource
      </v-btn>
    </div>

    <!-- Onglets + toggle vue -->
    <div class="d-flex align-center justify-space-between mb-6">
      <v-tabs v-model="tab" color="primary">
      <v-tab value="publications" prepend-icon="mdi-file-edit-outline">
        Mes publications
        <v-badge v-if="myResources.length" :content="myResources.length" inline color="primary" class="ml-2" />
      </v-tab>
      <v-tab value="favorites" prepend-icon="mdi-heart-outline">
        Favoris
        <v-badge v-if="favorites.length" :content="favorites.length" inline color="error" class="ml-2" />
      </v-tab>
      <v-tab value="saved" prepend-icon="mdi-bookmark-outline">
        Mis de côté
        <v-badge v-if="saved.length" :content="saved.length" inline color="info" class="ml-2" />
      </v-tab>
      </v-tabs>

      <v-btn-toggle v-model="viewMode" mandatory density="compact" variant="outlined" rounded="sm" color="primary">
        <v-btn value="grid" icon="mdi-view-grid-outline" size="small" />
        <v-btn value="compact" icon="mdi-view-agenda-outline" size="small" />
        <v-btn value="minimal" icon="mdi-view-list-outline" size="small" />
      </v-btn-toggle>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" rounded="sm">{{ error }}</v-alert>

    <template v-else>
      <v-window v-model="tab">

        <!-- === MES PUBLICATIONS === -->
        <v-window-item value="publications">
          <EmptyState v-if="myResources.length === 0" icon="mdi-folder-open-outline" message="Vous n'avez pas encore publié de ressource." action-label="Créer ma première ressource" action-to="/creer" />
          <ResourceList v-else :items="myResources" :view="viewMode" show-status show-progress show-relation show-excerpt :favorite-ids="favoriteIds" :saved-ids="savedIds" @delete="confirmDelete" @share="openShare" @toggle-favorite="toggleFavorite" @toggle-saved="toggleSaved" />
        </v-window-item>

        <!-- === FAVORIS === -->
        <v-window-item value="favorites">
          <EmptyState v-if="favorites.length === 0" icon="mdi-heart-outline" message="Vous n'avez pas encore de favoris." action-label="Parcourir le catalogue" action-to="/catalogue" />
          <ResourceList v-else :items="favorites" :view="viewMode" show-relation show-excerpt remove-icon="mdi-heart-off-outline" remove-color="error" @remove="removeFavorite" />
        </v-window-item>

        <!-- === MIS DE CÔTÉ === -->
        <v-window-item value="saved">
          <EmptyState v-if="saved.length === 0" icon="mdi-bookmark-outline" message="Vous n'avez rien mis de côté." action-label="Parcourir le catalogue" action-to="/catalogue" />
          <ResourceList v-else :items="saved" :view="viewMode" show-relation show-excerpt remove-icon="mdi-bookmark-off-outline" remove-color="info" @remove="removeSaved" />
        </v-window-item>

      </v-window>
    </template>

    <!-- Dialog confirmation suppression -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold pt-4 px-4">Supprimer la ressource</v-card-title>
        <v-card-text class="px-4 pb-0">
          Voulez-vous vraiment supprimer <strong>{{ toDelete?.title }}</strong> ? Cette action est irréversible.
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Annuler</v-btn>
          <v-btn color="error" variant="flat" rounded="sm" :loading="deleteLoading" @click="handleDelete">
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de partage -->
    <v-dialog v-model="shareDialog" max-width="500">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold pt-4 px-4">Partager cette ressource</v-card-title>
        <v-card-text class="px-4">
          <p class="text-body-2 text-grey-darken-1 mb-3">Copiez ce lien pour partager la ressource.</p>
          <v-text-field
            :model-value="shareUrl"
            readonly
            variant="outlined"
            density="compact"
            hide-details
            append-inner-icon="mdi-content-copy"
            @click:append-inner="copyShareLink"
          />
          <v-alert v-if="linkCopied" type="success" variant="tonal" density="compact" rounded="sm" class="mt-3" prepend-icon="mdi-check">
            Lien copié !
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="shareDialog = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import ResourceList from '@/components/ResourceList.vue'

const tab           = ref('publications')
const viewMode      = ref('grid')
const myResources   = ref([])
const favorites     = ref([])
const saved         = ref([])
const loading       = ref(true)
const error         = ref('')
const deleteDialog  = ref(false)
const deleteLoading = ref(false)
const toDelete      = ref(null)
const shareDialog   = ref(false)
const shareUrl      = ref('')
const linkCopied    = ref(false)

onMounted(async () => {
  try {
    const [mine, dashboard] = await Promise.all([
      api.get('/resources/mine', true),
      api.get('/progress/dashboard', true),
    ])
    myResources.value = mine.resources ?? []
    favorites.value   = dashboard.favorites ?? []
    saved.value       = dashboard.saved ?? []
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function confirmDelete(resource) {
  toDelete.value = resource
  deleteDialog.value = true
}

async function handleDelete() {
  deleteLoading.value = true
  try {
    await api.delete(`/resources/${toDelete.value.id}`, true)
    myResources.value = myResources.value.filter(r => r.id !== toDelete.value.id)
    deleteDialog.value = false
  } catch (e) {
    error.value = e.message
  } finally {
    deleteLoading.value = false
  }
}

// --- Sets réactifs pour les IDs favoris/sauvegardés ---
const favoriteIds = computed(() => new Set(favorites.value.map(f => f.id)))
const savedIds    = computed(() => new Set(saved.value.map(s => s.id)))

async function toggleFavorite(resource) {
  try {
    if (favoriteIds.value.has(resource.id)) {
      await api.delete(`/progress/favorites/${resource.id}`, true)
      favorites.value = favorites.value.filter(r => r.id !== resource.id)
    } else {
      await api.post(`/progress/favorites/${resource.id}`, null, true)
      favorites.value.push(resource)
    }
  } catch (e) { error.value = e.message }
}

async function toggleSaved(resource) {
  try {
    if (savedIds.value.has(resource.id)) {
      await api.delete(`/progress/saved/${resource.id}`, true)
      saved.value = saved.value.filter(r => r.id !== resource.id)
    } else {
      await api.post(`/progress/saved/${resource.id}`, null, true)
      saved.value.push(resource)
    }
  } catch (e) { error.value = e.message }
}

function openShare(resource) {
  shareUrl.value = `${window.location.origin}/ressources/${resource.id}?token=${resource.share_token}`
  linkCopied.value = false
  shareDialog.value = true
}

async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 2000)
  } catch {}
}

async function removeFavorite(resource) {
  resource._removing = true
  try {
    await api.delete(`/progress/favorites/${resource.id}`, true)
    favorites.value = favorites.value.filter(r => r.id !== resource.id)
  } catch (e) { error.value = e.message }
}

async function removeSaved(resource) {
  resource._removing = true
  try {
    await api.delete(`/progress/saved/${resource.id}`, true)
    saved.value = saved.value.filter(r => r.id !== resource.id)
  } catch (e) { error.value = e.message }
}
</script>
