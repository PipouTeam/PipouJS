<template>
  <v-app-bar flex-column height="auto" flat class="border-b">
    <v-container fluid class="pa-0">
      <v-row no-gutters class="d-flex align-center justify-space-between justify-lg-space-around px-lg-15 py-0 my-0">
        
        <div class="d-flex py-0 cursor-pointer" 
          @click="$router.push('/')"
          style="cursor: pointer;"
        >          <v-img 
            src="@/assets/logo.png" 
            :width="$vuetify.display.smAndDown ? 180 : 230"  
            contain
          ></v-img>
          
          <h1 class="px-2 pt-4 d-none d-sm-flex text-md-h4 text-h5 font-weight-bold" style="line-height: 1.2;">
            Ressource <br>Relationnelle
          </h1>
        </div>

        <div 
          class="d-flex align-center cursor-pointer" 
          @click="$router.push('/compte')"
          style="cursor: pointer;"
        >          
          <h2 class="text-primary font-weight-bold mr-2 d-none d-md-flex">Stéphane</h2>
          
          <v-icon color="primary" :size="$vuetify.display.smAndDown ? 50 : 70">
            mdi-account
          </v-icon>

          <v-btn
            icon="mdi-menu"
            variant="text"
            color="primary"
            class="d-md-none ml-2"
            @click="menuModal = true"
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


  <!--Debut du menu burger-->
  <v-dialog v-model="menuModal" fullscreen transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar color="white" flat>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="primary" @click="menuModal = false" class="text-none font-weight-bold text-h6">
          Fermer <v-icon icon="mdi-close" end></v-icon>
        </v-btn>
      </v-toolbar>

      <v-container class="px-6">
        <h2 class="text-primary d-flex align-center mb-2 font-weight-bold ">
          <v-icon class="mr-2" size="small">mdi-cog</v-icon> Paramètre d'accessibilité
        </h2>
        
        <v-divider class="border-opacity-100" color="primary" :thickness="2" style="max-width: 300px;"></v-divider>

        <div class="d-flex flex-column">
          <v-btn 
            v-for="item in menuItems" 
            :key="item.title"
            block 
            variant="outlined" 
            color="grey-lighten-2"
            class="mb-4 py-8 justify-start text-none text-black elevation-1 bg-white"
            style="border-radius: 4px; border-color: #e0e0e0 !important;"
            :to="item.to"
            @click="menuModal = false"
          >
            <span class="text-h6 font-weight-medium text-black">{{ item.title }}</span>
          </v-btn>
        </div>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const menuModal = ref(false)

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