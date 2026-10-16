import { watch, unref } from 'vue'
import { useRoute } from 'vue-router'
const DEFAULT_TITLE = 'Tome of Changes — D&D 5e 2014 vs 2024'
const DEFAULT_DESC = 'Compare available SRD rules between the 2014 and 2024 editions.'
export function usePageMeta(title, description) {
  const route = useRoute()
  watch(() => [unref(title), unref(description), route.fullPath], ([t, d]) => {
    document.title = t || DEFAULT_TITLE
    const set = (selector, attr, value) => document.querySelector(selector)?.setAttribute(attr, value)
    const url = `https://www.tomeofchanges.com${route.path}`
    set('link[rel="canonical"]', 'href', url)
    set('meta[name="description"]', 'content', d || DEFAULT_DESC)
    for (const prefix of ['og', 'twitter']) {
      const attribute = prefix === 'og' ? 'property' : 'name'
      set(`meta[${attribute}="${prefix}:title"]`, 'content', t || DEFAULT_TITLE)
      set(`meta[${attribute}="${prefix}:description"]`, 'content', d || DEFAULT_DESC)
    }
    set('meta[property="og:url"]', 'content', url)
    set('meta[name="robots"]', 'content', ['favorites', 'not-found'].includes(route.name) ? 'noindex,follow' : 'index,follow')
  }, { immediate: true, flush: 'post' })
}
