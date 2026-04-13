<template>
  <v-container class="mx-auto py-10" max-width="700">

    <h1 class="text-h5 font-weight-bold text-primary mb-2">Contact</h1>
    <p class="text-body-2 text-grey-darken-1 mb-8">
      Une question, un signalement ou une suggestion ? Notre équipe vous répond dans les meilleurs délais.
    </p>

    <v-row dense align="start">

      <!-- Soso, responsable du service clientèle -->
      <v-col cols="12" sm="4" class="d-flex flex-column align-center mb-4 mb-sm-0">
        <v-img
          src="@/assets/soso.jpg"
          rounded="lg"
          cover
          max-width="220"
          aspect-ratio="1"
          class="w-100"
        />
        <p class="text-caption text-grey mt-2 text-center font-italic">
          Soso — Responsable du service clientèle
        </p>
      </v-col>

      <!-- Infos contact -->
      <v-col cols="12" sm="8">
        <v-row dense>

      <!-- Carte e-mail -->
      <v-col cols="12" sm="6">
        <v-card variant="outlined" rounded="lg" class="pa-5 h-100">
          <div class="d-flex align-center mb-3">
            <v-icon icon="mdi-email-outline" color="primary" class="mr-3" />
            <span class="text-subtitle-2 font-weight-bold">E-mail</span>
          </div>
          <a href="mailto:pipouteam@blizzard.net" class="text-primary text-body-2">
            pipouteam@blizzard.net
          </a>
          <p class="text-caption text-grey mt-2">Réponse sous 2 jours ouvrés.</p>
        </v-card>
      </v-col>

      <!-- Carte téléphone -->
      <v-col cols="12" sm="6">
        <v-card variant="outlined" rounded="lg" class="pa-5 h-100">
          <div class="d-flex align-center mb-3">
            <v-icon icon="mdi-phone-outline" color="primary" class="mr-3" />
            <span class="text-subtitle-2 font-weight-bold">Téléphone</span>
          </div>
          <p class="text-body-2 text-grey-darken-2">02 41 83 07 52</p>
          <p class="text-caption text-grey mt-2">Du lundi au vendredi, 9h – 18h.</p>
        </v-card>
      </v-col>

      <!-- Carte adresse -->
      <v-col cols="12" class="mt-2">
        <v-card variant="outlined" rounded="lg" class="pa-5">
          <div class="d-flex align-center mb-3">
            <v-icon icon="mdi-map-marker-outline" color="primary" class="mr-3" />
            <span class="text-subtitle-2 font-weight-bold">Adresse</span>
          </div>
          <p class="text-body-2 text-grey-darken-2">PipouTeam</p>
          <p class="text-body-2 text-grey-darken-2">Zone 52, Netherstorm</p>
          <p class="text-body-2 text-grey-darken-2">Outreterre, Azeroth</p>
        </v-card>
      </v-col>

      </v-row>
      </v-col>

    </v-row>

    <v-divider class="my-8" />

    <!-- Note -->
    <p class="text-caption text-grey text-center">
      Pour tout signalement de contenu inapproprié, merci de préciser le titre de la ressource concernée dans votre message.
    </p>

  </v-container>
</template>
