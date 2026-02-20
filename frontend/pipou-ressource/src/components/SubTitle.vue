<template>
      <div class="my-3">
        <h1 class="text-h5 text-black my-0">
          {{ message }}
        </h1>
      </div>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    default: 'Valeur par défaut' 
  }
});
</script>