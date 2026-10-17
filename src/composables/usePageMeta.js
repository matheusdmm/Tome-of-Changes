import { watch, unref } from 'vue'
import { useRoute } from 'vue-router'
const DEFAULT_TITLE = 'Tome Of Changes — See What Changed in D&D 2024'
const DEFAULT_DESC = 'Compare available SRD rules between the 2014 and 2024 editions.'
export function usePageMeta(title, description, { noindex = false } = {}) {
  const route = useRoute()
  watch(() => [unref(title), unref(description), route.fullPath, unref(noindex)], ([t, d, , excluded]) => {
    document.title = t || DEFAULT_TITLE
    const set = (selector, attr, value) => document.querySelector(selector)?.setAttribute(attr, value)
    const canonical = new URL(`https://www.tomeofchanges.com${route.path}`)
    // Keep content-changing parameters, including pagination, but omit tracking parameters.
    if (['browse', 'compare'].includes(route.name)) {
      for (const key of ['q', 'level', 'school', 'cr', 'type', 'change', 'page']) {
        const value = route.query[key]
        if (typeof value !== 'string' || !value.trim() || (key === 'q' && route.name !== 'browse')
          || (key === 'change' && value === 'all')) continue
        if (key === 'page') {
          const page = Number.parseInt(value, 10)
          if (page > 1) canonical.searchParams.set(key, String(page))
        } else canonical.searchParams.set(key, value.trim())
      }
    }
    const url = canonical.href
    set('link[rel="canonical"]', 'href', url)
    set('meta[name="description"]', 'content', d || DEFAULT_DESC)
    for (const prefix of ['og', 'twitter']) {
      const attribute = prefix === 'og' ? 'property' : 'name'
      set(`meta[${attribute}="${prefix}:title"]`, 'content', t || DEFAULT_TITLE)
      set(`meta[${attribute}="${prefix}:description"]`, 'content', d || DEFAULT_DESC)
    }
    set('meta[property="og:url"]', 'content', url)
    set('meta[name="robots"]', 'content', excluded || ['favorites', 'not-found'].includes(route.name) ? 'noindex,follow' : 'index,follow')
  }, { immediate: true, flush: 'post' })
}
