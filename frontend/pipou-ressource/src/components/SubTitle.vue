<template>
  <v-container>
        <h1 class="text-h5 text-black my-0">
          {{ message }}
        </h1>
  </v-container>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    default: 'Valeur par défaut' 
  }
});
</script>