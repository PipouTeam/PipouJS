<template>
  <v-container>
    <Title :message=pageTitle />
    <SubTitle :message="pageSubtitle"/>
  </v-container>
</template>

<script setup>
  
  const pageTitle = "Bienvenue sur l’espace Ressource Relationnel";
  const pageSubtitle = "Voici les dernières ressources";

</script>
