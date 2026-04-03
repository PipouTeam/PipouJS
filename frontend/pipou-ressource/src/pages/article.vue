<template>
  <ArticleHeader
    title="Les droits de l'enfant dans le monde numérique"
    content-type="Document PDF"
    :min-age="8"
    description="Cette ressource présente les droits fondamentaux de l'enfant à l'ère du numérique. Elle aborde les notions de vie privée, de consentement et de protection des données personnelles, dans un langage accessible aux jeunes apprenants."
  />

  <ArticleContent
    type="pdf"
    :file-url="pdfUrl"
  />
</template>

<script setup>
import pdfUrl from '../assets/ressources/depression-1.pdf'
</script>
