import { describe, it, expect } from 'vitest'
import fixtures from './fixtures/open5e.json'
import { normalizeRecord, computeDiff, statRows, speciesSize } from '../../utils/comparison.js'
import { wordDiff, groupDiffTokens } from '../../utils/wordDiff.js'
import { mapConditions } from '../useOpen5e.js'

describe('Open5e v2 category fixtures (retrieved 2026-10-16)', () => {
  for (const category of ['Spell', 'Creature', 'Feat', 'MagicItem', 'Race']) {
    it(`normalizes both editions of ${category} without losing source identity`, () => {
      for (const doc of ['srd-2014', 'srd-2024']) {
        const raw = fixtures[category][doc]
        const result = normalizeRecord(category, raw)
        expect(result.key).toBe(raw.key)
        expect(result.document.key).toBe(doc)
        expect(result.comparisonText.length).toBeGreaterThan(10)
        expect(normalizeRecord(category, result).comparisonText).toBe(result.comparisonText)
      }
    })
  }
  it('maps condition descriptions into the two source editions', () => {
    const [condition] = mapConditions(fixtures.Condition)
    expect(condition.v2014.document.key).toBe('srd-2014')
    expect(condition.v2024.document.key).toBe('srd-2024')
  })
  it('includes feat benefits instead of only the introductory description', () => {
    expect(normalizeRecord('Feat', fixtures.Feat['srd-2024']).comparisonText).toContain('Grapple')
  })
  it('includes creature actions, legendary actions and numeric CR', () => {
    const a = fixtures.Creature['srd-2014'], b = fixtures.Creature['srd-2024']
    expect(normalizeRecord('Creature', b).comparisonText).toContain('Consume Memories')
    expect(normalizeRecord('Creature', b).comparisonText).toContain('legendary action')
    expect(statRows('Creature', a, b).find(r => r.label === 'CR').v24).toBe('10')
  })
  it('uses spell units, components and reaction conditions', () => {
    const rows = statRows('Spell', fixtures.Spell['srd-2014'], fixtures.Spell['srd-2024'])
    expect(rows.find(r => r.label === 'Range').v24).toBe('60 feet')
    expect(rows.find(r => r.label === 'Components').v24).toBe('S')
    expect(rows.find(r => r.label === 'Reaction trigger').v24).toContain('casting a spell')
    expect(normalizeRecord('Spell', fixtures.Spell['srd-2014']).comparisonText).not.toContain('Casting options')
  })
  it('compares upcasting, HP, AC, benefits, and action-only changes', () => {
    expect(computeDiff('Spell', { desc: 'Same', higher_level: '1d6' }, { desc: 'Same', higher_level: '2d6' })).toContain('Description changed; review highlights.')
    const a = { hit_points: 0, armor_class: 0, actions: [{ name: 'Bite', desc: '1d6' }] }
    const b = { hit_points: 10, armor_class: 12, actions: [{ name: 'Bite', desc: '2d6' }] }
    const changes = computeDiff('Creature', a, b)
    expect(changes).toContain('HP: 0 → 10')
    expect(changes).toContain('AC: 0 → 12')
    expect(changes).toContain('Description changed; review highlights.')
    expect(computeDiff('Creature', { actions: [{ name: 'Power', desc: 'Same', usage_limits: { type: 'PER_DAY', param: 1 } }] },
      { actions: [{ name: 'Power', desc: 'Same', usage_limits: { type: 'PER_DAY', param: 2 } }] })).toContain('Description changed; review highlights.')
  })
  it('does not classify equal-length mechanical changes as minor', () => {
    expect(computeDiff('Feat', { desc: 'Deal 1d6 damage.' }, { desc: 'Deal 2d6 damage.' })).toEqual(['Description changed; review highlights.'])
  })
  it('preserves size choices and tolerates missing fields', () => {
    expect(speciesSize([{ type: 'SIZE', desc: 'Medium or Small' }])).toBe('Medium or Small')
    expect(statRows('Creature', null, { challenge_rating: 0 })).toEqual([{ label: 'CR', v14: '—', v24: '0', changed: false }])
  })
})

describe('bounded word diff', () => {
  for (const [a, b] of [['', ''], ['', 'new'], ['removed', ''], ['A  B\nC', 'A B\nD'], [Array(2500).fill('old').join(' '), Array(2500).fill('new').join(' ')]]) {
    it(`reconstructs both original strings (${a.length}/${b.length} chars)`, () => {
      const tokens = groupDiffTokens(wordDiff(a, b))
      expect(tokens.filter(t => t.type !== 'added').map(t => t.text).join('')).toBe(a)
      expect(tokens.filter(t => t.type !== 'removed').map(t => t.text).join('')).toBe(b)
    })
  }
})
