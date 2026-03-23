<template>
        <h1 class="text-h5 text-black my-0  mt-2">
          {{ message }}
        </h1>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    default: 'Valeur par défaut' 
  }
});
</script>