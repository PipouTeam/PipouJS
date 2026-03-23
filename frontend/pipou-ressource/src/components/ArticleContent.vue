<template>
  <v-container class="mx-auto" max-width="100%">

    <!--En attendant qu'on ait la BDD, filtre sur un type String qui existe pas-->
    
    <img v-if="type === 'image'" :src="fileUrl" class="w-100"/>

    <video v-else-if="type === 'video'" controls class="w-100">
      <source :src="fileUrl">
      
    </video>

    <iframe v-else-if="type === 'pdf'" :src="fileUrl" class="w-100"></iframe>

    <!-- fichier inconnu pas le choix on met du WOW -->
    <img v-else src="../assets/pepe-the-explorer.jpg" alt="not found" class="w-100">

  </v-container>
</template>

<script>
export default {
  props: {
    type: String,
    fileUrl: String
  }
}
</script>