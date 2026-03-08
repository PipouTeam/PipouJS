<template>
  <v-container class="mx-auto" max-width="100%">
    <v-row align="start">
      <v-col cols="12" md="4">
        <v-img
          aspect-ratio="16/9"
          max-height="500"
          max-width="100%"
          cover
          src="https://cataas.com/cat"
        >
        </v-img>
      </v-col>

      <v-col cols="12" md="8">
        <Title :message="pageTitle" />
        <SubTitle :message="pageSubtitle" />

        <v-btn
          class="mt-4"
          variant="tonal"
        >
          Télécharger
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>

const pageTitle = 'Nom de l\'article'
const pageSubtitle = 'Auteur de la ressource'

</script>