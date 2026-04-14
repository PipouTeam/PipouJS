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
    </div>

    <v-divider class="mb-6 border-opacity-25" />

    <!-- Description -->
    <p class="text-body-1 text-grey-darken-3" style="max-width: 72ch; line-height: 1.75">
      {{ description }}
    </p>

  </v-container>
</template>

<script setup>
const props = defineProps({
  title:       { type: String, default: "Nom de la ressource" },
  contentType: { type: String, default: 'Document' },
  description: { type: String, default: '' },
  parentTitle: { type: String, default: '' },
  parentTo:    { type: String, default: '' },
})

const breadcrumbs = [
  { title: 'Accueil', to: '/' },
  { title: props.parentTitle || 'Catalogue', to: props.parentTo || '/catalogue' },
  { title: props.contentType || 'Ressource', disabled: true },
]
</script>
