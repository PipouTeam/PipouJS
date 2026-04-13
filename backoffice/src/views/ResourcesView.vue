<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Articles</h1>
      <div>
        <v-btn color="primary" @click="openCreateDialog" class="mr-2">
          <v-icon left>mdi-plus</v-icon>
          Créer
        </v-btn>
      </div>
    </div>

    <v-card class="mb-4">
      <v-card-text class="d-flex align-center" style="gap: 8px; flex-wrap: wrap;">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Rechercher..."
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class=""
          style="width: 200px;"
        ></v-text-field>
        <v-select
          v-model="filters.category_id"
          label="Catégorie"
          :items="categories"
          item-title="name"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
          class="mt-5"
          style="width: 70px;"
          @update:model-value="applyFilters"
        ></v-select>
        <v-select
          v-model="filters.relation_type_id"
          label="Relation"
          :items="relationTypes"
          item-title="name"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
          class="mt-5"
          style="width: 70px;"
          @update:model-value="applyFilters"
        ></v-select>
        <v-select
          v-model="filters.resource_type_id"
          label="Ressource"
          :items="resourceTypes"
          item-title="name"
          item-value="id"
          clearable
          density="compact"
          variant="outlined"
          class="mt-5"
          style="width: 70px;"
          @update:model-value="applyFilters"
        ></v-select>
        <v-select
          v-model="filters.status"
          label="Statut"
          :items="statuses"
          clearable
          density="compact"
          variant="outlined"
          class="mt-5"
          style="width: 70px;"
          @update:model-value="applyFilters"
        ></v-select>
        <v-btn color="grey-darken-1" variant="outlined" @click="resetFilters" style="height: 40px;">
          <v-icon left size="small">mdi-filter-remove</v-icon>
          Reset
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="resources"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item.category="{ item }">
          {{ item.category || '-' }}
        </template>
        <template v-slot:item.relation_type="{ item }">
          {{ item.relation_type || '-' }}
        </template>
        <template v-slot:item.resource_type="{ item }">
          {{ item.resource_type || '-' }}
        </template>
        <template v-slot:item.author="{ item }">
          {{ item.author_first_name }} {{ item.author_last_name }}
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small">
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:item.visibility="{ item }">
          <v-chip :color="item.visibility === 'public' ? 'success' : 'warning'" size="small">
            {{ item.visibility }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn size="small" color="primary" variant="text" @click="editResource(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn size="small" color="error" variant="text" @click="deleteResource(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog pour créer/modifier -->
    <v-dialog v-model="dialog" max-width="700">
      <v-card>
        <v-card-title>{{ editMode ? 'Modifier' : 'Créer' }} un article</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="resource.title" label="Titre" required></v-text-field>
            <v-textarea v-model="resource.content" label="Contenu" rows="5"></v-textarea>
            <v-select
              v-model="resource.category_id"
              label="Catégorie"
              :items="categories"
              item-title="name"
              item-value="id"
              clearable
            ></v-select>
            <v-select
              v-model="resource.relation_type_id"
              label="Type de relation"
              :items="relationTypes"
              item-title="name"
              item-value="id"
              clearable
            ></v-select>
            <v-select
              v-model="resource.resource_type_id"
              label="Type de ressource"
              :items="resourceTypes"
              item-title="name"
              item-value="id"
              clearable
            ></v-select>
            <v-select
              v-model="resource.visibility"
              label="Visibilité"
              :items="['public', 'shared', 'private']"
            ></v-select>
            <v-select
              v-if="editMode"
              v-model="resource.status"
              label="Statut"
              :items="['draft', 'pending', 'validated', 'suspended']"
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="saveResource" :loading="saving">
            {{ editMode ? 'Mettre à jour' : 'Créer' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const resources = ref([])
const categories = ref([])
const relationTypes = ref([])
const resourceTypes = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editMode = ref(false)
const search = ref('')
const filters = ref({
  category_id: null,
  relation_type_id: null,
  resource_type_id: null,
  status: null
})
const statuses = ['draft', 'pending', 'validated', 'suspended']
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const resource = ref({
  id: null,
  title: '',
  content: '',
  category_id: null,
  relation_type_id: null,
  resource_type_id: null,
  visibility: 'public',
  status: 'validated'
})

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Titre', key: 'title' },
  { title: 'Catégorie', key: 'category' },
  { title: 'Type relation', key: 'relation_type' },
  { title: 'Type ressource', key: 'resource_type' },
  { title: 'Auteur', key: 'author' },
  { title: 'Statut', key: 'status' },
  { title: 'Vues', key: 'views' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const getStatusColor = (status) => {
  const colors = {
    draft: 'grey',
    pending: 'warning',
    validated: 'success',
    suspended: 'error'
  }
  return colors[status] || 'grey'
}

const fetchResources = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.category_id) params.append('category_id', filters.value.category_id)
    if (filters.value.relation_type_id) params.append('relation_type_id', filters.value.relation_type_id)
    if (filters.value.resource_type_id) params.append('resource_type_id', filters.value.resource_type_id)
    if (filters.value.status) params.append('status', filters.value.status)

    const { data } = await axios.get(`/api/admin/resources?${params.toString()}`)
    resources.value = data.resources || []
  } catch (e) {
    showSnackbar('Erreur lors du chargement', 'error')
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  fetchResources()
}

const resetFilters = () => {
  filters.value = {
    category_id: null,
    relation_type_id: null,
    resource_type_id: null,
    status: null
  }
  fetchResources()
}

const fetchOptions = async () => {
  try {
    const [catRes, relRes, typeRes] = await Promise.all([
      axios.get('/api/categories'),
      axios.get('/api/relation-types'),
      axios.get('/api/resource-types')
    ])
    categories.value = catRes.data.categories || []
    relationTypes.value = relRes.data.relation_types || []
    resourceTypes.value = typeRes.data.resource_types || []
  } catch (e) {
    console.error(e)
  }
}

const openCreateDialog = () => {
  editMode.value = false
  resource.value = {
    id: null,
    title: '',
    content: '',
    category_id: null,
    relation_type_id: null,
    resource_type_id: null,
    visibility: 'public',
    status: 'validated'
  }
  dialog.value = true
}

const editResource = (item) => {
  editMode.value = true
  resource.value = { ...item }
  dialog.value = true
}

const saveResource = async () => {
  saving.value = true
  try {
    if (editMode.value) {
      await axios.put(`/api/admin/resources/${resource.value.id}`, resource.value)
      showSnackbar('Article mis à jour')
    } else {
      await axios.post('/api/admin/resources', resource.value)
      showSnackbar('Article créé')
    }
    dialog.value = false
    fetchResources()
  } catch (e) {
    showSnackbar(e.response?.data?.message || 'Erreur lors de la sauvegarde', 'error')
  } finally {
    saving.value = false
  }
}

const deleteResource = async (item) => {
  if (!confirm('Voulez-vous vraiment supprimer cet article ?')) return
  try {
    await axios.delete(`/api/admin/resources/${item.id}`)
    showSnackbar('Article supprimé')
    fetchResources()
  } catch (e) {
    showSnackbar('Erreur lors de la suppression', 'error')
  }
}

const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

onMounted(() => {
  fetchResources()
  fetchOptions()
})
</script>