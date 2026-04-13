<template>
  <v-layout class="fill-height">
    <v-app-bar color="primary" dark>
      <v-app-bar-title>Admin - PipouJS</v-app-bar-title>
      <v-spacer></v-spacer>
      <span class="mr-4">{{ user?.email }}</span>
      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item to="/" prepend-icon="mdi-view-dashboard" title="Dashboard"></v-list-item>
        <v-list-item to="/users" prepend-icon="mdi-account-group" title="Utilisateurs"></v-list-item>
        <v-list-item to="/resources" prepend-icon="mdi-file-document" title="Articles"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const drawer = ref(true)
const user = computed(() => authStore.user)

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>