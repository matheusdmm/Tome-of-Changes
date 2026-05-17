<template>
  <div class="max-w-[680px] mx-auto px-4 py-8 font-cinzel">

    <h2 class="text-gold-bright text-xl tracking-[0.15em] uppercase mb-2">Privacy & Data</h2>
    <p class="text-parchment/40 text-[0.75rem] tracking-[0.1em] uppercase mb-8">In accordance with LGPD (Lei Geral de Proteção de Dados)</p>

    <section class="mb-8">
      <h3 class="text-gold text-[0.8rem] tracking-[0.15em] uppercase mb-3">Data stored on your device</h3>
      <p class="text-parchment/60 text-sm leading-relaxed mb-3">
        The following data is saved exclusively in your browser's local storage. It never leaves your device and is never sent to any server.
      </p>
      <ul class="flex flex-col gap-2">
        <li v-for="item in localData" :key="item.key" class="text-sm text-parchment/60 pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-gold/50">
          <span class="text-parchment/80">{{ item.label }}</span> — {{ item.desc }}
        </li>
      </ul>
    </section>

    <section class="mb-8">
      <h3 class="text-gold text-[0.8rem] tracking-[0.15em] uppercase mb-3">Anonymous usage analytics</h3>
      <p class="text-parchment/60 text-sm leading-relaxed">
        This site uses <span class="text-parchment/80">Vercel Analytics</span> to collect anonymous, aggregated usage data — such as page views and search events. No personal information is collected. Vercel may process metadata such as IP address and user agent solely for the purpose of generating anonymous statistics. For details, see
        <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener" class="text-gold/70 hover:text-gold transition-colors">Vercel's Privacy Policy</a>.
      </p>
    </section>

    <section class="mb-8">
      <h3 class="text-gold text-[0.8rem] tracking-[0.15em] uppercase mb-3">Third-party API</h3>
      <p class="text-parchment/60 text-sm leading-relaxed">
        Game content is fetched from the <span class="text-parchment/80">Open5e API</span> (open5e.com). Search queries are sent to their servers to retrieve results. No personal data is included in these requests.
      </p>
    </section>

    <section class="mb-8">
      <h3 class="text-gold text-[0.8rem] tracking-[0.15em] uppercase mb-3">Your rights under LGPD</h3>
      <p class="text-parchment/60 text-sm leading-relaxed">
        You have the right to access, correct, and delete any data associated with you. Since all app data is stored locally on your device, you are in full control. You can delete it at any time using the button below.
      </p>
    </section>

    <section class="border-t border-gold/15 pt-8">
      <h3 class="text-gold text-[0.8rem] tracking-[0.15em] uppercase mb-3">Delete your data</h3>
      <p class="text-parchment/60 text-sm leading-relaxed mb-4">
        This will permanently remove all your favorites, recently viewed entries, and session notes from this browser.
      </p>
      <button
        v-if="!deleted"
        @click="confirmDelete = true"
        class="font-cinzel text-[0.7rem] tracking-[0.1em] uppercase py-2 px-5 border border-crimson/60 rounded-[1px] bg-transparent text-crimson-light cursor-pointer transition-all duration-200 hover:border-crimson hover:bg-crimson/10"
      >✕ Delete all my data</button>

      <div v-if="confirmDelete && !deleted" class="mt-4 flex items-center gap-4">
        <span class="text-parchment/50 text-[0.75rem] tracking-[0.05em]">Are you sure? This cannot be undone.</span>
        <button
          @click="deleteAllData"
          class="font-cinzel text-[0.7rem] tracking-[0.1em] uppercase py-1 px-4 border border-crimson rounded-[1px] bg-crimson/20 text-crimson-light cursor-pointer transition-all duration-200 hover:bg-crimson/30"
        >Confirm</button>
        <button
          @click="confirmDelete = false"
          class="font-cinzel text-[0.7rem] tracking-[0.1em] uppercase py-1 px-4 border border-gold/40 rounded-[1px] bg-transparent text-parchment/50 cursor-pointer transition-all duration-200 hover:border-gold hover:text-gold"
        >Cancel</button>
      </div>

      <div v-if="deleted" class="text-[0.75rem] tracking-[0.1em] text-gold/70 uppercase">✓ All data deleted</div>
    </section>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePageMeta } from '../composables/usePageMeta.js'

usePageMeta(
  'Privacy & Data | Tome of Changes',
  'Privacy policy and data management for Tome of Changes. LGPD compliant.',
)

const confirmDelete = ref(false)
const deleted = ref(false)

const localData = [
  { key: 'favorites',       label: 'Favorites',        desc: 'Entries you have saved for quick access' },
  { key: 'recently-viewed', label: 'Recently Viewed',  desc: 'The last 10 entries you looked up' },
  { key: 'notes',           label: 'Session Notes',    desc: 'Notes you have written on individual entries' },
]

function deleteAllData() {
  localStorage.removeItem('tome-favorites')
  localStorage.removeItem('tome-recently-viewed')
  localStorage.removeItem('tome-notes')
  confirmDelete.value = false
  deleted.value = true
}
</script>
