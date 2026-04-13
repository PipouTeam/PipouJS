<template>
  <v-container class="mx-auto py-8" max-width="960">

    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold text-primary">Mes ressources</h1>
        <p class="text-body-2 text-grey-darken-1 mt-1">Gérez les ressources que vous avez publiées.</p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        rounded="sm"
        prepend-icon="mdi-plus"
        to="/creer"
      >
        Nouvelle ressource
      </v-btn>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Erreur -->
    <v-alert v-else-if="error" type="error" variant="tonal" rounded="sm">{{ error }}</v-alert>

    <!-- Liste vide -->
    <div v-else-if="resources.length === 0" class="text-center py-16">
      <v-icon icon="mdi-folder-open-outline" size="64" color="grey-lighten-1" />
      <p class="text-body-1 text-grey mt-4">Vous n'avez pas encore publié de ressource.</p>
      <v-btn color="primary" variant="tonal" rounded="sm" class="mt-4" to="/creer">
        Créer ma première ressource
      </v-btn>
    </div>

    <!-- Tableau -->
    <v-card v-else variant="outlined" rounded="lg">
      <v-table>
        <thead>
          <tr>
            <th class="text-left font-weight-bold">Titre</th>
            <th class="text-left font-weight-bold">Type</th>
            <th class="text-left font-weight-bold">Catégorie</th>
            <th class="text-left font-weight-bold">Visibilité</th>
            <th class="text-left font-weight-bold">Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in resources" :key="r.id">
            <td class="font-weight-medium">{{ r.title }}</td>
            <td class="text-grey-darken-1">{{ r.resource_type || '—' }}</td>
            <td class="text-grey-darken-1">{{ r.category || '—' }}</td>
            <td>
              <v-chip size="x-small" :color="visibilityColor(r.visibility)" variant="tonal" rounded="sm">
                {{ visibilityLabel(r.visibility) }}
              </v-chip>
            </td>
            <td>
              <v-chip size="x-small" :color="statusColor(r.status)" variant="tonal" rounded="sm">
                {{ statusLabel(r.status) }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-btn icon="mdi-pencil-outline" size="small" variant="text" color="primary" />
              <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="confirmDelete(r)" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog confirmation suppression -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold pt-4 px-4">Supprimer la ressource</v-card-title>
        <v-card-text class="px-4 pb-0">
          Voulez-vous vraiment supprimer <strong>{{ toDelete?.title }}</strong> ? Cette action est irréversible.
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Annuler</v-btn>
          <v-btn color="error" variant="flat" rounded="sm" :loading="deleteLoading" @click="handleDelete">
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'

const resources     = ref([])
const loading       = ref(true)
const error         = ref('')
const deleteDialog  = ref(false)
const deleteLoading = ref(false)
const toDelete      = ref(null)

onMounted(async () => {
  try {
    const data = await api.get('/resources/mine', true)
    resources.value = data.resources
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function confirmDelete(resource) {
  toDelete.value = resource
  deleteDialog.value = true
}

async function handleDelete() {
  deleteLoading.value = true
  try {
    await api.delete(`/resources/${toDelete.value.id}`, true)
    resources.value = resources.value.filter(r => r.id !== toDelete.value.id)
    deleteDialog.value = false
  } catch (e) {
    error.value = e.message
  } finally {
    deleteLoading.value = false
  }
}

const visibilityLabel = v => ({ public: 'Public', shared: 'Partagé', private: 'Privé' }[v] ?? v)
const visibilityColor = v => ({ public: 'success', shared: 'info', private: 'grey' }[v] ?? 'grey')
const statusLabel     = s => ({ draft: 'Brouillon', pending: 'En attente', validated: 'Validé', suspended: 'Suspendu' }[s] ?? s)
const statusColor     = s => ({ draft: 'grey', pending: 'warning', validated: 'success', suspended: 'error' }[s] ?? 'grey')
</script>
