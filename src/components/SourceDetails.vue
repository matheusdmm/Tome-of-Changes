<template>
  <div v-if="source" class="text-sm text-parchment/80 mb-3 leading-relaxed">
    <p><a v-if="source.url" :href="source.url" target="_blank" rel="noopener noreferrer" class="underline">{{ source.name }}</a><span v-else>{{ source.name }}</span></p>
    <p>{{ source.version }}</p>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { sourceDetails } from '../utils/sourceDetails.js'
const props = defineProps({ record: Object })
const source = computed(() => sourceDetails(props.record))
</script>
