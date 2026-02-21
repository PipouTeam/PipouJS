<template>
        <h1 class="text-h4 text-black my-0 font-weight-bold">
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