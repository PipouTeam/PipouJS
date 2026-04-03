<template>
  <v-container class="mx-auto pt-8 pb-4" max-width="960">

    <!-- Fil d'Ariane -->
    <v-breadcrumbs :items="breadcrumbs" class="px-0 pb-6 text-caption">
      <template #divider>
        <v-icon icon="mdi-chevron-right" size="x-small" />
      </template>
    </v-breadcrumbs>

    <!-- Titre -->
    <h1 class="text-h4 font-weight-bold text-primary mb-5" style="line-height: 1.25">
      {{ title }}
    </h1>

    <!-- Badges métadonnées -->
    <div class="d-flex flex-wrap ga-2 mb-6">
      <v-chip
        color="primary"
        variant="tonal"
        prepend-icon="mdi-tag-outline"
        rounded="sm"
      >
        {{ contentType }}
      </v-chip>

      <v-chip
        color="secondary"
        variant="tonal"
        prepend-icon="mdi-account-child-outline"
        rounded="sm"
      >
        À partir de {{ minAge }} ans
      </v-chip>
    </div>

    <v-divider class="mb-6 border-opacity-25" />

    <!-- Description -->
    <p class="text-body-1 text-grey-darken-3" style="max-width: 72ch; line-height: 1.75">
      {{ description }}
    </p>

  </v-container>
</template>

<script setup>
defineProps({
  title:       { type: String, default: "Nom de l'article" },
  contentType: { type: String, default: 'Document' },
  minAge:      { type: Number, default: 6 },
  description: { type: String, default: "Description de l'article." },
})

const breadcrumbs = [
  { title: 'Accueil',   to: '/' },
  { title: 'Catalogue', to: '/catalogue' },
  { title: 'Article',   disabled: true },
]
</script>
