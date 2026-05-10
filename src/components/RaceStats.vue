<template>
  <div class="mb-3">
    <StatRow label="Size"  :value="speciesSize(race.traits)"  :changed="compare && speciesSize(race.traits) !== speciesSize(compare.traits)" />
    <StatRow label="Speed" :value="speciesSpeed(race.traits)"  :changed="compare && speciesSpeed(race.traits) !== speciesSpeed(compare.traits)" />
  </div>
</template>

<script setup>
import StatRow from './StatRow.vue'
import { speciesSize, speciesSpeed } from '../composables/useOpen5e.js'
defineProps({ race: Object, compare: { type: Object, default: null } })
</script>
