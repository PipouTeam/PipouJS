<template>
  <v-card
    max-width="550"
    class="mx-auto my-4 overflow-hidden"
    elevation="0"
    style="border: 1px solid #e0e0e0;"
  >
    <v-img
      :src="image" 
      height="250"
      cover
      class="align-end"
    >
      </v-img>

    <v-card-text class="pa-5">
      <div class="d-flex justify-end">
        <span class="text-primary font-italic font-weight-medium text-caption">
          {{relation}}
        </span>
      </div>

      <h3 class="text-h5 font-weight-bold text-primary mt-2 mb-4">
        {{titre}}
      </h3>

      <p class="text-body-1 text-grey-darken-3 mb-6">
        {{text}}
      </p>

      <div class="d-flex align-center justify-space-between mt-4">
        <v-chip
          variant="flat"
          color="#EEEEEE"
          class="px-4 text-lowercase font-weight-medium"
        >
         {{categorie}}
        </v-chip>

        <v-btn
          icon="mdi-arrow-right"
          variant="text"
          color="#00008B"
          size="large"
          class="font-weight-bold"
          :to="`/article/${id}`"
        ></v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/450x250'
  },
  relation: {
    type: String,
    default: 'Relationnelle'
  },
  titre: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  categorie: {
    type: String,
    default: 'Général'
  }
});
</script>
