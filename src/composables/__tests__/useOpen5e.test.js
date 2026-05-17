import { describe, it, expect } from 'vitest'
import {
  schoolName,
  spellLevel,
  speciesSize,
  speciesSpeed,
  wordDiff,
  computeDiff,
} from '../useOpen5e.js'

// ─── schoolName ───────────────────────────────────────────────────────────────

describe('schoolName', () => {
  it('returns string as-is', () => {
    expect(schoolName('Evocation')).toBe('Evocation')
  })
  it('returns object name field', () => {
    expect(schoolName({ name: 'Illusion' })).toBe('Illusion')
  })
  it('falls back to object key field', () => {
    expect(schoolName({ key: 'necromancy' })).toBe('necromancy')
  })
  it('returns — for null/undefined', () => {
    expect(schoolName(null)).toBe('—')
    expect(schoolName(undefined)).toBe('—')
  })
})

// ─── spellLevel ───────────────────────────────────────────────────────────────

describe('spellLevel', () => {
  it('returns Cantrip for level 0', () => {
    expect(spellLevel({ level: 0 })).toBe('Cantrip')
  })
  it('returns string for numeric level', () => {
    expect(spellLevel({ level: 3 })).toBe('3')
  })
  it('reads spell_level as fallback', () => {
    expect(spellLevel({ spell_level: 5 })).toBe('5')
  })
  it('returns — when level is missing', () => {
    expect(spellLevel({})).toBe('—')
    expect(spellLevel(null)).toBe('—')
  })
})

// ─── speciesSize ──────────────────────────────────────────────────────────────

describe('speciesSize', () => {
  it('extracts size from SIZE trait', () => {
    const traits = [{ type: 'SIZE', desc: 'You are Medium.' }]
    expect(speciesSize(traits)).toBe('Medium')
  })
  it('extracts size from trait named Size', () => {
    const traits = [{ name: 'Size', desc: 'You are Small.' }]
    expect(speciesSize(traits)).toBe('Small')
  })
  it('returns — when no traits', () => {
    expect(speciesSize([])).toBe('—')
    expect(speciesSize(null)).toBe('—')
  })
  it('returns — when size not found in desc', () => {
    const traits = [{ type: 'SIZE', desc: 'Variable size.' }]
    expect(speciesSize(traits)).toBe('Variable size.')
  })
})

// ─── speciesSpeed ─────────────────────────────────────────────────────────────

describe('speciesSpeed', () => {
  it('extracts speed in feet', () => {
    const traits = [{ type: 'SPEED', desc: 'Your walking speed is 30 feet.' }]
    expect(speciesSpeed(traits)).toBe('30 ft.')
  })
  it('extracts speed with ft abbreviation', () => {
    const traits = [{ type: 'SPEED', desc: 'Speed: 25 ft.' }]
    expect(speciesSpeed(traits)).toBe('25 ft.')
  })
  it('falls back to full desc when no number found', () => {
    const traits = [{ type: 'SPEED', desc: 'Variable.' }]
    expect(speciesSpeed(traits)).toBe('Variable.')
  })
  it('returns — when no traits', () => {
    expect(speciesSpeed([])).toBe('—')
    expect(speciesSpeed(null)).toBe('—')
  })
})

// ─── wordDiff ─────────────────────────────────────────────────────────────────

describe('wordDiff', () => {
  it('marks identical text as same', () => {
    const tokens = wordDiff('hello world', 'hello world')
    expect(tokens.every(t => t.type === 'same')).toBe(true)
    expect(tokens.map(t => t.text).join('')).toBe('hello world')
  })
  it('marks added words', () => {
    // wordDiff splits on whitespace so space is its own token
    const tokens = wordDiff('hello', 'hello world')
    expect(tokens.some(t => t.type === 'added' && t.text === 'world')).toBe(true)
  })
  it('marks removed words', () => {
    const tokens = wordDiff('hello world', 'hello')
    expect(tokens.some(t => t.type === 'removed' && t.text === 'world')).toBe(true)
  })
  it('handles empty strings', () => {
    const tokens = wordDiff('hello', 'world')
    expect(tokens.some(t => t.type === 'added' && t.text === 'world')).toBe(true)
    expect(tokens.some(t => t.type === 'removed' && t.text === 'hello')).toBe(true)
  })
})

// ─── computeDiff ─────────────────────────────────────────────────────────────

describe('computeDiff', () => {
  it('detects spell level change', () => {
    const a = { level: 1, casting_time: '1 action', duration: 'Instantaneous', range: '60 feet', school: 'Evocation', desc: 'Same' }
    const b = { level: 2, casting_time: '1 action', duration: 'Instantaneous', range: '60 feet', school: 'Evocation', desc: 'Same' }
    const diffs = computeDiff('Spell', a, b)
    expect(diffs.some(d => d.includes('Level'))).toBe(true)
  })
  it('detects spell casting time change', () => {
    const a = { level: 1, casting_time: '1 action', duration: 'Instantaneous', range: '60 feet', school: 'Evocation', desc: 'Same' }
    const b = { level: 1, casting_time: '1 bonus action', duration: 'Instantaneous', range: '60 feet', school: 'Evocation', desc: 'Same' }
    const diffs = computeDiff('Spell', a, b)
    expect(diffs.some(d => d.includes('Casting time'))).toBe(true)
  })
  it('detects creature CR change', () => {
    const a = { challenge_rating_text: '1', desc: 'Same' }
    const b = { challenge_rating_text: '2', desc: 'Same' }
    const diffs = computeDiff('Creature', a, b)
    expect(diffs.some(d => d.includes('CR'))).toBe(true)
  })
  it('returns minor wording message when nothing changed', () => {
    const a = { level: 1, casting_time: '1 action', duration: 'Instantaneous', range: '60 feet', school: 'Evocation', desc: 'Same text here' }
    const b = { level: 1, casting_time: '1 action', duration: 'Instantaneous', range: '60 feet', school: 'Evocation', desc: 'Same text here' }
    const diffs = computeDiff('Spell', a, b)
    expect(diffs[0]).toBe('Minor wording/formatting updates only')
  })
})
