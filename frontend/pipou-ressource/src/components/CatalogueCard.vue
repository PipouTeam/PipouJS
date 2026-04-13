<template>
  <v-card
    max-width="550"
    class="mx-auto my-4 overflow-hidden"
    elevation="0"
    style="border: 1px solid #e0e0e0;"
  >
    <!-- Image de couverture ou placeholder par type -->
    <v-img
      v-if="previewImage"
      :src="previewImage"
      height="200"
      cover
      class="align-end"
    />
    <div v-else class="d-flex align-center justify-center" style="height: 160px; background: #F5F5F5">
      <v-icon :icon="typeIcon" size="48" color="grey-lighten-1" />
    </div>

    <v-card-text class="pa-5">
      <div class="d-flex justify-space-between align-center">
        <v-chip v-if="resourceType" variant="tonal" color="primary" size="x-small" rounded="sm">
          {{ resourceType }}
        </v-chip>
        <span class="text-primary font-italic font-weight-medium text-caption">
          {{ relation }}
        </span>
      </div>

      <h3 class="text-h5 font-weight-bold text-primary mt-2 mb-4">
        {{ titre }}
      </h3>

      <p class="text-body-1 text-grey-darken-3 mb-6" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
        {{ plainText }}
      </p>

      <div class="d-flex align-center justify-space-between mt-4">
        <v-chip
          variant="flat"
          color="#EEEEEE"
          class="px-4 text-lowercase font-weight-medium"
        >
          {{ categorie }}
        </v-chip>

        <v-btn
          icon="mdi-arrow-right"
          variant="text"
          color="#00008B"
          size="large"
          class="font-weight-bold"
          :to="`/ressources/${id}`"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id:           { type: [Number, String], required: true },
  thumbnailUrl: { type: String, default: '' },
  mediaUrl:     { type: String, default: '' },
  resourceType: { type: String, default: '' },
  relation:     { type: String, default: '' },
  titre:        { type: String, required: true },
  text:         { type: String, default: '' },
  categorie:    { type: String, default: '' },
})

const plainText = computed(() => {
  if (!props.text) return ''
  return props.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
})

const previewImage = computed(() => {
  if (props.thumbnailUrl) return props.thumbnailUrl
  if (props.mediaUrl && /\.(jpe?g|png|webp|gif)$/i.test(props.mediaUrl)) return props.mediaUrl
  return null
})

const typeIcon = computed(() => {
  const icons = {
    'Article':                    'mdi-text-box-outline',
    'Fiche de lecture':           'mdi-book-open-page-variant-outline',
    'Cours au format PDF':        'mdi-file-pdf-box',
    'Vidéo':                      'mdi-play-circle-outline',
    'Carte défi':                 'mdi-lightning-bolt',
    'Exercice / Atelier':         'mdi-pencil-ruler',
    'Activité / Jeu à réaliser':  'mdi-puzzle-outline',
    'Jeu en ligne':               'mdi-gamepad-variant-outline',
  }
  return icons[props.resourceType] || 'mdi-file-outline'
})
</script>
