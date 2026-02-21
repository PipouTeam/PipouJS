<template>
  <v-container>
    <v-row align="start">
      <v-col cols="12" md="6">
        <v-img
          class="w-300"
          aspect-ratio="16/9"
          cover
          src="https://cataas.com/cat"
        >
        </v-img>
      </v-col>

      <v-col cols="12" md="6">
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