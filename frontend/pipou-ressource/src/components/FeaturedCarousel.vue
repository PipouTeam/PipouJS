<template>
  <v-container class="mx-auto py-8" max-width="960">

    <h2 class="text-h5 font-weight-bold text-primary mb-6">
      <v-icon icon="mdi-star-outline" class="mr-2" />
      Ressources à la une
    </h2>

    <!-- Chargement -->
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-carousel
      v-else-if="resources.length"
      height="420"
      show-arrows="hover"
      cycle
      interval="5000"
      hide-delimiter-background
      color="primary"
    >
      <v-carousel-item
        v-for="r in resources"
        :key="r.id"
        class="h-100"
      >
        <v-card class="h-100 overflow-hidden" rounded="lg" elevation="2">
          <v-row no-gutters class="h-100">

            <!-- Image -->
            <v-col cols="5" class="d-none d-md-flex">
              <v-img v-if="r.thumbnail_url" :src="r.thumbnail_url" cover height="100%" />
              <div v-else class="w-100 h-100 d-flex align-center justify-center" :style="`background: ${typeColor(r.resource_type)}`">
                <v-icon :icon="typeIcon(r.resource_type)" size="64" color="white" />
              </div>
            </v-col>

            <!-- Contenu -->
            <v-col cols="12" md="7" class="d-flex flex-column justify-center pa-6">

              <v-chip
                color="primary"
                variant="tonal"
                size="small"
                rounded="sm"
                class="mb-3 align-self-start"
                prepend-icon="mdi-tag-outline"
              >
                {{ r.resource_type }}
              </v-chip>

              <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-3" style="line-height: 1.3">
                {{ r.title }}
              </h3>

              <p class="text-body-2 text-grey-darken-1 mb-5" style="line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden">
                {{ plainText(r.content) }}
              </p>

              <div>
                <v-btn
                  color="primary"
                  variant="flat"
                  rounded="sm"
                  append-icon="mdi-arrow-right"
                  :to="`/ressources/${r.id}`"
                >
                  Découvrir
                </v-btn>
              </div>

            </v-col>
          </v-row>
        </v-card>
      </v-carousel-item>
    </v-carousel>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'

const resources = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await api.get('/resources?limit=5&sort=created_at')
    resources.value = data.resources ?? []
  } catch (e) {
    console.error('Erreur chargement ressources à la une:', e)
  } finally {
    loading.value = false
  }
})

const plainText = (html) => {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

const typeIcon = (type) => ({
  'Article': 'mdi-text-box-outline',
  'Fiche de lecture': 'mdi-book-open-page-variant-outline',
  'Cours au format PDF': 'mdi-file-pdf-box',
  'Vidéo': 'mdi-play-circle-outline',
  'Carte défi': 'mdi-lightning-bolt',
  'Exercice / Atelier': 'mdi-pencil-ruler',
  'Activité / Jeu à réaliser': 'mdi-puzzle-outline',
  'Jeu en ligne': 'mdi-gamepad-variant-outline',
}[type] || 'mdi-file-outline')

const typeColor = (type) => ({
  'Article': '#4A90D9',
  'Fiche de lecture': '#2C3E50',
  'Cours au format PDF': '#27AE60',
  'Vidéo': '#8E44AD',
  'Carte défi': '#E67E22',
  'Exercice / Atelier': '#16A085',
  'Activité / Jeu à réaliser': '#D35400',
  'Jeu en ligne': '#C0392B',
}[type] || '#95A5A6')
</script>
