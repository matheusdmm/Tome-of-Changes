<template>
  <div class="text-center py-12 text-parchment/90">
    <h2 class="font-cinzel text-xl mb-4">Page not found</h2>
    <p class="mb-4">This page or comparison category is not available.</p>
    <RouterLink to="/" class="underline">Search the Tome</RouterLink>
  </div>
</template>
<script setup>
import { usePageMeta } from '../composables/usePageMeta.js'
usePageMeta('Page not found | Tome of Changes', 'Return to the Tome of Changes search.')
</script>
