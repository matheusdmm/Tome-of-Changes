<template>
  <details class="text-sm" @toggle="open = $event.target.open">
    <summary class="cursor-pointer border border-gold/40 rounded-sm px-2 py-1">Collections</summary>
    <div v-if="open" class="my-2 space-y-2 border border-gold/20 p-3 text-parchment/90">
      <label v-for="collection in collections" :key="collection.id" class="flex gap-2 items-center">
        <input type="checkbox" :checked="contains(collection.id, entry)" @change="toggleMembership(collection.id, entry)" />
        {{ collection.name }}
      </label>
      <p v-if="!collections.length">No collections yet.</p>
      <RouterLink to="/favorites" class="block underline">Manage collections</RouterLink>
      <p class="text-xs">Adding an entry also saves it in Favorites.</p>
    </div>
  </details>
</template>
<script setup>
import { ref } from 'vue'
import { useCollections } from '../composables/useCollections.js'
defineProps({ entry: { type: Object, required: true } })
const { collections, contains, toggleMembership } = useCollections()
const open = ref(false)
</script>
