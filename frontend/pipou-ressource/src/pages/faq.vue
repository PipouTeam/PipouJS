<template>
  <v-container class="mx-auto py-10" max-width="800">

    <h1 class="text-h5 font-weight-bold text-primary mb-2">Foire aux questions</h1>
    <p class="text-body-2 text-grey-darken-1 mb-8">Retrouvez les réponses aux questions les plus fréquentes sur la plateforme.</p>

    <v-expansion-panels variant="accordion" rounded="lg">

      <!-- Utilisation générale -->
      <v-expansion-panel>
        <v-expansion-panel-title class="font-weight-medium">
          Qu'est-ce que Ressource Relationnelle ?
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-body-2 text-grey-darken-2">
          Ressource Relationnelle est une plateforme collaborative dédiée au bien-être mental et aux relations humaines.
          Elle permet de partager, consulter et favoriser des ressources pédagogiques — articles, vidéos, podcasts, jeux — autour de thématiques
          telles que la communication, la parentalité, la gestion du stress ou encore la vie professionnelle.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title class="font-weight-medium">
          Dois-je créer un compte pour accéder aux ressources ?
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-body-2 text-grey-darken-2">
          Non. Les ressources publiques sont accessibles sans inscription depuis le catalogue.
          Cependant, créer un compte vous permet d'ajouter des ressources à vos favoris, de suivre votre progression
          et de contribuer à la plateforme en publiant vos propres ressources.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title class="font-weight-medium">
          Comment créer un compte ?
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-body-2 text-grey-darken-2">
          Rendez-vous sur la page <a href="/connexion" class="text-primary">Connexion</a> puis cliquez sur l'onglet
          « Créer un compte ». Renseignez votre prénom, nom, adresse e-mail et un mot de passe d'au moins 8 caractères.
          Votre compte est créé instantanément.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Ressources -->
      <v-expansion-panel>
        <v-expansion-panel-title class="font-weight-medium">
          Comment publier une ressource ?
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-body-2 text-grey-darken-2">
          Une fois connecté, accédez à la page <a href="/mes-ressources" class="text-primary">Mes ressources</a> et cliquez
          sur « Nouvelle ressource ». Vous pouvez soumettre un fichier PDF, une vidéo YouTube ou un contenu textuel.
          Les ressources publiques sont soumises à une validation par notre équipe de modération avant d'être visibles dans le catalogue.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title class="font-weight-medium">
          Quels types de contenu sont acceptés ?
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-body-2 text-grey-darken-2">
          La plateforme accepte les formats suivants :
          <ul class="mt-2 pl-4">
            <li>Documents <strong>PDF</strong> (jusqu'à 20 Mo)</li>
            <li>Vidéos <strong>YouTube</strong> (via URL)</li>
            <li>Contenus <strong>textuels</strong> rédigés directement sur la plateforme</li>
          </ul>
          Les contenus doivent être en lien avec les thématiques du bien-être relationnel et respecter notre charte éditoriale.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title class="font-weight-medium">
          Pourquoi ma ressource n'est-elle pas visible dans le catalogue ?
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-body-2 text-grey-darken-2">
          Les ressources publiées avec une visibilité « publique » passent par un processus de modération avant d'être accessibles à tous.
          Ce délai permet de garantir la qualité et la pertinence des contenus proposés.
          Vous pouvez suivre le statut de vos ressources depuis la page <a href="/mes-ressources" class="text-primary">Mes ressources</a>.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Favoris -->
      <v-expansion-panel>
        <v-expansion-panel-title class="font-weight-medium">
          Comment ajouter une ressource à mes favoris ?
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-body-2 text-grey-darken-2">
          Sur la page d'un article, cliquez sur le bouton « Ajouter aux favoris » (visible si vous êtes connecté).
          Vos favoris sont ensuite retrouvables depuis la section dédiée de votre page
          <a href="/compte" class="text-primary">Mon compte</a>, avec la possibilité de les filtrer par catégorie ou type.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Compte -->
      <v-expansion-panel>
        <v-expansion-panel-title class="font-weight-medium">
          Comment modifier mes informations personnelles ?
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-body-2 text-grey-darken-2">
          Rendez-vous sur la page <a href="/compte" class="text-primary">Mon compte</a>.
          La section « Informations personnelles » vous permet de mettre à jour votre prénom, nom et adresse e-mail.
          Vous pouvez également y modifier votre mot de passe.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title class="font-weight-medium">
          J'ai oublié mon mot de passe, que faire ?
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-body-2 text-grey-darken-2">
          La fonctionnalité de réinitialisation de mot de passe est en cours de développement.
          En attendant, contactez-nous directement via la page <a href="/contact" class="text-primary">Contact</a>
          afin que notre équipe puisse vous aider.
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Modération -->
      <v-expansion-panel>
        <v-expansion-panel-title class="font-weight-medium">
          Comment signaler un contenu inapproprié ?
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-body-2 text-grey-darken-2">
          Si vous identifiez un contenu qui ne respecte pas notre charte ou qui vous semble inapproprié,
          contactez-nous via la page <a href="/contact" class="text-primary">Contact</a> en précisant le titre de la ressource concernée.
          Notre équipe de modération traitera votre signalement dans les plus brefs délais.
        </v-expansion-panel-text>
      </v-expansion-panel>

    </v-expansion-panels>

  </v-container>
</template>
