<template>
  <v-container class="mx-auto py-8" max-width="960">

    <h2 class="text-h5 font-weight-bold text-primary mb-6">
      <v-icon icon="mdi-star-outline" class="mr-2" />
      Ressources à la une
    </h2>

    <v-carousel
      height="420"
      show-arrows="hover"
      cycle
      interval="5000"
      hide-delimiter-background
      color="primary"
    >
      <v-carousel-item
        v-for="article in featuredArticles"
        :key="article.id"
        class="h-100"
      >
        <v-card class="h-100 overflow-hidden" rounded="lg" elevation="2">
          <v-row no-gutters class="h-100">

            <!-- Image -->
            <v-col cols="5" class="d-none d-md-flex">
              <v-img :src="article.image" cover height="100%" />
            </v-col>

            <!-- Contenu -->
            <v-col cols="12" md="7" class="d-flex flex-column justify-center pa-6">

              <v-chip
                color="primary"
                variant="tonal"
                size="small"
                rounded="sm"
                class="mb-3 align-self-start"
                prepend-icon="mdi-tag-outline"
              >
                {{ article.contentType }}
              </v-chip>

              <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-3" style="line-height: 1.3">
                {{ article.title }}
              </h3>

              <p class="text-body-2 text-grey-darken-1 mb-5" style="line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden">
                {{ article.description }}
              </p>

              <div>
                <v-btn
                  color="primary"
                  variant="flat"
                  rounded="sm"
                  append-icon="mdi-arrow-right"
                  :to="'/article'"
                >
                  Découvrir
                </v-btn>
              </div>

            </v-col>
          </v-row>
        </v-card>
      </v-carousel-item>
    </v-carousel>

  </v-container>
</template>

<script setup>
import imgCommunication from '@/assets/img/communication.jpg'
import imgConflit      from '@/assets/img/conflit.jpg'
import imgEcoute       from '@/assets/img/ecoute.jpg'
import imgLeadership   from '@/assets/img/leadership.jpg'
import imgStress       from '@/assets/img/stress-1.jpg'
import imgTutoring     from '@/assets/img/tutoring.jpg'

const featuredArticles = [
  {
    id: 1,
    title: 'Améliorer sa communication au quotidien',
    contentType: 'Vidéo pédagogique',
    description: "Découvrez les clés d'une communication bienveillante et efficace dans vos relations personnelles et professionnelles. Des outils concrets pour mieux s'exprimer et être compris.",
    image: imgCommunication,
  },
  {
    id: 2,
    title: 'Gérer le stress et prévenir l\'épuisement',
    contentType: 'Document PDF',
    description: "Un guide pratique pour identifier les sources de stress, comprendre ses mécanismes et adopter des stratégies durables pour préserver son équilibre mental et physique.",
    image: imgStress,
  },
  {
    id: 3,
    title: "L'écoute active : fondement de la relation d'aide",
    contentType: 'Fiche pratique',
    description: "Apprenez les techniques de l'écoute active pour mieux accompagner les personnes en difficulté. Une compétence essentielle pour les professionnels du soin et de l'éducation.",
    image: imgEcoute,
  },
]
</script>
