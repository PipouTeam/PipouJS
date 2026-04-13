<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Utilisateurs</h1>
      <v-btn color="primary" @click="openCreateDialog">
        <v-icon left>mdi-plus</v-icon>
        Ajouter staff
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="users"
      :loading="loading"
    >
      <template v-slot:item.is_active="{ item }">
        <v-chip :color="item.is_active ? 'success' : 'error'" size="small">
          {{ item.is_active ? 'Actif' : 'Inactif' }}
        </v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          v-if="item.is_active"
          size="small"
          color="error"
          variant="outlined"
          @click="toggleActive(item, false)"
        >
          Désactiver
        </v-btn>
        <v-btn
          v-else
          size="small"
          color="success"
          variant="outlined"
          @click="toggleActive(item, true)"
        >
          Activer
        </v-btn>
      </template>
    </v-data-table>

    <!-- Dialog pour créer un staff -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Créer un compte staff</v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="createStaff">
            <v-text-field v-model="newUser.email" label="Email" required></v-text-field>
            <v-text-field v-model="newUser.password" label="Mot de passe" type="password" required></v-text-field>
            <v-text-field v-model="newUser.first_name" label="Prénom" required></v-text-field>
            <v-text-field v-model="newUser.last_name" label="Nom" required></v-text-field>
            <v-select
              v-model="newUser.role"
              label="Rôle"
              :items="['moderator', 'admin']"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="createStaff" :loading="creating">Créer</v-btn>
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

const users = ref([])
const loading = ref(false)
const dialog = ref(false)
const creating = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const newUser = ref({
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  role: 'moderator'
})

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Email', key: 'email' },
  { title: 'Prénom', key: 'first_name' },
  { title: 'Nom', key: 'last_name' },
  { title: 'Rôle', key: 'role' },
  { title: 'Statut', key: 'is_active' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const fetchUsers = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/users')
    users.value = data.users || []
  } catch (e) {
    showSnackbar('Erreur lors du chargement', 'error')
  } finally {
    loading.value = false
  }
}

const toggleActive = async (user, active) => {
  try {
    const endpoint = active ? 'activate' : 'deactivate'
    await axios.put(`/api/users/${user.id}/${endpoint}`)
    user.is_active = active
    showSnackbar(active ? 'Utilisateur activé' : 'Utilisateur désactivé')
  } catch (e) {
    showSnackbar('Erreur lors de la modification', 'error')
  }
}

const openCreateDialog = () => {
  newUser.value = { email: '', password: '', first_name: '', last_name: '', role: 'moderator' }
  dialog.value = true
}

const createStaff = async () => {
  creating.value = true
  try {
    await axios.post('/api/users/staff', newUser.value)
    dialog.value = false
    showSnackbar('Compte staff créé')
    fetchUsers()
  } catch (e) {
    showSnackbar(e.response?.data?.message || 'Erreur lors de la création', 'error')
  } finally {
    creating.value = false
  }
}

const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

onMounted(fetchUsers)
</script>