const BASE = 'https://api.open5e.com'

export const CATEGORIES = {
  Spell:     { endpoint: 'v2/spells',     label: 'Spells',      docField: 'document__key__in', doc14: 'srd-2014', doc24: 'srd-2024' },
  Condition: { endpoint: 'v2/conditions', label: 'Conditions',  docField: 'document__key__in', doc14: 'srd-2014', doc24: 'srd-2024' },
  Feat:      { endpoint: 'v2/feats',      label: 'Feats',       docField: 'document__key__in', doc14: 'srd-2014', doc24: 'srd-2024' },
  Creature:  { endpoint: 'v2/creatures',  label: 'Creatures',   docField: 'document__key__in', doc14: 'srd-2014', doc24: 'srd-2024' },
  MagicItem: { endpoint: 'v2/magicitems', label: 'Magic Items', docField: 'document__key__in', doc14: 'srd-2014', doc24: 'srd-2024' },
  Race:      { endpoint: 'v2/species',    label: 'Species',     docField: 'document__key__in', doc14: 'srd-2014', doc24: 'srd-2024' },
}

async function fetchByName(endpoint, name, docField, docKey) {
  const docFilter = docKey ? `&${docField}=${docKey}` : ''
  const url = `${BASE}/${endpoint}/?name__icontains=${encodeURIComponent(name)}${docFilter}&limit=10`
  const r = await fetch(url)
  if (!r.ok) return []   // 4xx/5xx → no results, not a crash
  const d = await r.json()
  return d.results || []
}

export async function searchEntries(category, name) {
  const cat = CATEGORIES[category]
  if (!cat) throw new Error(`Unknown category: ${category}`)
  const { endpoint: ep, docField, doc14, doc24 } = cat

  const [r2014, r2024, rAll] = await Promise.all([
    fetchByName(ep, name, docField, doc14),
    fetchByName(ep, name, docField, doc24),
    fetchByName(ep, name, docField, ''),
  ])

  // Fallback: if filtered result empty, match from unfiltered pool by doc key
  const fill = (filtered, all, frag) =>
    filtered.length ? filtered : all.filter(x => x.document?.key?.includes(frag))

  const res14 = fill(r2014, rAll, '2014')
  const res24 = fill(r2024, rAll, '2024')

  const map14 = Object.fromEntries(res14.map(x => [x.name.toLowerCase(), x]))
  const map24 = Object.fromEntries(res24.map(x => [x.name.toLowerCase(), x]))
  const names = new Set([...Object.keys(map14), ...Object.keys(map24)])

  return [...names].map(n => {
    const v2014 = map14[n] ? normalizeSpecies(map14[n]) : null
    const v2024 = map24[n] ? normalizeSpecies(map24[n]) : null
    const base  = v2014 || v2024
    return {
      slug:     base.key || base.slug || n,
      name:     base.name,
      category,
      v2014,
      v2024,
      diffs:    (v2014 && v2024) ? computeDiff(category, v2014, v2024) : [],
    }
  })
}

// For species, top-level desc is often empty in 2024 — build it from traits instead.
function normalizeSpecies(s) {
  if (!s?.traits?.length) return s
  const built = s.traits.map(t => `${t.name}: ${t.desc}`).join('\n\n')
  return { ...s, desc: s.desc ? `${s.desc}\n\n${built}` : built }
}

// ─── Diff logic ──────────────────────────────────────────────────────────────

export function computeDiff(category, a, b) {
  const changes = []

  if (category === 'Spell') {
    const lvlA = a.level ?? a.spell_level
    const lvlB = b.level ?? b.spell_level
    if (lvlA !== lvlB) changes.push(`Level: ${lvlA} → ${lvlB}`)
    if (a.casting_time !== b.casting_time) changes.push(`Casting time: "${a.casting_time}" → "${b.casting_time}"`)
    if (a.duration      !== b.duration)      changes.push(`Duration: "${a.duration}" → "${b.duration}"`)
    if (a.range         !== b.range)         changes.push(`Range: "${a.range}" → "${b.range}"`)
    if (schoolName(a.school) !== schoolName(b.school)) changes.push(`School: ${schoolName(a.school)} → ${schoolName(b.school)}`)
  }

  if (category === 'Creature') {
    if (a.challenge_rating_text !== b.challenge_rating_text) changes.push(`CR: ${a.challenge_rating_text} → ${b.challenge_rating_text}`)
  }

  if (category === 'Race') {
    const sizeA = speciesSize(a.traits), sizeB = speciesSize(b.traits)
    if (sizeA !== sizeB) changes.push(`Size: ${sizeA} → ${sizeB}`)
    const speedA = speciesSpeed(a.traits), speedB = speciesSpeed(b.traits)
    if (speedA !== speedB) changes.push(`Speed: ${speedA} → ${speedB}`)
  }

  // Universal: description word-level diff summary
  const descDiff = descChanged(a.desc, b.desc)
  if (descDiff) changes.push(descDiff)

  if (changes.length === 0) changes.push('Minor wording/formatting updates only')
  return changes
}

// Returns word-level diff tokens for inline highlight rendering
// Each token: { text, type: 'same' | 'removed' | 'added' }
export function wordDiff(textA, textB) {
  const wordsA = (textA || '').split(/(\s+)/)
  const wordsB = (textB || '').split(/(\s+)/)
  return diffWords(wordsA, wordsB)
}

function diffWords(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i+1][j+1] + 1 : Math.max(dp[i+1][j], dp[i][j+1])

  const tokens = []
  let i = 0, j = 0
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) {
      tokens.push({ text: a[i], type: 'same' }); i++; j++
    } else if (j < n && (i >= m || dp[i][j+1] >= (dp[i+1]?.[j] ?? 0))) {
      tokens.push({ text: b[j], type: 'added' }); j++
    } else {
      tokens.push({ text: a[i], type: 'removed' }); i++
    }
  }
  return tokens
}

function descChanged(a, b) {
  const diff = (b || '').length - (a || '').length
  if (Math.abs(diff) > 25) return `Description updated (${diff > 0 ? '+' : ''}${diff} chars)`
  return null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function schoolName(school) {
  if (!school) return '—'
  if (typeof school === 'string') return school
  return school.name || school.key || '—'
}

export function spellLevel(s) {
  const l = s?.level ?? s?.spell_level
  if (l === 0) return 'Cantrip'
  return l !== undefined ? String(l) : '—'
}

// Find a trait by its type tag (v2/species 2024) or by name (v2/species 2014)
function findTrait(traits, type, name) {
  if (!traits?.length) return null
  return traits.find(t => t.type === type) ?? traits.find(t => t.name?.toLowerCase() === name.toLowerCase()) ?? null
}

export function speciesSize(traits) {
  const t = findTrait(traits, 'SIZE', 'Size')
  if (!t?.desc) return '—'
  const m = t.desc.match(/\b(Tiny|Small|Medium|Large|Huge|Gargantuan)\b/i)
  return m ? m[1] : t.desc
}

export function speciesSpeed(traits) {
  const t = findTrait(traits, 'SPEED', 'Speed')
  if (!t?.desc) return '—'
  const m = t.desc.match(/(\d+)\s*(?:feet|ft)/i)
  return m ? `${m[1]} ft.` : t.desc
}

export const RANDOM_FACTS = [
  { text: "In D&D 2024, the term 'racial' was replaced by 'species' throughout all rules.", category: "Language Change" },
  { text: "The Lucky feat was redesigned — it no longer lets you cancel enemy advantage.", category: "Feat Change" },
  { text: "Weapon mastery properties are entirely new in 2024, giving martials more tactical options.", category: "New Mechanic" },
  { text: "In 2024, all conditions like Grappled and Frightened are formally defined in one unified glossary.", category: "Rules Clarity" },
  { text: "The 2024 PHB features 48 subclasses, up from 32 in 2014.", category: "Content" },
  { text: "Unarmed Strikes are now Light weapons in 2024, enabling two-weapon fighting without gear.", category: "Combat Change" },
  { text: "Exhaustion now applies -1 to all d20 tests per level, replacing 6 different effect thresholds.", category: "Rules Change" },
  { text: "The 2024 rules introduce the Bastion system — players can build and manage strongholds.", category: "New Mechanic" },
  { text: "In 2024, all spellcasters can swap prepared spells after any long rest by default.", category: "Spellcasting" },
  { text: "The Ranger was significantly redesigned in 2024, addressing years of community criticism.", category: "Class Change" },
  { text: "Concentration checks now use a fixed DC 10 in 2024, instead of half damage received.", category: "Rules Change" },
  { text: "The 2024 SRD is released under Creative Commons, not just the OGL.", category: "Legal Change" },
]
