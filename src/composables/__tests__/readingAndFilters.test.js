import { describe, it, expect } from 'vitest'
import { wordDiff, groupDiffTokens, changedPassages } from '../../utils/wordDiff.js'
import { filterEntries, filterChoices } from '../../utils/entryFilters.js'
import { sourceDetails } from '../../utils/sourceDetails.js'

describe('changes-only reading', () => {
  it('preserves both source texts and every edit across varied insertions, deletions, and whitespace', () => {
    const variants = ['', 'one', 'one two three', 'one\n\ntwo\tthree', 'one one two one', 'ação 1d6 → 2d6', '  leading and trailing  ']
    for (const a of variants) for (const b of variants) {
      const tokens = groupDiffTokens(wordDiff(a, b)), changes = changedPassages(tokens)
      expect(tokens.filter(t => t.type !== 'added').map(t => t.text).join('')).toBe(a)
      expect(tokens.filter(t => t.type !== 'removed').map(t => t.text).join('')).toBe(b)
      expect(changes.filter(t => ['removed', 'added'].includes(t.type))).toEqual(tokens.filter(t => t.type !== 'same'))
    }
  })
  it('retains nearby context and both edits while collapsing distant unchanged text', () => {
    const prefix = Array.from({ length: 40 }, (_, i) => `start${i}`).join(' ')
    const suffix = Array.from({ length: 40 }, (_, i) => `end${i}`).join(' ')
    const full = groupDiffTokens(wordDiff(`${prefix} 1d6 ${suffix}`, `${prefix} 2d6 ${suffix}`))
    const changes = changedPassages(full)
    const text = changes.map(t => t.text).join('')
    expect(text).toContain('start39'); expect(text).toContain('end0')
    expect(text).toContain('1d6'); expect(text).toContain('2d6')
    expect(text).not.toContain('start0 '); expect(text).not.toContain('end39')
    expect(changes.filter(t => t.type === 'omitted')).toHaveLength(2)
    expect(full.map(t => t.text).join('')).toContain('start0')
    expect(changedPassages([{ text: 'Identical', type: 'same' }])).toEqual([])
  })
  it('keeps context on both sides of distant edits', () => {
    const tokens = [{ type: 'removed', text: 'old' }, { type: 'same', text: Array(60).fill('context ').join('') }, { type: 'added', text: 'new' }]
    const changes = changedPassages(tokens, 4)
    expect(changes.map(t => t.type)).toEqual(['removed', 'same', 'omitted', 'same', 'added'])
  })
})
describe('source details', () => {
  it('shows source versions and rejects executable links', () => {
    expect(sourceDetails({ document: { key: 'srd-2024', name: 'SRD', permalink: 'javascript:alert(1)' } })).toMatchObject({ url: 'https://www.dndbeyond.com/srd', version: 'SRD 5.2 · 2024 rules' })
    expect(sourceDetails({ document: { key: 'other', permalink: 'data:text/html,bad' } }).url).toBeNull()
    expect(sourceDetails(null)).toBeNull()
    expect(sourceDetails({}).name).toBe('Source not recorded')
  })
})
describe('edition-aware filters', () => {
  const spell = (name, a, b) => ({ category: 'Spell', name, v2014: a, v2024: b })
  const a = { desc: 'Same', level: 1, school: { name: 'Evocation' } }, b = { desc: 'Changed', level: 2, school: { name: 'Illusion' } }
  it('matches all selected fields within one edition and preserves its counterpart', () => {
    const entry = spell('Example', a, b)
    expect(filterEntries([entry], 'Spell', { level: '2', school: 'Illusion' })).toEqual([entry])
    expect(filterEntries([entry], 'Spell', { level: '1', school: 'Illusion' })).toEqual([])
    expect(entry.v2014).toBe(a)
  })
  it('distinguishes changed, unchanged and unavailable entries', () => {
    const entries = [spell('Changed', a, b), spell('Same', a, a), spell('Unpaired', a, null)]
    for (const [status, name] of [['changed', 'Changed'], ['unchanged', 'Same'], ['unpaired', 'Unpaired']]) expect(filterEntries(entries, 'Spell', { change: status }).map(e => e.name)).toEqual([name])
  })
  it('normalizes fractional CRs and keeps CR zero', () => {
    const entries = [{ category: 'Creature', v2014: { challenge_rating_text: '1/8', type: 'Beast' }, v2024: { challenge_rating: 0.125, type: { name: 'Beast' } } }, { category: 'Creature', v2024: { challenge_rating: 0, type: { name: 'Beast' } } }]
    expect(filterEntries(entries, 'Creature', { cr: '0', type: 'beast' })).toHaveLength(1)
    expect(filterEntries(entries, 'Creature', { cr: '0.125' })).toHaveLength(1)
    expect(filterChoices(entries, 'cr')).toEqual(['0', '0.125'])
  })
})
