<template>
  <div>
    <FactCard />
    <SearchBar v-model="query" v-model:category="category" />
    <div
      v-if="!query"
      class="text-center font-cinzel text-[0.7rem] text-parchment/25 tracking-[0.15em] uppercase mt-4"
    >Type a name and press Enter to compare editions</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import FactCard from '../components/FactCard.vue'
import SearchBar from '../components/SearchBar.vue'

const router   = useRouter()
const query    = ref('')
const category = ref('Spell')

let timer = null
watch(query, val => {
  clearTimeout(timer)
  if (!val.trim()) return
  timer = setTimeout(() => router.push(`/compare/${category.value}/${val.trim()}`), 600)
})
</script>
