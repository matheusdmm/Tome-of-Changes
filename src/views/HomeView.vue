<template>
  <div class="flex-1 flex flex-col justify-center">
    <div class="text-center max-w-2xl mx-auto mb-6">
      <h2 class="font-cinzel text-xl text-gold-bright mb-3">See what changed in D&amp;D 2024</h2>
      <p class="text-parchment/80 leading-relaxed">Compare D&amp;D 5e 2014 vs 2024 spells, feats, creatures, conditions, magic items, and species. Read available SRD text side by side, with highlighted edits and stat changes.</p>
      <p class="text-parchment/80 text-sm mt-2">Rules load from Open5e. Coverage is limited to the SRDs, rather than every entry in the published books.</p>
    </div>
    <FactCard />
    <SearchBar v-model="query" v-model:category="category" @submit="submit" />
    <p class="text-center text-sm text-parchment/80 mb-3">Browse comparisons by category</p>
    <CategoryLinks />
    <div
      v-if="!query"
      class="text-center font-cinzel text-[0.7rem] text-parchment/80 tracking-[0.15em] uppercase mt-4"
    >Type a name to compare editions, or press Enter to search now</div>

    <div v-if="!query && recentlyViewed.length" class="mt-6">
      <div class="font-cinzel text-[0.6rem] tracking-[0.15em] uppercase text-parchment/80 text-center mb-3">Recently Viewed</div>
      <div class="flex flex-wrap justify-center gap-2">
        <RouterLink
          v-for="item in recentlyViewed"
          :key="`${item.category}-${item.slug}`"
          :to="`/compare/${encodeURIComponent(item.category)}/${encodeURIComponent(item.name)}`"
          class="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase py-1 px-3 border border-gold/40 rounded-[1px] text-parchment/80 transition-all duration-200 hover:border-gold hover:text-gold"
        >{{ item.name }}</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import FactCard from '../components/FactCard.vue'
import SearchBar from '../components/SearchBar.vue'
import CategoryLinks from '../components/CategoryLinks.vue'
import { usePageMeta } from '../composables/usePageMeta.js'
import { useRecentlyViewed } from '../composables/useRecentlyViewed.js'

usePageMeta(
  'Tome Of Changes — See What Changed in D&D 2024',
  'Compare D&D 5e 2014 vs 2024 spells, feats, creatures, conditions, magic items, and species. See highlighted text and stat changes in available SRD rules.',
)

const router   = useRouter()
const query    = ref('')
const category = ref('Spell')
const { recentlyViewed } = useRecentlyViewed()

let timer = null
function submit() {
  clearTimeout(timer)
  if (query.value.trim()) router.push(`/compare/${encodeURIComponent(category.value)}/${encodeURIComponent(query.value.trim())}`)
}
watch([query, category], ([val]) => {
  clearTimeout(timer)
  if (!val.trim()) return
  timer = setTimeout(submit, 600)
})
onUnmounted(() => clearTimeout(timer))
</script>
