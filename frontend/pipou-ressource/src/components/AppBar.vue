<template>
  <v-app-bar flat class="border-b" :height="mdAndUp ? 120 : 64">

    <v-container fluid class="pa-0 h-100 d-flex flex-column justify-center">

      <!-- ── Ligne 1 : logo + auth + burger ─────────────────────────────── -->
      <div class="d-flex align-center px-4 px-lg-12" style="flex: 0 0 auto">

        <!-- Logo -->
        <div class="d-flex align-center cursor-pointer" style="cursor:pointer" @click="router.push('/')">
          <v-img src="@/assets/logo.png" :width="mdAndUp ? 200 : 140" contain />
          <span
            class="d-none d-sm-block font-weight-bold ml-2 text-primary"
            :class="mdAndUp ? 'text-h5' : 'text-body-1'"
            style="line-height:1.25"
          >
            Ressource<br>Relationnelle
          </span>
        </div>

        <v-spacer />

        <!-- Bouton connexion / nom utilisateur -->
        <v-btn
          color="primary"
          :variant="isLoggedIn ? 'tonal' : 'flat'"
          rounded="sm"
          :prepend-icon="isLoggedIn ? 'mdi-account' : 'mdi-login'"
          :size="mdAndUp ? 'default' : 'small'"
          @click="router.push(authLink)"
        >
          {{ authText }}
        </v-btn>

        <!-- Burger (mobile uniquement) -->
        <v-btn
          icon="mdi-menu"
          variant="text"
          color="primary"
          class="d-md-none ml-2"
          @click.stop="drawer = true"
        />
      </div>

      <!-- ── Ligne 2 : onglets (desktop uniquement) ──────────────────────── -->
      <template v-if="mdAndUp">
        <v-divider class="mt-1" />
        <v-tabs height="44" class="align-center" :model-value="route.path">
          <v-tab
            v-for="item in menuItems"
            :key="item.title"
            :value="item.to"
            min-height="44"
            class="text-caption text-uppercase"
            slider-color="primary"
            @click="router.push(item.to)"
          >
            {{ item.title }}
          </v-tab>
        </v-tabs>
      </template>

    </v-container>
  </v-app-bar>

  <!-- ── Drawer mobile ──────────────────────────────────────────────────── -->
  <v-navigation-drawer v-model="drawer" temporary location="right">
    <v-list-item
      prepend-icon="mdi-close"
      title="Menu"
      class="py-4"
      @click="drawer = false"
    />
    <v-divider />
    <v-list nav class="mt-2">
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :title="item.title"
        :to="item.to"
        rounded="lg"
        @click="drawer = false"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth'

const authStore     = useAuthStore()
const router        = useRouter()
const route         = useRoute()
const { mdAndUp }   = useDisplay()
const drawer        = ref(false)

const isLoggedIn = computed(() => authStore.isLoggedIn)
const authLink   = computed(() => isLoggedIn.value ? '/compte' : '/connexion')
const authText   = computed(() => {
  if (!isLoggedIn.value) return 'Connexion'
  const name = mdAndUp.value
    ? authStore.userName
    : authStore.user?.first_name ?? authStore.userName
  return name.length > 18 ? name.slice(0, 16).trimEnd() + '…' : name
})

const menuItems = computed(() => [
  { title: 'Accueil', to: '/' },
  { title: 'Catalogue', to: '/catalogue' },
  ...(isLoggedIn.value ? [
    { title: 'Mon compte', to: '/compte' },
    { title: 'Mes ressources', to: '/mes-ressources' },
  ] : []),
  { title: 'Mentions légales', to: '/mentions' },
  { title: 'FAQ', to: '/faq' },
  { title: 'Contact', to: '/contact' },
])
</script>
