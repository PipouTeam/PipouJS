<template>
  <div class="text-center py-16">
    <v-icon :icon="icon" size="64" color="grey-lighten-1" />
    <p class="text-body-1 text-grey mt-4">{{ message }}</p>
    <v-btn v-if="actionLabel" color="primary" variant="tonal" rounded="sm" class="mt-4" :to="actionTo">
      {{ actionLabel }}
    </v-btn>
  </div>
</template>

<script setup>
defineProps({
  icon:        { type: String, default: 'mdi-folder-open-outline' },
  message:     { type: String, required: true },
  actionLabel: { type: String, default: '' },
  actionTo:    { type: String, default: '/' },
})
</script>
