<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Articles</h1>
      <div>
        <v-btn color="primary" @click="openCreateDialog" class="mr-2">
          <v-icon left>mdi-plus</v-icon>
          Créer
        </v-btn>
      </div>
    </div>

    <v-card class="mb-4">
      <v-card-text class="d-flex align-center" style="gap: 8px; flex-wrap: wrap;">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Rechercher..."
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class=""
          style="width: 200px;"
        ></v-text-field>
        <v-select
          v-model="filters.category_id"
          label="Catégorie"
          :items="categories"
          item-title="name"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
          class="mt-5"
          style="width: 70px;"
          @update:model-value="applyFilters"
        ></v-select>
        <v-select
          v-model="filters.relation_type_id"
          label="Relation"
          :items="relationTypes"
          item-title="name"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
          class="mt-5"
          style="width: 70px;"
          @update:model-value="applyFilters"
        ></v-select>
        <v-select
          v-model="filters.resource_type_id"
          label="Ressource"
          :items="resourceTypes"
          item-title="name"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
          class="mt-5"
          style="width: 70px;"
          @update:model-value="applyFilters"
        ></v-select>
        <v-select
          v-model="filters.status"
          label="Statut"
          :items="statuses"
          clearable
          density="compact"
          variant="outlined"
          class="mt-5"
          style="width: 70px;"
          @update:model-value="applyFilters"
        ></v-select>
        <v-btn color="grey-darken-1" variant="outlined" @click="resetFilters" style="height: 40px;">
          <v-icon left size="small">mdi-filter-remove</v-icon>
          Reset
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="resources"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item.category="{ item }">
          {{ item.category || '-' }}
        </template>
        <template v-slot:item.relation_type="{ item }">
          {{ item.relation_type || '-' }}
        </template>
        <template v-slot:item.resource_type="{ item }">
          {{ item.resource_type || '-' }}
        </template>
        <template v-slot:item.author="{ item }">
          {{ item.author_first_name }} {{ item.author_last_name }}
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small">
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:item.visibility="{ item }">
          <v-chip :color="item.visibility === 'public' ? 'success' : 'warning'" size="small">
            {{ item.visibility }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn size="small" color="primary" variant="text" @click="openPreview(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn size="small" color="primary" variant="text" @click="editResource(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn size="small" color="error" variant="text" @click="deleteResource(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog pour créer/modifier -->
    <v-dialog v-model="dialog" max-width="800">
      <v-card>
        <v-card-title class="pa-6 pb-0">
          <h2 class="text-h5 font-weight-bold">{{ editMode ? 'Modifier' : 'Créer' }} une ressource</h2>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="form">

            <!-- Informations générales -->
            <v-card variant="outlined" rounded="lg" class="pa-5 mb-4">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Informations générales</h3>

              <v-text-field
                v-model="resource.title"
                label="Titre de la ressource"
                prepend-inner-icon="mdi-text"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :rules="[v => !!v?.trim() || 'Le titre est obligatoire.']"
              />

              <v-row dense class="mb-2">
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="resource.category_id"
                    :items="categories"
                    item-title="name"
                    item-value="id"
                    label="Catégorie"
                    prepend-inner-icon="mdi-tag-outline"
                    variant="outlined"
                    density="comfortable"
                    clearable
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="resource.resource_type_id"
                    :items="resourceTypes"
                    item-title="name"
                    item-value="id"
                    label="Type de ressource"
                    prepend-inner-icon="mdi-file-outline"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    :rules="[v => !!v || 'Le type est obligatoire.']"
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="resource.relation_type_id"
                    :items="relationTypes"
                    item-title="name"
                    item-value="id"
                    label="Type de relation"
                    prepend-inner-icon="mdi-account-group-outline"
                    variant="outlined"
                    density="comfortable"
                    clearable
                  />
                </v-col>
              </v-row>

              <v-select
                v-model="resource.visibility"
                :items="visibilityOptions"
                item-title="label"
                item-value="value"
                label="Visibilité"
                prepend-inner-icon="mdi-eye-outline"
                variant="outlined"
                density="comfortable"
              />

              <v-select
                v-if="editMode"
                v-model="resource.status"
                label="Statut"
                :items="statusOptions"
                item-title="label"
                item-value="value"
                prepend-inner-icon="mdi-flag-outline"
                variant="outlined"
                density="comfortable"
                class="mt-4"
              />
            </v-card>

            <!-- Image de couverture -->
            <v-card variant="outlined" rounded="lg" class="pa-5 mb-4">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Image de couverture</h3>
              <v-file-input
                v-model="thumbnailFile"
                label="Sélectionner une image (JPG, PNG, WebP)"
                :prepend-icon="null"
                prepend-inner-icon="mdi-image-outline"
                accept=".jpg,.jpeg,.png,.webp"
                variant="outlined"
                density="comfortable"
                show-size
                :error-messages="thumbnailError"
                @update:model-value="onThumbnailChange"
              />
              <v-progress-linear v-if="thumbnailUploading" indeterminate color="primary" class="mt-2" rounded />
              <v-text-field
                v-model="resource.thumbnail_url"
                label="Ou URL de l'image"
                prepend-inner-icon="mdi-link"
                variant="outlined"
                density="comfortable"
                clearable
                class="mt-2"
              />
              <v-img
                v-if="resource.thumbnail_url"
                :src="resource.thumbnail_url"
                max-height="150"
                rounded="lg"
                cover
                class="mt-2"
              />
            </v-card>

            <!-- Contenu selon le type -->
            <v-card v-if="!selectedTypeName" variant="outlined" rounded="lg" class="pa-5 mb-4 text-center">
              <v-icon icon="mdi-arrow-up" size="32" color="grey-lighten-1" class="mb-2" />
              <p class="text-body-2 text-grey">Sélectionnez un type de ressource pour afficher le formulaire de contenu.</p>
            </v-card>

            <!-- Article : éditeur texte HTML -->
            <v-card v-else-if="selectedTypeName === 'Article'" variant="outlined" rounded="lg" class="pa-5 mb-4">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-0">Contenu de l'article</h3>
                <v-btn-toggle v-model="articleEditMode" color="primary" variant="outlined" rounded="sm" density="comfortable" mandatory>
                  <v-btn value="edit" prepend-icon="mdi-pencil-outline">Éditer</v-btn>
                  <v-btn value="preview" prepend-icon="mdi-eye-outline">Aperçu</v-btn>
                </v-btn-toggle>
              </div>

              <v-textarea
                v-if="articleEditMode === 'edit'"
                v-model="resource.content"
                label="Contenu HTML de l'article"
                prepend-inner-icon="mdi-code-tags"
                variant="outlined"
                density="comfortable"
                rows="12"
                auto-grow
                hint="Utilisez du HTML pour formater le contenu"
                persistent-hint
              />

              <div v-else class="article-preview">
                <div class="text-body-2 text-grey mb-2">Aperçu :</div>
                <v-sheet variant="outlined" rounded="lg" class="pa-4" min-height="200">
                  <div v-html="resource.content || '<em class=\'text-grey\'>Aucun contenu</em>'"></div>
                </v-sheet>
              </div>
            </v-card>

            <!-- Vidéo : upload OU lien YouTube -->
            <v-card v-else-if="selectedTypeName === 'Vidéo'" variant="outlined" rounded="lg" class="pa-5 mb-4">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Vidéo</h3>

              <v-btn-toggle v-model="inputMode" color="primary" variant="outlined" rounded="sm" density="comfortable" mandatory class="mb-4">
                <v-btn value="file" prepend-icon="mdi-upload-outline">Fichier vidéo</v-btn>
                <v-btn value="link" prepend-icon="mdi-youtube">Lien YouTube</v-btn>
              </v-btn-toggle>

              <div v-if="inputMode === 'file'">
                <v-text-field
                  v-model="resource.media_url"
                  label="URL du fichier vidéo"
                  prepend-inner-icon="mdi-video-outline"
                  variant="outlined"
                  density="comfortable"
                  clearable
                />
              </div>

              <div v-else>
                <v-text-field
                  v-model="resource.media_url"
                  label="Lien YouTube"
                  prepend-inner-icon="mdi-youtube"
                  placeholder="https://www.youtube.com/watch?v=..."
                  variant="outlined"
                  density="comfortable"
                />
                <v-img
                  v-if="editPreviewYoutubeId"
                  :src="`https://img.youtube.com/vi/${editPreviewYoutubeId}/mqdefault.jpg`"
                  rounded="lg"
                  class="mt-2"
                  max-height="200"
                />
              </div>
            </v-card>

            <!-- Cours au format PDF -->
            <v-card v-else-if="selectedTypeName === 'Cours au format PDF'" variant="outlined" rounded="lg" class="pa-5 mb-4">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Fichier PDF</h3>
              <v-text-field
                v-model="resource.media_url"
                label="URL du fichier PDF"
                prepend-inner-icon="mdi-file-pdf-box"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-card>

            <!-- Fiche de lecture -->
            <v-card v-else-if="selectedTypeName === 'Fiche de lecture'" variant="outlined" rounded="lg" class="pa-5 mb-4">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Fiche de lecture</h3>
              <v-textarea
                v-model="resource.content"
                label="Contenu textuel"
                prepend-inner-icon="mdi-text-box-outline"
                variant="outlined"
                density="comfortable"
                rows="5"
                auto-grow
              />
              <v-text-field
                v-model="resource.media_url"
                label="Ou URL du PDF"
                prepend-inner-icon="mdi-file-pdf-box"
                variant="outlined"
                density="comfortable"
                clearable
                class="mt-2"
              />
            </v-card>

            <!-- Jeu en ligne -->
            <v-card v-else-if="selectedTypeName === 'Jeu en ligne'" variant="outlined" rounded="lg" class="pa-5 mb-4">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Lien vers le jeu</h3>
              <v-text-field
                v-model="resource.media_url"
                label="URL du jeu en ligne"
                prepend-inner-icon="mdi-gamepad-variant-outline"
                placeholder="https://..."
                variant="outlined"
                density="comfortable"
              />
            </v-card>

            <!-- Types WIP -->
            <v-alert
              v-else
              type="warning"
              variant="tonal"
              rounded="sm"
              class="mb-4"
              prepend-icon="mdi-hammer-wrench"
            >
              Le format <strong>{{ selectedTypeName }}</strong> nécessite un formulaire spécifique.
            </v-alert>

          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Annuler</v-btn>
          <v-btn color="primary" variant="flat" rounded="sm" @click="saveResource" :loading="saving">
            {{ editMode ? 'Mettre à jour' : 'Créer' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog aperçu article -->
    <v-dialog v-model="previewDialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex align-center">
          <span class="text-h5">Aperçu de l'article</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="previewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-container class="mx-auto pb-12" max-width="960">
            <v-breadcrumbs :items="previewBreadcrumbs" class="px-0 pb-6 text-caption">
              <template #divider>
                <v-icon icon="mdi-chevron-right" size="x-small" />
              </template>
            </v-breadcrumbs>

            <h1 class="text-h4 font-weight-bold text-primary mb-5" style="line-height: 1.25">
              {{ previewResource.title }}
            </h1>

            <div class="d-flex flex-wrap ga-2 mb-6">
              <v-chip color="primary" variant="tonal" prepend-icon="mdi-tag-outline" rounded="sm">
                {{ previewResource.resource_type || 'Document' }}
              </v-chip>
              <v-chip :color="getStatusColor(previewResource.status)" variant="tonal" rounded="sm">
                {{ previewResource.status }}
              </v-chip>
              <v-chip :color="previewResource.visibility === 'public' ? 'success' : 'warning'" variant="tonal" rounded="sm">
                {{ previewResource.visibility }}
              </v-chip>
            </div>

            <v-divider class="mb-6 border-opacity-25" />

            <p v-if="!previewIsArticle" class="text-body-1 text-grey-darken-3 mb-6" style="max-width: 72ch; line-height: 1.75">
              {{ previewResource.description || previewResource.content || 'Aucune description disponible.' }}
            </p>

            <h2 class="text-h6 font-weight-bold text-grey-darken-3 mb-4">Contenu</h2>

            <v-card variant="outlined" rounded="lg" class="overflow-hidden">
              <video
                v-if="previewContentType === 'video'"
                controls
                class="w-100 d-block"
                style="max-height: 540px; background: #000"
              >
                <source :src="previewContent" />
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>

              <iframe
                v-else-if="previewContentType === 'youtube' && previewYoutubeId"
                :src="`https://www.youtube.com/embed/${previewYoutubeId}`"
                class="w-100 d-block"
                style="height: 75vh; border: none"
                allowfullscreen
                title="Vidéo YouTube"
              />

              <iframe
                v-else-if="previewContentType === 'pdf'"
                :src="previewContent"
                class="w-100 d-block"
                style="height: 75vh; border: none"
                title="Contenu PDF de l'article"
              />

              <div v-else-if="previewContentType === 'text'" class="pa-8">
                <div v-if="previewIsArticle" v-html="previewResource.content"></div>
                <p
                  v-else
                  v-for="(paragraph, i) in previewParagraphs"
                  :key="i"
                  class="text-body-1 text-grey-darken-3 mb-4"
                  style="line-height: 1.8"
                >
                  {{ paragraph }}
                </p>
              </div>

              <div v-else class="pa-12 text-center">
                <v-icon icon="mdi-file-question-outline" size="64" color="grey-lighten-1" />
                <p class="text-body-1 text-grey mt-4">
                  Aucun contenu disponible pour cet article.
                </p>
              </div>
            </v-card>

            <div v-if="previewContentType === 'pdf'" class="mt-6">
              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-download-outline"
                :href="previewContent"
                :disabled="!previewContent"
                download
              >
                Télécharger le fichier
              </v-btn>
            </div>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const resources = ref([])
const categories = ref([])
const relationTypes = ref([])
const resourceTypes = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editMode = ref(false)
const previewDialog = ref(false)
const previewResource = ref({})
const search = ref('')
const filters = ref({
  category_id: null,
  relation_type_id: null,
  resource_type_id: null,
  status: null
})
const statuses = ['draft', 'pending', 'validated', 'suspended']
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Upload thumbnail
const thumbnailFile = ref(null)
const thumbnailUploading = ref(false)
const thumbnailError = ref('')

async function onThumbnailChange(fileOrFiles) {
  const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles
  thumbnailError.value = ''
  resource.value.thumbnail_url = ''

  if (!file) return

  thumbnailUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (!data.url) throw new Error(data.message || 'Erreur lors de l\'upload')

    resource.value.thumbnail_url = data.url
    thumbnailFile.value = null
  } catch (e) {
    thumbnailError.value = e.message || 'Erreur lors de l\'upload'
  } finally {
    thumbnailUploading.value = false
  }
}

const resource = ref({
  id: null,
  title: '',
  content: '',
  media_url: '',
  thumbnail_url: '',
  category_id: null,
  relation_type_id: null,
  resource_type_id: null,
  visibility: 'public',
  status: 'validated'
})

const visibilityOptions = [
  { value: 'public', label: 'Public — visible par tous après validation' },
  { value: 'shared', label: 'Partagé — visible par les utilisateurs connectés' },
  { value: 'private', label: 'Privé — visible uniquement par moi' },
]

const statusOptions = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'pending', label: 'En attente de validation' },
  { value: 'validated', label: 'Validé' },
  { value: 'suspended', label: 'Suspendu' },
]

const inputMode = ref('file')
const articleEditMode = ref('edit')

const selectedTypeName = computed(() => {
  const t = resourceTypes.value.find(rt => rt.id === resource.value.resource_type_id)
  return t?.name || null
})

const editPreviewYoutubeId = computed(() => {
  const url = resource.value.media_url || ''
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
})

const previewBreadcrumbs = [
  { title: 'Accueil', to: '/' },
  { title: 'Catalogue', to: '/catalogue' },
  { title: 'Aperçu', disabled: true }
]

const previewContentType = computed(() => {
  const rt = previewResource.value.resource_type || ''
  if (rt.includes('PDF')) return 'pdf'
  if (rt.includes('Vidéo')) {
    const url = previewResource.value.media_url || previewResource.value.content || ''
    if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube'
    return 'video'
  }
  return 'text'
})

const previewIsArticle = computed(() => {
  const rt = previewResource.value.resource_type || ''
  return rt === 'Article'
})

const previewContent = computed(() => {
  const type = previewContentType.value
  if (type === 'pdf' || type === 'video') return previewResource.value.media_url || ''
  return previewResource.value.content || ''
})

const previewYoutubeId = computed(() => {
  if (previewContentType.value !== 'youtube') return null
  const url = previewResource.value.media_url || ''
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
})

const previewParagraphs = computed(() => {
  if (previewContentType.value !== 'text') return []
  const content = previewResource.value.content || ''
  return content.split(/\n+/).filter(p => p.trim())
})

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Titre', key: 'title' },
  { title: 'Catégorie', key: 'category' },
  { title: 'Type relation', key: 'relation_type' },
  { title: 'Type ressource', key: 'resource_type' },
  { title: 'Auteur', key: 'author' },
  { title: 'Statut', key: 'status' },
  { title: 'Vues', key: 'views' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const getStatusColor = (status) => {
  const colors = {
    draft: 'grey',
    pending: 'warning',
    validated: 'success',
    suspended: 'error'
  }
  return colors[status] || 'grey'
}

const fetchResources = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.category_id) params.append('category_id', filters.value.category_id)
    if (filters.value.relation_type_id) params.append('relation_type_id', filters.value.relation_type_id)
    if (filters.value.resource_type_id) params.append('resource_type_id', filters.value.resource_type_id)
    if (filters.value.status) params.append('status', filters.value.status)

    const { data } = await axios.get(`/api/admin/resources?${params.toString()}`)
    resources.value = data.resources || []
  } catch (e) {
    showSnackbar('Erreur lors du chargement', 'error')
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  fetchResources()
}

const resetFilters = () => {
  filters.value = {
    category_id: null,
    relation_type_id: null,
    resource_type_id: null,
    status: null
  }
  fetchResources()
}

const fetchOptions = async () => {
  try {
    const [catRes, relRes, typeRes] = await Promise.all([
      axios.get('/api/categories'),
      axios.get('/api/relation-types'),
      axios.get('/api/resource-types')
    ])
    categories.value = catRes.data.categories || []
    relationTypes.value = relRes.data.relation_types || []
    resourceTypes.value = typeRes.data.resource_types || []
  } catch (e) {
    console.error(e)
  }
}

const openCreateDialog = () => {
  editMode.value = false
  resource.value = {
    id: null,
    title: '',
    content: '',
    media_url: '',
    thumbnail_url: '',
    category_id: null,
    relation_type_id: null,
    resource_type_id: null,
    visibility: 'public',
    status: 'validated'
  }
  inputMode.value = 'file'
  thumbnailFile.value = null
  thumbnailError.value = ''
  articleEditMode.value = 'edit'
  dialog.value = true
}

const editResource = (item) => {
  editMode.value = true
  resource.value = {
    id: item.id,
    title: item.title,
    content: item.content || '',
    media_url: item.media_url || '',
    thumbnail_url: item.thumbnail_url || '',
    category_id: item.category_id,
    relation_type_id: item.relation_type_id,
    resource_type_id: item.resource_type_id,
    visibility: item.visibility,
    status: item.status
  }
  // Définir le mode d'entrée selon le type
  const typeName = resourceTypes.value.find(rt => rt.id === item.resource_type_id)?.name || ''
  if (typeName === 'Vidéo') {
    const url = item.media_url || ''
    inputMode.value = (url.includes('youtube') || url.includes('youtu.be')) ? 'link' : 'file'
  } else {
    inputMode.value = 'file'
  }
  thumbnailFile.value = null
  thumbnailError.value = ''
  articleEditMode.value = 'edit'
  dialog.value = true
}

const openPreview = (item) => {
  previewResource.value = { ...item }
  previewDialog.value = true
}

const saveResource = async () => {
  saving.value = true
  try {
    if (editMode.value) {
      await axios.put(`/api/admin/resources/${resource.value.id}`, resource.value)
      showSnackbar('Article mis à jour')
    } else {
      await axios.post('/api/admin/resources', resource.value)
      showSnackbar('Article créé')
    }
    dialog.value = false
    fetchResources()
  } catch (e) {
    showSnackbar(e.response?.data?.message || 'Erreur lors de la sauvegarde', 'error')
  } finally {
    saving.value = false
  }
}

const deleteResource = async (item) => {
  if (!confirm('Voulez-vous vraiment supprimer cet article ?')) return
  try {
    await axios.delete(`/api/admin/resources/${item.id}`)
    showSnackbar('Article supprimé')
    fetchResources()
  } catch (e) {
    showSnackbar('Erreur lors de la suppression', 'error')
  }
}

const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

onMounted(() => {
  fetchResources()
  fetchOptions()
})
</script>