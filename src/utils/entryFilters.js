import { computeDiff, schoolName } from './comparison.js'
export function canonicalCR(value) {
  if (value == null || value === '') return ''
  const text = String(value), parts = text.split('/')
  const number = parts.length === 2 ? Number(parts[0]) / Number(parts[1]) : Number(text)
  return Number.isFinite(number) ? String(number) : text
}
export function crLabel(value) { return ({ '0.125': '1/8', '0.25': '1/4', '0.5': '1/2' })[canonicalCR(value)] || value }

export function changeStatus(entry) {
  if (!entry.v2014 || !entry.v2024) return 'unpaired'
  return computeDiff(entry.category, entry.v2014, entry.v2024).every(text => text === 'No changes detected in the compared fields.') ? 'unchanged' : 'changed'
}
export function filterEntries(entries, category, filters) {
  return entries.filter(entry => {
    if (filters.change && filters.change !== 'all' && changeStatus(entry) !== filters.change) return false
    return [entry.v2014, entry.v2024].filter(Boolean).some(record => {
      if (category === 'Spell') {
        if (filters.level !== '' && filters.level != null && String(record.level ?? record.spell_level) !== filters.level) return false
        if (filters.school && schoolName(record.school).toLowerCase() !== filters.school.toLowerCase()) return false
      }
      if (category === 'Creature') {
        if (filters.cr && canonicalCR(record.challenge_rating ?? record.challenge_rating_text) !== canonicalCR(filters.cr)) return false
        const type = typeof record.type === 'string' ? record.type : record.type?.name || record.type?.key
        if (filters.type && type?.toLowerCase() !== filters.type.toLowerCase()) return false
      }
      return true
    })
  })
}
export function filterChoices(entries, field) {
  const values = entries.flatMap(entry => [entry.v2014, entry.v2024].filter(Boolean).map(record => {
    if (field === 'school') return schoolName(record.school)
    if (field === 'cr') return canonicalCR(record.challenge_rating ?? record.challenge_rating_text)
    return typeof record.type === 'string' ? record.type : record.type?.name || record.type?.key
  })).filter(value => value != null && value !== '' && value !== '—').map(String)
  const number = value => value.includes('/') ? Number(value.split('/')[0]) / Number(value.split('/')[1]) : Number(value)
  return [...new Set(values)].sort((a, b) => field === 'cr' ? number(a) - number(b) : a.localeCompare(b))
}
