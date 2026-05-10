import { watch, isRef, onUnmounted } from 'vue'

const DEFAULT_TITLE = 'Tome of Changes — D&D 5e 2014 vs 2024'
const DEFAULT_DESC  = 'Compare D&D 5e spells, feats, creatures, conditions, magic items, and species between the 2014 and 2024 editions. Word-level diffs, stat comparisons, and instant search.'

function setMeta(title, description) {
  document.title = title

  const set = (selector, attr, value) => {
    const el = document.querySelector(selector)
    if (el) el.setAttribute(attr, value)
  }

  set('meta[name="description"]',         'content', description)
  set('meta[property="og:title"]',        'content', title)
  set('meta[property="og:description"]',  'content', description)
  set('meta[property="og:url"]',          'content', window.location.href)
  set('meta[name="twitter:title"]',       'content', title)
  set('meta[name="twitter:description"]', 'content', description)
}

export function usePageMeta(title, description) {
  const resolve = v => (isRef(v) ? v.value : v)

  watch(
    [isRef(title) ? title : () => title, isRef(description) ? description : () => description],
    ([t, d]) => setMeta(t || DEFAULT_TITLE, d || DEFAULT_DESC),
    { immediate: true },
  )

  onUnmounted(() => setMeta(DEFAULT_TITLE, DEFAULT_DESC))
}
