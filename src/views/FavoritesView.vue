<template>
  <div class="space-y-6">
    <h1 class="font-cinzel text-xl text-gold-bright">Favorites and collections</h1>
    <BackupControls :collection-id="selectedId" />
    <section aria-label="Collections" class="border border-gold/30 p-4 space-y-4">
      <nav aria-label="Saved entry collections" class="flex flex-wrap gap-3">
        <RouterLink :to="{ name: 'favorites' }" class="underline" :aria-current="!selectedId ? 'page' : undefined">All saved ({{ favorites.length }})</RouterLink>
        <RouterLink v-for="collection in collections" :key="collection.id" :to="{ name: 'favorites', query: { collection: collection.id } }" class="underline" :aria-current="selectedId === collection.id ? 'page' : undefined">{{ collection.name }} ({{ collection.items.length }})</RouterLink>
      </nav>
      <form class="flex flex-wrap gap-2" @submit.prevent="create">
        <label class="sr-only" :for="`${id}-new`">New collection name</label>
        <input :id="`${id}-new`" v-model="newName" maxlength="80" required placeholder="New campaign or character collection" class="bg-input-bg border border-gold/40 p-2 flex-1 min-w-0" />
        <button class="border border-gold/50 px-3 py-2">Create collection</button>
      </form>
      <div v-if="selected" class="space-y-4">
        <form class="flex flex-wrap gap-2" @submit.prevent="rename">
          <label :for="`${id}-rename`" class="self-center">Collection name</label>
          <input :id="`${id}-rename`" v-model="renameName" maxlength="80" required class="bg-input-bg border border-gold/40 p-2" />
          <button class="border border-gold/50 px-3 py-2">Rename collection</button>
        </form>
        <label class="block">Collection notes<textarea v-model="collectionNote" maxlength="10000" rows="3" class="block mt-2 w-full bg-input-bg border border-gold/40 p-2" /></label>
        <div class="flex flex-wrap items-center gap-4">
          <p>{{ reviewedCount }} of {{ selected.items.length }} entries reviewed</p>
          <label>Show <select :value="reviewFilter" class="bg-input-bg border border-gold/40 p-2" @change="router.replace({ query: { ...route.query, reviewed: $event.target.value || undefined, page: undefined } })"><option value="">All entries</option><option value="pending">Not reviewed</option><option value="reviewed">Reviewed</option></select></label>
          <button class="underline" @click="confirmDelete = true">Delete collection</button>
        </div>
        <div v-if="confirmDelete" class="border border-crimson-light p-3 space-y-3">
          <p>Delete this collection and its collection notes? Saved entries and entry notes will be kept.</p>
          <button class="border border-crimson-light px-3 py-2 mr-4" @click="removeCollection">Confirm collection deletion</button><button class="underline" @click="confirmDelete = false">Cancel deletion</button>
        </div>
      </div>
      <p v-else-if="selectedId" role="alert">Collection not found. Choose another collection or All saved.</p>
      <p v-else class="text-sm text-parchment/80">Use the Collections control on any comparison to assign it to one or more collections. Existing favorites stay in All saved.</p>
      <p v-if="error" role="alert">{{ error }}</p>
    </section>
    <div v-for="item in visibleEntries" :key="item.key" class="space-y-2">
      <div v-if="selected" class="flex flex-wrap gap-4 items-center text-parchment/90">
        <label class="flex items-center gap-2"><input type="checkbox" :checked="item.reviewed" :aria-label="`Mark ${item.entry.name} as reviewed`" @change="setReviewed(selected.id, item.entry, $event.target.checked)" /> Reviewed</label>
        <button class="underline" @click="toggleMembership(selected.id, item.entry)">Remove from this collection</button>
      </div>
      <EntryCard :entry="item.entry" />
    </div>
    <p v-if="!visibleEntries.length" class="text-center py-8 text-parchment/80">{{ selectedId ? 'No entries match this collection view. Add entries using the Collections control on a comparison.' : 'No favorites saved yet. Search or browse entries and choose Save.' }}</p>
    <nav v-if="pageCount > 1" aria-label="Saved entry pages" class="flex justify-center items-center gap-4">
      <button :disabled="page <= 1" @click="setPage(page - 1)">Previous</button><span>Page {{ page }} of {{ pageCount }}</span><button :disabled="page >= pageCount" @click="setPage(page + 1)">Next</button>
    </nav>
  </div>
</template>
<script setup>
import { ref, computed, watch, useId } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EntryCard from '../components/EntryCard.vue'
import BackupControls from '../components/BackupControls.vue'
import { useFavorites } from '../composables/useFavorites.js'
import { useCollections } from '../composables/useCollections.js'
import { usePageMeta } from '../composables/usePageMeta.js'
import { entryKey } from '../utils/entryIdentity.js'
usePageMeta('Tome Of Changes — Favorites and Collections', 'Saved comparisons, collection checklists, notes, and backup tools.')
const route = useRoute(), router = useRouter(), id = useId()
const { favorites } = useFavorites()
const { collections, createCollection, renameCollection, deleteCollection, saveCollectionNote, setReviewed, entriesFor, toggleMembership } = useCollections()
const newName = ref(''), renameName = ref(''), error = ref(''), confirmDelete = ref(false)
const selectedId = computed(() => typeof route.query.collection === 'string' ? route.query.collection : '')
const selected = computed(() => collections.value.find(c => c.id === selectedId.value))
const reviewFilter = computed(() => ['pending', 'reviewed'].includes(route.query.reviewed) ? route.query.reviewed : '')
const reviewedCount = computed(() => selected.value?.items.filter(i => i.reviewed).length || 0)
const collectionNote = computed({ get: () => selected.value?.note || '', set: value => saveCollectionNote(selectedId.value, value) })
const matchingEntries = computed(() => selectedId.value ? entriesFor(selectedId.value).filter(item => !reviewFilter.value || item.reviewed === (reviewFilter.value === 'reviewed')) : favorites.value.map(entry => ({ entry, key: entryKey(entry) })))
const pageCount = computed(() => Math.max(1, Math.ceil(matchingEntries.value.length / 10)))
const page = computed(() => Math.min(pageCount.value, Math.max(1, Number.parseInt(route.query.page, 10) || 1)))
const visibleEntries = computed(() => matchingEntries.value.slice((page.value - 1) * 10, page.value * 10))
function setPage(number) { router.replace({ query: { ...route.query, page: String(number) } }) }
watch(() => `${selected.value?.id || ''}\0${selected.value?.name || ''}`, () => { renameName.value = selected.value?.name || ''; confirmDelete.value = false }, { immediate: true })
function create() {
  error.value = ''
  try { const collection = createCollection(newName.value); newName.value = ''; router.replace({ query: { collection } }) }
  catch (reason) { error.value = reason.message }
}
function rename() { error.value = ''; try { renameCollection(selectedId.value, renameName.value) } catch (reason) { error.value = reason.message } }
function removeCollection() { deleteCollection(selectedId.value); confirmDelete.value = false; router.replace({ query: {} }) }
</script>
