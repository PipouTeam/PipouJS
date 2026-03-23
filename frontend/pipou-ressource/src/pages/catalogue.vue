<template>
  <v-container>

    <v-row>
      <Title :message="pageTitle" class="mb-6" />
      <SearchBar 
        :categories="categories"
        :relations="relations"
        @filter="handleFilter"
      />

      <v-col 
        v-for="(ressource, index) in filteredRessources" 
        :key="index"
        cols="12" 
        sm="6" 
        md="4"
      >
        <CatalogueCard 
          :titre="ressource.titre"
          :relation="ressource.relation"
          :text="ressource.text"
          :categorie="ressource.categorie"
          :image="ressource.image"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';

const pageTitle = "Page de catalogue des ressources";

// Données moquées 
const ressources = ref([
  {
    titre: "Gérer son stress au travail",
    relation: "Professionnelle",
    text: "Apprenez les techniques de respiration et d'organisation pour mieux vivre votre quotidien.",
    categorie: "Bien-être",
    image: "https://cataas.com/cat?1"
  },
  {
    titre: "Communication non-violente",
    relation: "Personnelle",
    text: "Améliorez vos échanges avec vos proches grâce à la méthode CNV.",
    categorie: "Communication",
    image: "https://cataas.com/cat?2"
  },
  {
    titre: "Leadership Bienveillant",
    relation: "Professionnelle",
    text: "Comment motiver ses équipes en restant à l'écoute de leurs besoins.",
    categorie: "Management",
    image: "https://cataas.com/cat?3"
  },
  {
    titre: "L'art de l'écoute",
    relation: "Sociale",
    text: "Être présent pour l'autre sans juger, un pilier de la relation humaine.",
    categorie: "Empathie",
    image: "https://cataas.com/cat?4"
  },
  {
    titre: "Conflits de voisinage",
    relation: "Citoyenne",
    text: "Des pistes concrètes pour désamorcer les tensions du quotidien.",
    categorie: "Médiation",
    image: "https://cataas.com/cat?5"
  },
  {
    titre: "Le tutorat en entreprise",
    relation: "Professionnelle",
    text: "Transmettre ses compétences efficacement aux nouveaux arrivants.",
    categorie: "Formation",
    image: "https://cataas.com/cat?6"
  }
]);

const searchFilters = ref({
  search: '',
  category: null,
  relation: null
});

const handleFilter = (filters) => {
  searchFilters.value = filters;
};

const categories = computed(() => {
  const cats = ressources.value.map(r => r.categorie);
  return [...new Set(cats)].filter(Boolean).sort();
});

const relations = computed(() => {
  const rels = ressources.value.map(r => r.relation);
  return [...new Set(rels)].filter(Boolean).sort();
});

const filteredRessources = computed(() => {
  return ressources.value.filter(ressource => {
    let matchSearch = true;
    if (searchFilters.value.search) {
      const searchLower = searchFilters.value.search.toLowerCase();
      matchSearch = ressource.titre.toLowerCase().includes(searchLower) || 
                    ressource.text.toLowerCase().includes(searchLower);
    }
    
    let matchCategory = true;
    if (searchFilters.value.category) {
      matchCategory = ressource.categorie === searchFilters.value.category;
    }

    let matchRelation = true;
    if (searchFilters.value.relation) {
      matchRelation = ressource.relation === searchFilters.value.relation;
    }

    return matchSearch && matchCategory && matchRelation;
  });
});
</script>