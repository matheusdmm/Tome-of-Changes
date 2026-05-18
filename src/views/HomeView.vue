<template>
  <div class="flex-1 flex flex-col justify-center">
    <FactCard />
    <SearchBar v-model="query" v-model:category="category" />
    <div
      v-if="!query"
      class="text-center font-cinzel text-[0.7rem] text-parchment/25 tracking-[0.15em] uppercase mt-4"
    >Type a name and press Enter to compare editions</div>

    <div v-if="!query && recentlyViewed.length" class="mt-6">
      <div class="font-cinzel text-[0.6rem] tracking-[0.15em] uppercase text-parchment/25 text-center mb-3">Recently Viewed</div>
      <div class="flex flex-wrap justify-center gap-2">
        <RouterLink
          v-for="item in recentlyViewed"
          :key="`${item.category}-${item.slug}`"
          :to="`/compare/${encodeURIComponent(item.category)}/${encodeURIComponent(item.name)}`"
          class="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-1 px-3 border border-gold/40 rounded-[1px] text-parchment/50 transition-all duration-200 hover:border-gold hover:text-gold"
        >{{ item.name }}</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import FactCard from '../components/FactCard.vue'
import SearchBar from '../components/SearchBar.vue'
import { usePageMeta } from '../composables/usePageMeta.js'
import { useRecentlyViewed } from '../composables/useRecentlyViewed.js'

usePageMeta(
  'Tome of Changes — D&D 5e 2014 vs 2024',
  'Compare D&D 5e spells, feats, creatures, conditions, magic items, and species between the 2014 and 2024 editions. Word-level diffs, stat comparisons, and instant search.',
)

const router   = useRouter()
const query    = ref('')
const category = ref('Spell')
const { recentlyViewed } = useRecentlyViewed()

let timer = null
watch(query, val => {
  clearTimeout(timer)
  if (!val.trim()) return
  timer = setTimeout(() => router.push(`/compare/${encodeURIComponent(category.value)}/${encodeURIComponent(val.trim())}`), 600)
})
</script>
