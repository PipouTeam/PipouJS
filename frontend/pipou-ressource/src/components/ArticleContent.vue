<template>
  <v-container class="mx-auto pb-12" max-width="960">

    <h2 class="text-h6 font-weight-bold text-grey-darken-3 mb-4">Contenu</h2>

    <v-card variant="outlined" rounded="lg" class="overflow-hidden">

      <!-- Lecteur vidéo -->
      <video
        v-if="type === 'video'"
        controls
        class="w-100 d-block"
        style="max-height: 540px; background: #000"
      >
        <source :src="fileUrl" />
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>

      <!-- Visionneuse PDF -->
      <iframe
        v-else-if="type === 'pdf'"
        :src="fileUrl"
        class="w-100 d-block"
        style="height: 75vh; border: none"
        title="Contenu PDF de l'article"
      />

      <!-- Type non pris en charge -->
      <div v-else class="pa-12 text-center">
        <v-icon icon="mdi-file-question-outline" size="64" color="grey-lighten-1" />
        <p class="text-body-1 text-grey mt-4">
          Aucun contenu disponible pour cet article.
        </p>
      </div>

    </v-card>

    <!-- Bouton téléchargement -->
    <div class="mt-6">
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
defineProps({
  type:    String,
  fileUrl: String,
})
</script>
