<template>
  <div class="mb-3">
    <StatRow label="Level"     :value="spellLevel(spell)"        :changed="compare && spellLevel(spell) !== spellLevel(compare)" />
    <StatRow label="School"    :value="schoolName(spell.school)"  :changed="compare && schoolName(spell.school) !== schoolName(compare.school)" />
    <StatRow label="Cast Time" :value="spell.casting_time"        :changed="compare && spell.casting_time !== compare.casting_time" />
    <StatRow label="Range"     :value="spell.range"               :changed="compare && spell.range !== compare.range" />
    <StatRow label="Duration"  :value="spell.duration"            :changed="compare && spell.duration !== compare.duration" />
  </div>
</template>

<script setup>
import StatRow from './StatRow.vue'
import { spellLevel, schoolName } from '../composables/useOpen5e.js'
defineProps({ spell: Object, compare: { type: Object, default: null } })
</script>
