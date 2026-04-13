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
      <v-card variant="outlined" rounded="lg" class="pa-6 mb-4">

        <h2 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Informations générales</h2>

        <!-- Titre -->
        <v-text-field
          v-model="form.title"
          label="Titre de la ressource"
          prepend-inner-icon="mdi-text"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          :rules="[v => !!v?.trim() || 'Le titre est obligatoire.']"
        />

        <!-- Ligne : catégorie / type de ressource / type de relation -->
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

        <!-- Visibilité -->
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

      <!-- Contenu -->
      <v-card variant="outlined" rounded="lg" class="pa-6 mb-6">

        <h2 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Contenu</h2>

        <!-- Toggle fichier / lien -->
        <v-btn-toggle
          v-model="contentType"
          color="primary"
          variant="outlined"
          rounded="sm"
          density="comfortable"
          mandatory
          class="mb-5"
        >
          <v-btn value="file" prepend-icon="mdi-upload-outline">Fichier</v-btn>
          <v-btn value="link" prepend-icon="mdi-link-variant">Lien / YouTube</v-btn>
        </v-btn-toggle>

        <!-- Upload fichier -->
        <div v-if="contentType === 'file'">
          <v-file-input
            v-model="selectedFile"
            label="Sélectionner un fichier (PDF, image, vidéo, audio)"
            :prepend-icon="null"
            prepend-inner-icon="mdi-upload-outline"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mp3,.ogg"
            variant="outlined"
            density="comfortable"
            show-size
            :error-messages="fileError"
            @update:model-value="onFileChange"
          />
          <v-progress-linear v-if="uploading" indeterminate color="primary" class="mt-2" rounded />
          <v-alert
            v-if="uploadedUrl"
            type="success"
            variant="tonal"
            density="compact"
            rounded="sm"
            class="mt-2"
            prepend-icon="mdi-check-circle-outline"
          >
            Fichier prêt : {{ uploadedFileName }}
          </v-alert>
        </div>

        <!-- URL libre (YouTube, site, etc.) -->
        <div v-else>
          <v-text-field
            v-model="form.content"
            label="URL (YouTube, site web, etc.)"
            prepend-inner-icon="mdi-link-variant"
            placeholder="https://..."
            variant="outlined"
            density="comfortable"
            :rules="[v => !!v?.trim() || 'L\'URL est obligatoire.']"
          />
          <!-- Aperçu YouTube -->
          <div v-if="youtubeEmbedId" class="mt-3 rounded-lg overflow-hidden" style="aspect-ratio: 16/9; max-height: 240px">
            <iframe
              :src="`https://www.youtube.com/embed/${youtubeEmbedId}`"
              class="w-100 h-100"
              style="border:none; display:block"
              allowfullscreen
            />
          </div>
        </div>

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
        >
          Publier la ressource
        </v-btn>
      </div>

    </v-form>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

// Upload fichier
const contentType     = ref('file')
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
  const url = form.value.content
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

  // Vérifier qu'il y a du contenu selon le mode
  if (contentType.value === 'file' && !form.value.media_url) {
    fileError.value = 'Veuillez sélectionner et uploader un fichier.'
    return
  }
  if (contentType.value === 'link' && !form.value.content?.trim()) {
    submitError.value = 'Veuillez entrer une URL.'
    return
  }

  submitting.value = true
  try {
    await api.post('/resources', form.value, true)
    router.push('/mes-ressources')
  } catch (e) {
    submitError.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>
