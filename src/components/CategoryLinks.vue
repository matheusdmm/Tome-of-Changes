<template>
  <nav aria-label="Browse comparison categories" class="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-parchment/90">
    <RouterLink v-for="(meta, key) in CATEGORIES" :key="key"
      :to="key === 'Condition' ? '/conditions' : `/browse/${key}`"
      :aria-current="route.name === 'conditions' && key === 'Condition' || route.name === 'browse' && route.params.category === key ? 'page' : undefined"
      class="underline hover:text-gold">{{ meta.label }}</RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { CATEGORIES } from '../composables/useOpen5e.js'
const route = useRoute()
</script>
