<template>

  <!-- ===== MODE GRILLE ===== -->
  <v-row v-if="view === 'grid'">
    <v-col v-for="r in items" :key="r.id" cols="12" sm="6" md="4">
      <v-card class="card-grid overflow-hidden" elevation="0" rounded="lg" style="border: 1px solid #e0e0e0;">
        <!-- Thumbnail ou placeholder couleur -->
        <v-img v-if="r.thumbnail_url" :src="r.thumbnail_url" height="200" cover />
        <div v-else class="d-flex align-center justify-center" :style="`height: 180px; background: ${typeColor(r.resource_type)}`">
          <v-icon :icon="typeIcon(r.resource_type)" size="48" color="white" />
        </div>

        <v-card-text class="pa-5 pb-3">
          <!-- Ligne métadonnées : Type · Relation ... [fav] [bookmark] -->
          <div class="d-flex align-center ga-2 mb-2">
            <v-chip v-if="r.resource_type" size="x-small" variant="tonal" color="primary" rounded="sm">{{ r.resource_type }}</v-chip>
            <span v-if="showRelation && r.relation_type" class="text-caption text-grey-darken-1">·</span>
            <span v-if="showRelation && r.relation_type" class="text-primary font-italic font-weight-medium text-caption">{{ r.relation_type }}</span>
            <v-spacer />
            <template v-if="showProgress">
              <v-btn :icon="favoriteIds.has(r.id) ? 'mdi-heart' : 'mdi-heart-outline'" size="x-small" variant="text" density="comfortable" :color="favoriteIds.has(r.id) ? '#E53935' : '#bbb'" @click.prevent.stop="$emit('toggle-favorite', r)" />
              <v-btn :icon="savedIds.has(r.id) ? 'mdi-bookmark' : 'mdi-bookmark-outline'" size="x-small" variant="text" density="comfortable" :color="savedIds.has(r.id) ? '#1E88E5' : '#bbb'" @click.prevent.stop="$emit('toggle-saved', r)" />
            </template>
          </div>

          <!-- Titre -->
          <h3 class="text-h6 font-weight-bold text-primary mb-2" style="line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            {{ r.title }}
          </h3>

          <!-- Statut + Visibilité -->
          <div v-if="showStatus" class="d-flex ga-5 mb-2">
            <v-chip size="x-small" :color="statusColor(r.status)" variant="tonal" rounded="sm">{{ statusLabel(r.status) }}</v-chip>
            <v-chip v-if="r.visibility" size="x-small" :color="visibilityColor(r.visibility)" variant="tonal" rounded="sm">{{ visibilityLabel(r.visibility) }}</v-chip>
          </div>

          <!-- Extrait -->
          <p v-if="showExcerpt && r.content" class="text-body-2 text-grey-darken-3 mb-3" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
            {{ plainText(r.content) }}
          </p>

          <!-- Bas : catégorie + actions -->
          <div class="d-flex align-center justify-space-between mt-2">
            <v-chip v-if="r.category" variant="flat" color="#EEEEEE" class="px-3 text-lowercase font-weight-medium" size="small">
              {{ r.category }}
            </v-chip>
            <v-spacer />
            <div class="d-flex align-center" @click.prevent.stop>
              <v-btn v-if="showStatus && r.share_token" icon="mdi-share-variant-outline" size="x-small" variant="text" color="primary" @click="$emit('share', r)" />
              <v-btn v-if="showStatus" icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="$emit('delete', r)" />
              <v-btn v-if="removeIcon" :icon="removeIcon" size="x-small" variant="text" :color="removeColor" :loading="r._removing" @click="$emit('remove', r)" />
            </div>
            <v-btn icon="mdi-arrow-right" variant="text" color="#00008B" size="small" class="font-weight-bold" :to="`/ressources/${r.id}`" />
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- ===== MODE COMPACT ===== -->
  <div v-else-if="view === 'compact'" class="d-flex flex-column" style="gap: 8px">
    <v-card v-for="r in items" :key="r.id" class="card-compact" variant="outlined" rounded="lg" :to="`/ressources/${r.id}`">
      <div class="d-flex">
        <v-img v-if="r.thumbnail_url" :src="r.thumbnail_url" width="80" min-height="72" cover class="flex-shrink-0" style="border-radius: 12px 0 0 12px" />
        <div v-else class="d-flex align-center justify-center flex-shrink-0" :style="`width: 80px; min-height: 72px; background: ${typeColor(r.resource_type)}; border-radius: 12px 0 0 12px`">
          <v-icon :icon="typeIcon(r.resource_type)" size="28" color="white" />
        </div>

        <div class="flex-grow-1 pa-3 d-flex flex-column justify-center min-width-0">
          <p class="font-weight-bold text-body-1 text-truncate mb-1">{{ r.title }}</p>
          <p v-if="showExcerpt && r.content" class="text-caption text-grey-darken-2 text-truncate mb-1">{{ plainText(r.content) }}</p>
          <div class="d-flex flex-wrap gap-2 align-center">
            <v-chip v-if="r.resource_type" size="x-small" variant="tonal" color="primary" rounded="sm">{{ r.resource_type }}</v-chip>
            <v-chip v-if="r.category" size="x-small" variant="tonal" color="grey" rounded="sm">{{ r.category }}</v-chip>
            <v-chip v-if="showRelation && r.relation_type" size="x-small" variant="tonal" color="secondary" rounded="sm">{{ r.relation_type }}</v-chip>
            <v-chip v-if="showStatus" size="x-small" :color="statusColor(r.status)" variant="tonal" rounded="sm">{{ statusLabel(r.status) }}</v-chip>
            <v-chip v-if="showStatus && r.visibility" size="x-small" :color="visibilityColor(r.visibility)" variant="tonal" rounded="sm">{{ visibilityLabel(r.visibility) }}</v-chip>
            <v-spacer />
            <div class="d-flex align-center" @click.prevent.stop>
              <v-btn v-if="showProgress" :icon="favoriteIds.has(r.id) ? 'mdi-heart' : 'mdi-heart-outline'" size="x-small" variant="text" :color="favoriteIds.has(r.id) ? 'error' : 'grey'" @click="$emit('toggle-favorite', r)" />
              <v-btn v-if="showProgress" :icon="savedIds.has(r.id) ? 'mdi-bookmark' : 'mdi-bookmark-outline'" size="x-small" variant="text" :color="savedIds.has(r.id) ? 'info' : 'grey'" @click="$emit('toggle-saved', r)" />
              <v-btn v-if="showStatus && r.share_token" icon="mdi-share-variant-outline" size="x-small" variant="text" color="primary" @click="$emit('share', r)" />
              <v-btn v-if="showStatus" icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="$emit('delete', r)" />
              <v-btn v-if="removeIcon" :icon="removeIcon" size="x-small" variant="text" :color="removeColor" :loading="r._removing" @click="$emit('remove', r)" />
            </div>
          </div>
        </div>
      </div>
    </v-card>
  </div>

  <!-- ===== MODE MINIMAL ===== -->
  <div v-else class="d-flex flex-column" style="gap: 6px">
    <v-card v-for="r in items" :key="r.id" class="card-minimal" variant="flat" rounded="lg" :to="`/ressources/${r.id}`">
      <div class="d-flex align-center">
        <div class="type-bar flex-shrink-0" :style="`background: ${typeColor(r.resource_type)}`" />
        <v-icon :icon="typeIcon(r.resource_type)" size="26" :color="typeColor(r.resource_type)" class="mx-4 flex-shrink-0" />
        <div class="flex-grow-1 py-3 min-width-0">
          <p class="font-weight-semibold text-body-2 text-truncate mb-1">{{ r.title }}</p>
          <div class="d-flex flex-wrap gap-1 align-center text-caption text-grey">
            <span>{{ r.resource_type }}</span>
            <span v-if="r.category">· {{ r.category }}</span>
            <span v-if="showRelation && r.relation_type">· {{ r.relation_type }}</span>
            <v-chip v-if="showStatus" size="x-small" :color="statusColor(r.status)" variant="tonal" rounded="sm" class="ml-1">{{ statusLabel(r.status) }}</v-chip>
          </div>
        </div>
        <div class="d-flex align-center gap-1 pr-3 flex-shrink-0" @click.prevent.stop>
          <v-btn v-if="showProgress" :icon="favoriteIds.has(r.id) ? 'mdi-heart' : 'mdi-heart-outline'" size="x-small" variant="text" :color="favoriteIds.has(r.id) ? 'error' : 'grey'" @click="$emit('toggle-favorite', r)" />
          <v-btn v-if="showProgress" :icon="savedIds.has(r.id) ? 'mdi-bookmark' : 'mdi-bookmark-outline'" size="x-small" variant="text" :color="savedIds.has(r.id) ? 'info' : 'grey'" @click="$emit('toggle-saved', r)" />
          <v-btn v-if="showStatus && r.share_token" icon="mdi-share-variant-outline" size="x-small" variant="text" color="primary" @click="$emit('share', r)" />
          <v-btn v-if="showStatus" icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="$emit('delete', r)" />
          <v-btn v-if="removeIcon" :icon="removeIcon" size="x-small" variant="text" :color="removeColor" :loading="r._removing" @click="$emit('remove', r)" />
        </div>
      </div>
    </v-card>
  </div>

</template>

<script setup>
defineProps({
  items:        { type: Array, required: true },
  view:         { type: String, default: 'grid' },
  showStatus:   { type: Boolean, default: false },
  showProgress: { type: Boolean, default: false },
  showRelation: { type: Boolean, default: false },
  showExcerpt:  { type: Boolean, default: false },
  favoriteIds:  { type: Set, default: () => new Set() },
  savedIds:     { type: Set, default: () => new Set() },
  removeIcon:   { type: String, default: '' },
  removeColor:  { type: String, default: 'grey' },
})

defineEmits(['delete', 'remove', 'share', 'toggle-favorite', 'toggle-saved'])

const plainText = (html) => {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

const typeIcon = (type) => ({
  'Article': 'mdi-text-box-outline',
  'Fiche de lecture': 'mdi-book-open-page-variant-outline',
  'Cours au format PDF': 'mdi-file-pdf-box',
  'Vidéo': 'mdi-play-circle-outline',
  'Carte défi': 'mdi-lightning-bolt',
  'Exercice / Atelier': 'mdi-pencil-ruler',
  'Activité / Jeu à réaliser': 'mdi-puzzle-outline',
  'Jeu en ligne': 'mdi-gamepad-variant-outline',
}[type] || 'mdi-file-outline')

const typeColor = (type) => ({
  'Article': '#4A90D9',
  'Fiche de lecture': '#2C3E50',
  'Cours au format PDF': '#27AE60',
  'Vidéo': '#8E44AD',
  'Carte défi': '#E67E22',
  'Exercice / Atelier': '#16A085',
  'Activité / Jeu à réaliser': '#D35400',
  'Jeu en ligne': '#C0392B',
}[type] || '#95A5A6')

const statusLabel     = s => ({ draft: 'Brouillon', pending: 'En attente', validated: 'Validé', suspended: 'Suspendu' }[s] ?? s)
const statusColor     = s => ({ draft: 'grey', pending: 'warning', validated: 'success', suspended: 'error' }[s] ?? 'grey')
const visibilityLabel = v => ({ public: 'Public', shared: 'Partagé', private: 'Privé' }[v] ?? v)
const visibilityColor = v => ({ public: 'success', shared: 'info', private: 'grey' }[v] ?? 'grey')
</script>

<style scoped>
.card-grid {
  transition: box-shadow 0.15s;
}
.card-grid:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.card-compact {
  transition: transform 0.15s, box-shadow 0.15s;
}
.card-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.card-minimal {
  border: 1px solid #eee;
  transition: background 0.15s;
}
.card-minimal:hover {
  background: #F8FAFC;
}

.type-bar {
  width: 5px;
  align-self: stretch;
  border-radius: 10px 0 0 10px;
}
</style>
