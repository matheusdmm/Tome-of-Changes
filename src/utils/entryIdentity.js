// Add only source-reviewed edition renames here, with a citation and a fixture test.
export const ENTRY_ALIASES = [
  { category: 'MagicItem', names: ['Deck of Many Things', 'Mysterious Deck'], source: 'https://www.dndbeyond.com/srd' },
  { category: 'MagicItem', names: ['Orb of Dragonkind', 'Dragon Orb'], source: 'https://www.dndbeyond.com/srd' },
]
const normalizeName = name => String(name || '').normalize('NFKC').toLowerCase()
  .replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim()
export function canonicalName(category, name) {
  const normalized = normalizeName(name)
  const alias = ENTRY_ALIASES.find(a => a.category === category && a.names.some(n => normalizeName(n) === normalized))
  return normalizeName(alias?.names[0] || normalized)
}
export function aliasesFor(category, name) {
  const alias = ENTRY_ALIASES.find(a => a.category === category && a.names.some(n => normalizeName(n) === normalizeName(name)))
  return alias?.names || [name]
}
export function entrySlug(category, name) { return canonicalName(category, name) }
export function entryKey(entry) { return `${entry.category}-${entry.slug || entrySlug(entry.category, entry.name)}` }
export function comparisonPath(entry) { return `/compare/${encodeURIComponent(entry.category)}/${encodeURIComponent(entry.name)}` }
