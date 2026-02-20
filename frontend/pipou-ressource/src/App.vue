<template>
  <v-app>
    <app-bar></app-bar>
    <v-main  class="py-0">
      <v-container class="px-lg-15">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import AppBar from './components/AppBar.vue';

  //
</script>
