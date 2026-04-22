<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Types de relations</h1>
      <v-btn color="primary" @click="openDialog()">
        <v-icon left>mdi-plus</v-icon>
        Ajouter
      </v-btn>
    </div>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn size="small" color="primary" variant="text" @click="openDialog(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn size="small" color="error" variant="text" @click="deleteItem(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>{{ editMode ? 'Modifier' : 'Ajouter' }} un type de relation</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" label="Nom" required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="save" :loading="saving">Enregistrer</v-btn>
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

const items = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)
const editMode = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const form = ref({ id: null, name: '' })

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nom', key: 'name' },
  { title: 'Créé le', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const fetchItems = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/relation-types')
    items.value = data.relation_types || []
  } catch (e) {
    showSnackbar('Erreur lors du chargement', 'error')
  } finally {
    loading.value = false
  }
}

const openDialog = (item = null) => {
  if (item) {
    editMode.value = true
    form.value = { id: item.id, name: item.name }
  } else {
    editMode.value = false
    form.value = { id: null, name: '' }
  }
  dialog.value = true
}

const save = async () => {
  saving.value = true
  try {
    if (editMode.value) {
      await axios.put(`/api/relation-types/${form.value.id}`, { name: form.value.name })
      showSnackbar('Type de relation mis à jour')
    } else {
      await axios.post('/api/relation-types', { name: form.value.name })
      showSnackbar('Type de relation créé')
    }
    dialog.value = false
    fetchItems()
  } catch (e) {
    showSnackbar(e.response?.data?.message || 'Erreur lors de la sauvegarde', 'error')
  } finally {
    saving.value = false
  }
}

const deleteItem = async (item) => {
  if (!confirm('Voulez-vous vraiment supprimer ce type de relation ?')) return
  try {
    await axios.delete(`/api/relation-types/${item.id}`)
    showSnackbar('Type de relation supprimé')
    fetchItems()
  } catch (e) {
    showSnackbar(e.response?.data?.message || 'Erreur lors de la suppression', 'error')
  }
}

const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

onMounted(fetchItems)
</script>