<template>
  <span class="whitespace-pre-wrap italic text-base leading-[1.8] text-parchment/90">
    <span
      v-for="(token, i) in tokens"
      :key="i"
      :class="{
        'bg-crimson/30 text-[var(--color-diff-removed)] line-through rounded-sm px-px': token.type === 'removed',
        'bg-v2024/20 text-[var(--color-diff-added)] underline rounded-sm px-px': token.type === 'added',
        'not-italic block my-3 text-sm text-parchment/80': token.type === 'omitted',
      }"
    >{{ token.text }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ tokens: { type: Array, default: () => [] }, side: String })

const tokens = computed(() => {
  const all = props.tokens
  if (props.side === 'a') return all.filter(t => t.type !== 'added')
  if (props.side === 'b') return all.filter(t => t.type !== 'removed')
  return all
})
</script>
