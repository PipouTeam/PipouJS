<template>
  <v-container class="mx-auto pb-12" max-width="960">

    <h2 class="text-h6 font-weight-bold text-grey-darken-3 mb-4">Contenu</h2>

    <v-card variant="outlined" rounded="lg" class="overflow-hidden">

      <!-- Lecteur vidéo (fichier) -->
      <video
        v-if="type === 'video'"
        controls
        class="w-100 d-block"
        style="max-height: 540px; background: #000"
      >
        <source :src="fileUrl" />
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>

      <!-- Vidéo YouTube -->
      <iframe
        v-else-if="type === 'youtube' && youtubeId"
        :src="`https://www.youtube.com/embed/${youtubeId}`"
        class="w-100 d-block"
        style="height: 75vh; border: none"
        allowfullscreen
        title="Vidéo YouTube"
      />

      <!-- Visionneuse PDF -->
      <iframe
        v-else-if="type === 'pdf'"
        :src="fileUrl"
        class="w-100 d-block"
        style="height: 75vh; border: none"
        title="Contenu PDF de l'article"
      />

      <!-- Contenu texte -->
      <div v-else-if="type === 'text'" class="pa-8">
        <p
          v-for="(paragraph, i) in paragraphs"
          :key="i"
          class="text-body-1 text-grey-darken-3 mb-4"
          style="line-height: 1.8"
        >
          {{ paragraph }}
        </p>
      </div>

      <!-- Type non pris en charge -->
      <div v-else class="pa-12 text-center">
        <v-icon icon="mdi-file-question-outline" size="64" color="grey-lighten-1" />
        <p class="text-body-1 text-grey mt-4">
          Aucun contenu disponible pour cet article.
        </p>
      </div>

    </v-card>

    <!-- Bouton téléchargement (PDF uniquement) -->
    <div v-if="type === 'pdf'" class="mt-6">
      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-download-outline"
        :href="fileUrl"
        :disabled="!fileUrl"
        download
      >
        Télécharger le fichier
      </v-btn>
    </div>

  </v-container>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type:    String,
  fileUrl: String,
})

const youtubeId = computed(() => {
  if (props.type !== 'youtube' || !props.fileUrl) return null
  const match = props.fileUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
})

const paragraphs = computed(() => {
  if (props.type !== 'text' || !props.fileUrl) return []
  return props.fileUrl.split(/\n+/).filter(p => p.trim())
})
</script>
