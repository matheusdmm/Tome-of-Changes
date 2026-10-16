<template>
  <fieldset class="border border-gold/30 rounded-sm p-4 mb-6 text-parchment/90">
    <legend class="px-2 font-cinzel text-sm">Filter comparisons</legend>
    <div class="flex flex-wrap gap-4">
      <label v-if="category === 'Spell'" class="space-y-1">Spell level
        <select :value="filters.level" aria-label="Spell level" class="block bg-input-bg border border-gold/40 p-2" @change="update('level', $event.target.value)">
          <option value="">All levels</option><option v-for="level in 10" :key="level" :value="String(level - 1)">{{ level === 1 ? 'Cantrip' : level - 1 }}</option>
        </select>
      </label>
      <label v-if="category === 'Spell'" class="space-y-1">School
        <select :value="selectedValue('school')" aria-label="Spell school" class="block bg-input-bg border border-gold/40 p-2" @change="update('school', $event.target.value)"><option value="">All schools</option><option v-for="school in choices('school')" :key="school">{{ school }}</option></select>
      </label>
      <label v-if="category === 'Creature'" class="space-y-1">Challenge rating
        <select :value="selectedValue('cr')" aria-label="Challenge rating" class="block bg-input-bg border border-gold/40 p-2" @change="update('cr', $event.target.value)"><option value="">All CRs</option><option v-for="cr in choices('cr')" :key="cr" :value="cr">{{ crLabel(cr) }}</option></select>
      </label>
      <label v-if="category === 'Creature'" class="space-y-1">Creature type
        <select :value="selectedValue('type')" aria-label="Creature type" class="block bg-input-bg border border-gold/40 p-2" @change="update('type', $event.target.value)"><option value="">All types</option><option v-for="type in choices('type')" :key="type">{{ type }}</option></select>
      </label>
      <label class="space-y-1">Comparison status
        <select :value="filters.change" aria-label="Comparison status" class="block bg-input-bg border border-gold/40 p-2" @change="update('change', $event.target.value)"><option value="all">All entries</option><option value="changed">Changed</option><option value="unchanged">Unchanged in compared fields</option><option value="unpaired">Unpaired or unavailable</option></select>
      </label>
      <button class="underline self-end py-2" @click="$emit('reset')">Clear filters</button>
    </div>
    <p class="text-sm mt-3">Filters match a single edition's fields. Both editions stay visible for comparison.</p>
  </fieldset>
</template>
<script setup>
import { filterChoices, canonicalCR, crLabel } from '../utils/entryFilters.js'
const props = defineProps({ category: String, entries: Array, filters: Object })
const emit = defineEmits(['update', 'reset'])
function currentValue(field) { return field === 'cr' ? canonicalCR(props.filters.cr) : props.filters[field] || '' }
function choices(field) {
  const values = filterChoices(props.entries, field), selected = currentValue(field)
  if (selected && !values.some(value => value.toLowerCase() === selected.toLowerCase())) values.push(selected)
  return values
}
function selectedValue(field) { return choices(field).find(value => value.toLowerCase() === currentValue(field).toLowerCase()) || '' }
function update(key, value) { emit('update', { key, value }) }
</script>
