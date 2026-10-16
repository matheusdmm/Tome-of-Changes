<template>
  <article class="max-w-3xl mx-auto space-y-6 text-parchment/90 leading-relaxed">
    <h2 class="font-cinzel text-xl text-gold-bright">Privacy and data</h2>
    <section class="space-y-3">
      <h3 class="font-cinzel text-gold-bright">Saved on this device</h3>
      <p>Favorites (including source snapshots), session notes, campaign or character collections, recently viewed entries, and theme preference are stored in this browser. The app does not upload that saved data or your notes. Tabs on the same origin share updates; when they edit the same saved data, the last write wins.</p>
      <p>Downloaded backups contain your session notes and collection notes, along with the entries you saved. You choose where to store or share the file. Importing it restores that data to this browser.</p>
      <p>Keep private information out of search queries. Searches are part of shareable page URLs and are sent to Open5e to retrieve rules data. Copying an AI prompt copies rules and statistics; it does not include your session notes. You choose where to paste it.</p>
    </section>
    <section class="space-y-3">
      <h3 class="font-cinzel text-gold-bright">Usage analytics</h3>
      <p>The app includes Vercel Analytics for page views and search, favorite, sharing, and AI-prompt events. Custom events contain categories, counts, or actions, rather than note text or entry names. Page-view URLs can contain the searched rule name, filter choices, or a collection's identifier. The service receives browser/network metadata; see <a class="underline" href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel's analytics privacy information</a>. Analytics collection depends on the deployment's Vercel configuration.</p>
    </section>
    <section class="space-y-3">
      <h3 class="font-cinzel text-gold-bright">Other external requests</h3>
      <p>Rules come from <a class="underline" href="https://open5e.com/">Open5e</a>. Fonts load from Google Fonts. Those providers receive the network information needed to deliver their responses. The PT-BR navigation link opens the current page through Google Translate when you choose it.</p>
    </section>
    <section class="space-y-3">
      <h3 class="font-cinzel text-gold-bright">Delete saved data</h3>
      <p>This removes favorites, notes, collections, recent entries, and theme preference from this browser and clears them from the running app. It does not delete downloaded backup files, previously submitted analytics, or data you pasted into another service. You can restore saved entries and notes only if you kept a backup.</p>
      <button v-if="!confirmDelete" class="border border-crimson-light p-2" @click="confirmDelete = true">Delete all my data</button>
      <div v-else class="flex flex-wrap gap-4 items-center">
        <p>Delete all saved data? This cannot be undone.</p>
        <button class="border border-crimson-light p-2" @click="deleteAllData">Confirm deletion</button>
        <button class="underline" @click="confirmDelete = false">Cancel</button>
      </div>
      <p role="status" aria-live="polite">{{ message }}</p>
    </section>
    <RouterLink class="underline" to="/attribution">Rules sources and attribution</RouterLink>
  </article>
</template>
<script setup>
import { ref } from 'vue'
import { usePageMeta } from '../composables/usePageMeta.js'
import { resetStoredData } from '../composables/useStorage.js'
import { useFavorites } from '../composables/useFavorites.js'
import { useNotes } from '../composables/useNotes.js'
import { useRecentlyViewed } from '../composables/useRecentlyViewed.js'
import { useTheme } from '../composables/useTheme.js'
import { useCollections } from '../composables/useCollections.js'
useFavorites(); useNotes(); useRecentlyViewed(); useTheme(); useCollections()
usePageMeta('Privacy and data | Tome of Changes', 'How Tome of Changes stores personal notes, uses external services, and deletes saved browser data.')
const confirmDelete = ref(false), message = ref('')
function deleteAllData() {
  const success = resetStoredData()
  confirmDelete.value = false
  message.value = success ? 'All saved data deleted.' : 'This tab was cleared, but browser storage could not be deleted. Check permissions and retry.'
}
</script>
