<template>
  <v-container class="mx-auto py-8" max-width="720">

    <div class="mb-8">
      <v-btn variant="text" color="primary" prepend-icon="mdi-arrow-left" to="/mes-ressources" class="mb-2 px-0">
        Mes ressources
      </v-btn>
      <h1 class="text-h5 font-weight-bold text-primary">Nouvelle ressource</h1>
      <p class="text-body-2 text-grey-darken-1 mt-1">
        Les ressources publiques sont soumises à validation avant d'être visibles.
      </p>
    </div>

    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <!-- Informations générales -->
      <v-card variant="outlined" rounded="lg" class="pa-6 mb-4">

        <h2 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Informations générales</h2>

        <v-text-field
          v-model="form.title"
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
              v-model="form.category_id"
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
              v-model="form.resource_type_id"
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
              v-model="form.relation_type_id"
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
          v-model="form.visibility"
          :items="visibilityOptions"
          item-title="label"
          item-value="value"
          label="Visibilité"
          prepend-inner-icon="mdi-eye-outline"
          variant="outlined"
          density="comfortable"
        />

      </v-card>

      <!-- Image de couverture -->
      <v-card variant="outlined" rounded="lg" class="pa-6 mb-4">
        <h2 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Image de couverture</h2>
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
        <v-img
          v-if="form.thumbnail_url"
          :src="form.thumbnail_url"
          max-height="200"
          rounded="lg"
          cover
          class="mt-3"
        />
      </v-card>

      <!-- Contenu dynamique selon le type -->
      <v-card v-if="!selectedTypeName" variant="outlined" rounded="lg" class="pa-6 mb-6 text-center">
        <v-icon icon="mdi-arrow-up" size="32" color="grey-lighten-1" class="mb-2" />
        <p class="text-body-2 text-grey">Sélectionnez un type de ressource pour afficher le formulaire de contenu.</p>
      </v-card>

      <!-- WIP : Carte défi, Exercice / Atelier, Activité / Jeu à réaliser -->
      <v-alert
        v-else-if="isWipType"
        type="warning"
        variant="tonal"
        rounded="sm"
        class="mb-6"
        prepend-icon="mdi-hammer-wrench"
      >
        Le format <strong>{{ selectedTypeName }}</strong> est en cours de définition. Vous pourrez bientôt créer ce type de ressource.
      </v-alert>

      <!-- Article : éditeur Tiptap -->
      <v-card v-else-if="selectedTypeName === 'Article'" variant="outlined" rounded="lg" class="pa-6 mb-6">
        <h2 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Rédiger l'article</h2>
        <TiptapEditor v-model="form.content" />
      </v-card>

      <!-- Vidéo : upload OU lien YouTube -->
      <v-card v-else-if="selectedTypeName === 'Vidéo'" variant="outlined" rounded="lg" class="pa-6 mb-6">
        <h2 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Vidéo</h2>

        <v-btn-toggle v-model="inputMode" color="primary" variant="outlined" rounded="sm" density="comfortable" mandatory class="mb-5">
          <v-btn value="file" prepend-icon="mdi-upload-outline">Fichier vidéo</v-btn>
          <v-btn value="link" prepend-icon="mdi-youtube">Lien YouTube</v-btn>
        </v-btn-toggle>

        <div v-if="inputMode === 'file'">
          <v-file-input
            v-model="selectedFile"
            label="Sélectionner une vidéo"
            :prepend-icon="null"
            prepend-inner-icon="mdi-upload-outline"
            accept=".mp4,.webm"
            variant="outlined"
            density="comfortable"
            show-size
            :error-messages="fileError"
            @update:model-value="onFileChange"
          />
          <v-progress-linear v-if="uploading" indeterminate color="primary" class="mt-2" rounded />
          <v-alert v-if="uploadedUrl" type="success" variant="tonal" density="compact" rounded="sm" class="mt-2" prepend-icon="mdi-check-circle-outline">
            Fichier prêt : {{ uploadedFileName }}
          </v-alert>
        </div>

        <div v-else>
          <v-text-field
            v-model="form.link_url"
            label="Lien YouTube"
            prepend-inner-icon="mdi-youtube"
            placeholder="https://www.youtube.com/watch?v=..."
            variant="outlined"
            density="comfortable"
          />
          <div v-if="youtubeEmbedId" class="mt-3 rounded-lg overflow-hidden" style="aspect-ratio: 16/9; max-height: 240px">
            <iframe :src="`https://www.youtube.com/embed/${youtubeEmbedId}`" class="w-100 h-100" style="border:none; display:block" allowfullscreen />
          </div>
        </div>
      </v-card>

      <!-- Cours au format PDF : upload PDF -->
      <v-card v-else-if="selectedTypeName === 'Cours au format PDF'" variant="outlined" rounded="lg" class="pa-6 mb-6">
        <h2 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Fichier PDF</h2>
        <v-file-input
          v-model="selectedFile"
          label="Sélectionner un fichier PDF"
          :prepend-icon="null"
          prepend-inner-icon="mdi-file-pdf-box"
          accept=".pdf"
          variant="outlined"
          density="comfortable"
          show-size
          :error-messages="fileError"
          @update:model-value="onFileChange"
        />
        <v-progress-linear v-if="uploading" indeterminate color="primary" class="mt-2" rounded />
        <v-alert v-if="uploadedUrl" type="success" variant="tonal" density="compact" rounded="sm" class="mt-2" prepend-icon="mdi-check-circle-outline">
            Fichier prêt : {{ uploadedFileName }}
          </v-alert>
      </v-card>

      <!-- Fiche de lecture : éditeur Tiptap OU upload PDF -->
      <v-card v-else-if="selectedTypeName === 'Fiche de lecture'" variant="outlined" rounded="lg" class="pa-6 mb-6">
        <h2 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Fiche de lecture</h2>

        <v-btn-toggle v-model="inputMode" color="primary" variant="outlined" rounded="sm" density="comfortable" mandatory class="mb-5">
          <v-btn value="editor" prepend-icon="mdi-text-box-outline">Rédiger</v-btn>
          <v-btn value="file" prepend-icon="mdi-file-pdf-box">Importer un PDF</v-btn>
        </v-btn-toggle>

        <TiptapEditor v-if="inputMode === 'editor'" v-model="form.content" />

        <div v-else>
          <v-file-input
            v-model="selectedFile"
            label="Sélectionner un fichier PDF"
            :prepend-icon="null"
            prepend-inner-icon="mdi-file-pdf-box"
            accept=".pdf"
            variant="outlined"
            density="comfortable"
            show-size
            :error-messages="fileError"
            @update:model-value="onFileChange"
          />
          <v-progress-linear v-if="uploading" indeterminate color="primary" class="mt-2" rounded />
          <v-alert v-if="uploadedUrl" type="success" variant="tonal" density="compact" rounded="sm" class="mt-2" prepend-icon="mdi-check-circle-outline">
            Fichier prêt : {{ uploadedFileName }}
          </v-alert>
        </div>
      </v-card>

      <!-- Jeu en ligne : lien URL -->
      <v-card v-else-if="selectedTypeName === 'Jeu en ligne'" variant="outlined" rounded="lg" class="pa-6 mb-6">
        <h2 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Lien vers le jeu</h2>
        <v-text-field
          v-model="form.link_url"
          label="URL du jeu en ligne"
          prepend-inner-icon="mdi-gamepad-variant-outline"
          placeholder="https://..."
          variant="outlined"
          density="comfortable"
          :rules="[v => !!v?.trim() || 'L\'URL est obligatoire.']"
        />
      </v-card>

      <!-- Alerte erreur globale -->
      <v-alert v-if="submitError" type="error" variant="tonal" rounded="sm" density="compact" class="mb-4">
        {{ submitError }}
      </v-alert>

      <div class="d-flex justify-end ga-3">
        <v-btn variant="text" to="/mes-ressources">Annuler</v-btn>
        <v-btn
          type="submit"
          color="primary"
          variant="flat"
          rounded="sm"
          prepend-icon="mdi-send-outline"
          :loading="submitting"
          :disabled="isWipType || !selectedTypeName"
        >
          Publier la ressource
        </v-btn>
      </div>

    </v-form>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'

const router = useRouter()

// Référentiels
const categories   = ref([])
const resourceTypes = ref([])
const relationTypes = ref([])

onMounted(async () => {
  const [cat, rtype, reltype] = await Promise.all([
    api.get('/categories'),
    api.get('/resource-types'),
    api.get('/relation-types'),
  ])
  categories.value   = cat.categories   ?? cat
  resourceTypes.value = rtype.resource_types ?? rtype
  relationTypes.value = reltype.relation_types ?? reltype
})

// Formulaire
const formRef = ref(null)
const form = ref({
  title:            '',
  content:          '',
  media_url:        '',
  thumbnail_url:    '',
  link_url:         '',
  category_id:      null,
  resource_type_id: null,
  relation_type_id: null,
  visibility:       'public',
})

const visibilityOptions = [
  { value: 'public',  label: 'Public — visible par tous après validation' },
  { value: 'shared',  label: 'Partagé — visible par les utilisateurs connectés' },
  { value: 'private', label: 'Privé — visible uniquement par moi' },
]

// Type sélectionné
const selectedTypeName = computed(() => {
  const t = resourceTypes.value.find(t => t.id === form.value.resource_type_id)
  return t?.name || null
})

const WIP_TYPES = ['Carte défi', 'Exercice / Atelier', 'Activité / Jeu à réaliser']
const isWipType = computed(() => WIP_TYPES.includes(selectedTypeName.value))

// Mode de saisie (file, link, editor) — reset quand on change de type
const inputMode = ref('file')
watch(selectedTypeName, (name) => {
  if (name === 'Article') inputMode.value = 'editor'
  else if (name === 'Fiche de lecture') inputMode.value = 'editor'
  else if (name === 'Jeu en ligne') inputMode.value = 'link'
  else inputMode.value = 'file'

  // Reset contenu quand on change de type
  form.value.content = ''
  form.value.media_url = ''
  form.value.link_url = ''
  selectedFile.value = null
  uploadedUrl.value = ''
  uploadedFileName.value = ''
  fileError.value = ''
})

// Upload thumbnail
const thumbnailFile      = ref(null)
const thumbnailUploading = ref(false)
const thumbnailError     = ref('')

async function onThumbnailChange(fileOrFiles) {
  const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles
  thumbnailError.value = ''
  form.value.thumbnail_url = ''

  if (!file) return

  thumbnailUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('token')
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'upload')

    form.value.thumbnail_url = data.url
  } catch (e) {
    thumbnailError.value = e.message
  } finally {
    thumbnailUploading.value = false
  }
}

// Upload fichier
const selectedFile    = ref(null)
const uploadedUrl     = ref('')
const uploadedFileName = ref('')
const uploading       = ref(false)
const fileError       = ref('')

async function onFileChange(fileOrFiles) {
  const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles
  fileError.value = ''
  uploadedUrl.value = ''
  uploadedFileName.value = ''
  form.value.media_url = ''

  if (!file) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('token')
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'upload')

    uploadedUrl.value      = data.url
    uploadedFileName.value = file.name
    form.value.media_url   = data.url
  } catch (e) {
    fileError.value = e.message
  } finally {
    uploading.value = false
  }
}

// Aperçu YouTube
const youtubeEmbedId = computed(() => {
  const url = form.value.link_url
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
})

// Soumission
const submitting  = ref(false)
const submitError = ref('')

async function handleSubmit() {
  submitError.value = ''

  const { valid } = await formRef.value.validate()
  if (!valid) return

  const payload = {
    title:            form.value.title,
    content:          form.value.content,
    category_id:      form.value.category_id,
    resource_type_id: form.value.resource_type_id,
    relation_type_id: form.value.relation_type_id,
    visibility:       form.value.visibility,
    media_url:        form.value.media_url || form.value.link_url || '',
    thumbnail_url:    form.value.thumbnail_url || '',
  }

  submitting.value = true
  try {
    await api.post('/resources', payload, true)
    router.push('/mes-ressources')
  } catch (e) {
    submitError.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>
