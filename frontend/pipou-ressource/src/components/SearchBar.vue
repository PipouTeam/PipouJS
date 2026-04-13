<template>
  <v-container fluid class="py-4">
    <v-row no-gutters class="align-center">

      <v-col cols="12" sm="3" class="pr-sm-2 mb-2 mb-sm-0">
        <v-select
          v-model="selectedCategory"
          :items="categories"
          item-title="name"
          item-value="id"
          label="Catégorie"
          variant="filled"
          flat
          hide-details
          clearable
          bg-color="#F0F0F0"
          class="rounded-0"
        />
      </v-col>

      <v-col cols="12" sm="3" class="px-sm-2 mb-2 mb-sm-0">
        <v-select
          v-model="selectedRelation"
          :items="relations"
          item-title="name"
          item-value="id"
          label="Type de relation"
          variant="filled"
          flat
          hide-details
          clearable
          bg-color="#F0F0F0"
          class="rounded-0"
        />
      </v-col>

      <v-col cols="12" sm="2" class="px-sm-2 mb-2 mb-sm-0">
        <v-select
          v-model="selectedResourceType"
          :items="resourceTypes"
          item-title="name"
          item-value="id"
          label="Type"
          variant="filled"
          flat
          hide-details
          clearable
          bg-color="#F0F0F0"
          class="rounded-0"
        />
      </v-col>

      <v-col cols="12" sm="4" class="pl-sm-2">
        <v-text-field
          v-model="searchQuery"
          placeholder="Recherche"
          variant="filled"
          hide-details
          bg-color="#F0F0F0"
          class="search-field rounded-0"
        >
          <template v-slot:append-inner>
            <v-btn
              icon="mdi-magnify"
              color="#00008B"
              theme="dark"
              class="rounded-0 search-btn text-left"
              height="56"
              width="56"
              @click="handleSearch"
            />
          </template>
        </v-text-field>
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'

defineProps({
  categories:    { type: Array, default: () => [] },
  relations:     { type: Array, default: () => [] },
  resourceTypes: { type: Array, default: () => [] },
})

const emit = defineEmits(['filter'])

const searchQuery = ref('')
const selectedCategory = ref(null)
const selectedRelation = ref(null)
const selectedResourceType = ref(null)

const handleSearch = () => {
  emit('filter', {
    search: searchQuery.value,
    category_id: selectedCategory.value,
    relation_type_id: selectedRelation.value,
    resource_type_id: selectedResourceType.value,
  })
}

watch([searchQuery, selectedCategory, selectedRelation, selectedResourceType], () => {
  handleSearch()
})
</script>
