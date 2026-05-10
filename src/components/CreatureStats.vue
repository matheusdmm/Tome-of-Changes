<template>
  <div class="mb-3">
    <StatRow label="CR"   :value="creature.challenge_rating_text" :changed="compare && creature.challenge_rating_text !== compare.challenge_rating_text" />
    <StatRow label="Type" :value="typeName(creature.type)" />
    <StatRow label="Size" :value="sizeName(creature.size)" />
    <StatRow label="HP"   :value="creature.hit_points ? `${creature.hit_points} (${creature.hit_dice})` : '—'" />
    <StatRow label="AC"   :value="creature.armor_class ? String(creature.armor_class) : '—'" />
  </div>
</template>

<script setup>
import StatRow from './StatRow.vue'
defineProps({ creature: Object, compare: { type: Object, default: null } })
function typeName(t) { return (typeof t === 'string' ? t : t?.name) || '—' }
function sizeName(s) { return (typeof s === 'string' ? s : s?.name) || '—' }
</script>
