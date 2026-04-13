<template>
  <v-app-bar flex-column :height="$vuetify.display.mdAndUp ? 160 : 80" flat class="border-b">
    <v-container fluid class="pa-0">
      <v-row no-gutters class="d-flex align-center justify-space-between justify-lg-space-around px-lg-15 py-0 my-0">
        
        <div class="d-flex py-0 cursor-pointer" @click="$router.push('/')" style="cursor: pointer;">
          <v-img 
            src="@/assets/logo.png" 
            :width="$vuetify.display.smAndDown ? 180 : 230"  
            contain
          ></v-img>
          <h1 class="px-2 pt-4 d-none d-sm-flex text-md-h4 text-h5 font-weight-bold" style="line-height: 1.2;">
            Ressource <br>Relationnelle
          </h1>
        </div>

        <div class="d-flex align-center">
          <v-btn
            color="primary"
            :variant="isLoggedIn ? 'tonal' : 'flat'"
            rounded="sm"
            :prepend-icon="isLoggedIn ? 'mdi-account' : 'mdi-login'"
            @click="$router.push(authLink)"
          >
            {{ authText }}
          </v-btn>

          <v-btn
            icon="mdi-menu"
            variant="text"
            color="primary"
            class="d-md-none ml-2"
            @click.stop="menuModal = true"
          ></v-btn>
        </div>
      </v-row>

      <v-divider class="d-none d-md-flex"></v-divider>

      <div class="d-none d-md-flex justify-center py-0">
        <v-tabs height="50" class="align-center" :model-value="$route.path">
          <v-tab
            v-for="item in menuItems"
            :key="item.title"
            :value="item.to"
            min-height="50"
            class="text-caption text-uppercase"
            slider-color="primary"
            @click="$router.push(item.to)"
          >
            {{ item.title }}
          </v-tab>
        </v-tabs>
      </div>
    </v-container>
  </v-app-bar>

  </template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const menuModal = ref(false)

const isLoggedIn = computed(() => authStore.isLoggedIn)

const authText = computed(() => authStore.isLoggedIn ? authStore.userName : 'Connexion')
const authLink = computed(() => authStore.isLoggedIn ? '/compte' : '/connexion')


const menuItems = [
  { title: 'Accueil', to: '/' },
  { title: 'Catalogue des Ressources', to: '/catalogue' },
  { title: 'Mon compte', to: '/compte' },
  { title: 'Mes ressources', to: '/mes-ressources' },
  { title: 'Créer une ressource', to: '/creer' },
  { title: 'Mentions Légales', to: '/mentions' },
  { title: 'FAQ', to: '/faq' },
  { title: 'Contact', to: '/contact' },
]
</script>