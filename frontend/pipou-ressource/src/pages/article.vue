<template>
  <ArticleHeader
    title="Les droits de l'enfant dans le monde numérique"
    content-type="Document PDF"
    :min-age="8"
    description="Cette ressource présente les droits fondamentaux de l'enfant à l'ère du numérique. Elle aborde les notions de vie privée, de consentement et de protection des données personnelles, dans un langage accessible aux jeunes apprenants."
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
    type="pdf"
    :file-url="pdfUrl"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import pdfUrl from '../assets/ressources/depression-1.pdf'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const authStore  = useAuthStore()
const isLoggedIn = ref(authStore.isLoggedIn)

// TODO : remplacer par l'id réel de la ressource une fois l'API branchée
const RESOURCE_ID = 1

const isFavorite = ref(false)
const favLoading = ref(false)

onMounted(async () => {
  if (!isLoggedIn.value) return
  try {
    const data = await api.get('/progress/dashboard', true)
    isFavorite.value = data.favorites?.some(f => f.id === RESOURCE_ID) ?? false
  } catch {}
})

async function toggleFavorite() {
  favLoading.value = true
  try {
    if (isFavorite.value) {
      await api.delete(`/progress/favorites/${RESOURCE_ID}`, true)
      isFavorite.value = false
    } else {
      await api.post(`/progress/favorites/${RESOURCE_ID}`, null, true)
      isFavorite.value = true
    }
  } catch (e) {
    console.error(e)
  } finally {
    favLoading.value = false
  }
}
</script>
