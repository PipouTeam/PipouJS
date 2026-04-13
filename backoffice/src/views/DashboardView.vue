<template>
  <div>
    <h1 class="text-h4 mb-4">Dashboard</h1>
    <v-row>
      <v-col cols="12" md="4">
        <v-card color="primary" dark>
          <v-card-title>
            <v-icon left>mdi-account-group</v-icon>
            Utilisateurs
          </v-card-title>
          <v-card-text class="text-h5">{{ stats.users }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card color="success" dark>
          <v-card-title>
            <v-icon left>mdi-file-document</v-icon>
            Articles
          </v-card-title>
          <v-card-text class="text-h5">{{ stats.resources }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card color="warning" dark>
          <v-card-title>
            <v-icon left>mdi-account-check</v-icon>
            Actifs
          </v-card-title>
          <v-card-text class="text-h5">{{ stats.active }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref({ users: 0, resources: 0, active: 0 })

onMounted(async () => {
  try {
    const [usersRes, resourcesRes] = await Promise.all([
      axios.get('/api/users'),
      axios.get('/api/admin/resources')
    ])
    const users = usersRes.data.users || []
    stats.value.users = users.length
    stats.value.active = users.filter(u => u.is_active).length
    stats.value.resources = (resourcesRes.data.resources || []).length
  } catch (e) {
    console.error(e)
  }
})
</script>