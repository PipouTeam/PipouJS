<template>
  <v-container class="mx-auto pt-8 pb-2" max-width="960">
    <Title :message="pageTitle" />

    <p class="text-body-1 text-grey-darken-2 mt-4 mb-8" style="line-height: 1.75; text-align: justify">
      Bienvenue sur la plateforme de ressources relationnelles, mise à disposition par le Ministère
      de la Santé et de la Prévention. Cet espace a pour vocation d’accompagner chacun dans la
      compréhension et la gestion de ses relations, qu’elles soient personnelles, professionnelles
      ou sociales. Vous y trouverez des ressources pédagogiques sélectionnées — vidéos, documents
      et fiches pratiques — pour mieux communiquer, gérer les conflits et développer l’écoute.
    </p>

    <v-divider class="border-opacity-25 mb-2" />
  </v-container>

  <FeaturedCarousel />
</template>

<script setup>
const pageTitle = "Bienvenue sur l’espace Ressource Relationnelle"
</script>
