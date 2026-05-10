<template>
  <div>
    <div class="text-center mb-8">
      <p class="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase text-parchment/40">✦ Saved Entries</p>
    </div>

    <div class="flex flex-col gap-6" v-if="favorites.length">
      <EntryCard v-for="entry in favorites" :key="`${entry.category}-${entry.name}`" :entry="entry" />
    </div>

    <div class="text-center py-16 px-8 text-parchment/30" v-else>
      <div class="font-cinzel text-3xl mb-4 opacity-20">♡</div>
      <div class="font-cinzel text-[0.85rem] tracking-[0.1em]">No favorites saved yet</div>
      <div class="font-cinzel text-[0.65rem] tracking-[0.1em] mt-2 opacity-60">Search for entries and hit ♡ Save to add them here</div>
    </div>
  </div>
</template>

<script setup>
import EntryCard from '../components/EntryCard.vue'
import { useFavorites } from '../composables/useFavorites.js'
import { usePageMeta } from '../composables/usePageMeta.js'

usePageMeta(
  'Favorites | Tome of Changes',
  'Your saved D&D 5e edition comparisons — spells, feats, creatures, and more, bookmarked for quick reference.',
)

const { favorites } = useFavorites()
</script>
