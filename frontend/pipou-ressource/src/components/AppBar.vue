<template>
  <v-app-bar flex-column height="auto" flat class="border-b">
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
          <div 
            class="d-flex align-center cursor-pointer" 
            @click="$router.push(authLink)"
            style="cursor: pointer;"
          > 
            <h2 class="text-primary font-weight-bold mr-2 d-none d-md-flex">
              {{ authText }}
            </h2>
            
            <v-icon color="primary" :size="$vuetify.display.smAndDown ? 50 : 70">
              {{ authIcon }}
            </v-icon>
          </div>

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
        <v-tabs height="50" class="align-center">
          <v-tab 
            v-for="item in menuItems" 
            :key="item.title"
            :to="item.to"
            min-height="50" 
            class="text-caption text-uppercase"
            slider-color="primary"
            exact
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
import { useRouter } from 'vue-router'

const router = useRouter()
const menuModal = ref(false)

// GESTION DE L'AUTHENTIFICATION
// TODO : Gestion de l'authentification avec le store
const isLoggedIn = ref(false) 
const userName = ref('Stéphane')

const authText = computed(() => {
  return isLoggedIn.value ? userName.value : 'Connexion'
})

const authLink = computed(() => {
  return isLoggedIn.value ? '/compte' : '/connexion'
})

const authIcon = computed(() => {
  return isLoggedIn.value ? 'mdi-account' : 'mdi-account-outline'
})

const menuItems = [
  { title: 'Accueil', to: '/' },
  { title: 'Catalogue des Ressources', to: '/catalogue' },
  { title: 'Mon compte', to: '/compte' },
  { title: 'Mes ressources', to: '/mes-ressources' },
  { title: 'Créer une ressources', to: '/creer' },
  { title: 'Mention Légale', to: '/mentions' },
  { title: 'FAQ', to: '/faq' },
  { title: 'Contact', to: '/contact' },
]
</script>