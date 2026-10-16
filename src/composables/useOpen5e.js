import { normalizeRecord, computeDiff } from '../utils/comparison.js'
import { canonicalName, entrySlug, aliasesFor } from '../utils/entryIdentity.js'

export { normalizeRecord, computeDiff, statRows, schoolName, spellLevel, speciesSize, speciesSpeed } from '../utils/comparison.js'
export { wordDiff } from '../utils/wordDiff.js'

const BASE = 'https://api.open5e.com'
const cache = new Map()
const CACHE_MS = 5 * 60 * 1000
const MAX_PAGES = 10

export const CATEGORIES = Object.fromEntries([
  ['Spell', 'spells', 'Spells'], ['Condition', 'conditions', 'Conditions'],
  ['Feat', 'feats', 'Feats'], ['Creature', 'creatures', 'Creatures'],
  ['MagicItem', 'magicitems', 'Magic Items'], ['Race', 'species', 'Species'],
].map(([key, endpoint, label]) => [key, { endpoint: `v2/${endpoint}`, label }]))

export function clearApiCache() { cache.clear() }

async function fetchPages(url, signal) {
  signal?.throwIfAborted()
  const cached = cache.get(url)
  if (cached && Date.now() - cached.time < CACHE_MS) return cached.data
  const controller = new AbortController()
  const abort = () => controller.abort(signal.reason)
  signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(() => controller.abort(new Error('Open5e request timed out. Please retry.')), 15000)
  try {
    let next = url
    const results = []
    const visited = new Set()
    while (next && visited.size < MAX_PAGES) {
      const parsed = new URL(next, BASE)
      if (parsed.origin !== BASE || !parsed.pathname.startsWith('/v2/')) throw new Error('Invalid Open5e pagination link.')
      next = parsed.href
      if (visited.has(next)) throw new Error('Open5e repeated a results page. Please retry.')
      visited.add(next)
      const response = await fetch(next, { signal: controller.signal })
      if (!response.ok) throw new Error(`Open5e returned HTTP ${response.status}. Please retry.`)
      const data = await response.json()
      if (!Array.isArray(data.results)) throw new Error('Open5e returned an unexpected response. Please retry.')
      results.push(...data.results)
      next = data.next || null
    }
    const data = { results, complete: !next }
    if (data.complete) {
      if (cache.size >= 30) cache.delete(cache.keys().next().value)
      cache.set(url, { time: Date.now(), data })
    }
    return data
  } catch (error) {
    if (controller.signal.aborted) throw controller.signal.reason
    throw error
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}

function makeEntry(category, a, b, availability = {}) {
  const v2014 = normalizeRecord(category, a), v2024 = normalizeRecord(category, b)
  const base = v2014 || v2024
  return {
    slug: entrySlug(category, base.name), name: base.name, category, v2014, v2024,
    availability: { v2014: a ? 'found' : 'not-found', v2024: b ? 'found' : 'not-found', ...availability },
    fetchedAt: new Date().toISOString(), diffs: a && b ? computeDiff(category, v2014, v2024) : [],
  }
}

export function mapConditions(results) {
  const grouped = new Map()
  for (const condition of results) {
    const name = canonicalName('Condition', condition.name)
    if (!name) continue
    const pair = grouped.get(name) || [null, null]
    for (const [index, doc] of ['srd-2014', 'srd-2024'].entries()) {
      const description = condition.descriptions?.find(d => (d.document?.key || d.document) === doc)
      if (description) pair[index] = { key: `${doc}_${name}`, name: condition.name, desc: description.desc,
        document: { key: doc, name: `System Reference Document ${index ? '5.2' : '5.1'}` } }
    }
    grouped.set(name, pair)
  }
  return [...grouped.values()].filter(([a, b]) => a || b)
    .map(([a, b]) => makeEntry('Condition', a, b)).sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchAllConditions({ signal } = {}) {
  const data = await fetchPages(`${BASE}/v2/conditions/?limit=100`, signal)
  if (!data.complete) throw new Error('The conditions list was incomplete. Please retry.')
  return mapConditions(data.results)
}

export async function searchEntries(category, name, { signal } = {}) {
  if (!Object.hasOwn(CATEGORIES, category)) throw new Error('Choose a supported category.')
  const needle = name.trim()
  if (!needle) return { entries: [], warnings: [] }
  if (category === 'Condition') {
    const entries = (await fetchAllConditions({ signal })).filter(c => c.name.toLowerCase().includes(needle.toLowerCase()))
    return { entries, warnings: [] }
  }
  const endpoint = CATEGORIES[category].endpoint
  const names = aliasesFor(category, needle)
  const settled = await Promise.allSettled(['srd-2014', 'srd-2024'].map(async doc => {
    const pages = await Promise.all(names.map(query => fetchPages(`${BASE}/${endpoint}/?name__icontains=${encodeURIComponent(query)}&document__key__in=${doc}&limit=100`, signal)))
    return { results: pages.flatMap(p => p.results).filter(r => r.document?.key === doc), complete: pages.every(p => p.complete) }
  }))
  signal?.throwIfAborted()
  if (settled.every(r => r.status === 'rejected')) throw settled[0].reason
  const warnings = []
  const coverage = settled.map((r, i) => {
    if (r.status === 'rejected') { warnings.push(`${i ? '2024' : '2014'} source unavailable. Retry to complete the comparison.`); return 'unavailable' }
    if (!r.value.complete) { warnings.push('Results are limited to the first 1,000 entries per source. Use a more specific name.'); return 'incomplete' }
    return 'not-found'
  })
  const buckets = new Map()
  settled.forEach((result, edition) => {
    if (result.status !== 'fulfilled') return
    const seen = new Set()
    for (const record of result.value.results) {
      if (!record.key || !record.name || seen.has(record.key)) continue
      seen.add(record.key)
      const key = canonicalName(category, record.name)
      const bucket = buckets.get(key) || [[], []]
      bucket[edition].push(record)
      buckets.set(key, bucket)
    }
  })
  const entries = []
  for (const [key, [a, b]] of buckets) {
    if (a.length > 1 || b.length > 1) {
      warnings.push(`Multiple source entries named ${a[0]?.name || b[0]?.name}; shown separately.`)
      for (const [records, edition] of [[a, 0], [b, 1]]) for (const record of records) {
        const entry = makeEntry(category, edition ? null : record, edition ? record : null,
          { [edition ? 'v2014' : 'v2024']: 'ambiguous' })
        entry.slug = `${key}-${record.key}`
        entries.push(entry)
      }
    } else entries.push(makeEntry(category, a[0], b[0], {
      v2014: a.length ? 'found' : coverage[0], v2024: b.length ? 'found' : coverage[1],
    }))
  }
  if (!entries.length && warnings.length) throw new Error(warnings.join(' '))
  const exact = canonicalName(category, needle)
  entries.sort((a, b) => Number(canonicalName(category, b.name) === exact) - Number(canonicalName(category, a.name) === exact) || a.name.localeCompare(b.name))
  return { entries, warnings: [...new Set(warnings)] }
}
