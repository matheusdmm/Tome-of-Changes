const EMPTY = '—'
const display = value => value == null || value === '' ? EMPTY : String(value)
const named = value => typeof value === 'string' ? value : value?.name || value?.key
const bonuses = object => object ? Object.entries(object).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key} ${value >= 0 ? '+' : ''}${value}`).join(', ') : null
export function schoolName(value) { return display(named(value)) }
export function spellLevel(s) {
  const level = s?.level ?? s?.spell_level
  return level === 0 ? 'Cantrip' : display(level)
}
function trait(traits, type, name) {
  return traits?.find(t => t.type === type) ?? traits?.find(t => t.name?.toLowerCase() === name.toLowerCase())
}
export function speciesSize(traits) {
  const desc = trait(traits, 'SIZE', 'Size')?.desc
  if (!desc) return EMPTY
  const sizes = desc.match(/\b(Tiny|Small|Medium|Large|Huge|Gargantuan)\b/gi)
  return sizes ? [...new Set(sizes)].join(' or ') : desc
}
export function speciesSpeed(traits) {
  const desc = trait(traits, 'SPEED', 'Speed')?.desc
  if (!desc) return EMPTY
  const matches = [...desc.matchAll(/(\d+)\s*(?:feet|ft)/gi)]
  return matches.length === 1 && !/\b(if|while|climb|swim|fly|burrow)\b/i.test(desc) ? `${matches[0][1]} ft.` : desc
}
function textSection(label, items) {
  if (!items?.length) return ''
  return `${label}\n${[...items].sort((a, b) => (a.order_in_statblock ?? 0) - (b.order_in_statblock ?? 0) || (a.name || '').localeCompare(b.name || ''))
    .map(t => {
      const usage = t.usage_limits ? `Usage: ${t.usage_limits.param ?? ''} ${String(t.usage_limits.type || '').replaceAll('_', ' ').toLowerCase()}` : ''
      const cost = t.legendary_action_cost == null ? '' : `Legendary action cost: ${t.legendary_action_cost}`
      const form = t.limited_to_form ? `Form: ${t.limited_to_form}` : ''
      return `${t.name || label}${t.action_type ? ` (${t.action_type.replaceAll('_', ' ').toLowerCase()})` : ''}: ${[t.desc, usage, cost, form].filter(Boolean).join('\n')}`
    }).join('\n\n')}`
}
export function normalizeRecord(category, raw) {
  if (!raw) return null
  const sections = [raw.desc || '']
  if (category === 'Spell' && raw.higher_level) sections.push(`At higher levels\n${raw.higher_level}`)
  if (category === 'Spell') {
    const options = (raw.casting_options || []).map(option => {
      const details = Object.entries(option).filter(([key, value]) => !['name', 'type'].includes(key) && value != null && value !== '')
        .map(([key, value]) => key === 'desc' ? value : `${key.replaceAll('_', ' ')}: ${value}`).join('; ')
      const type = String(option.type || 'Option').replace(/^slot_level_(\d+)$/, 'Spell slot level $1').replaceAll('_', ' ')
      return { name: option.name || type, desc: details }
    }).filter(option => option.desc)
    sections.push(textSection('Casting options', options))
  }
  if (category === 'Feat') sections.push(textSection('Benefits', raw.benefits))
  if (category === 'MagicItem' && raw.attunement_detail) sections.push(`Attunement\n${raw.attunement_detail}`)
  if (category === 'Race') sections.push(textSection('Traits', raw.traits))
  if (category === 'Creature') {
    sections.push(textSection('Traits', raw.traits), textSection('Actions', raw.actions))
    for (const [key, label] of [['reactions', 'Reactions'], ['legendary_actions', 'Legendary actions'], ['bonus_actions', 'Bonus actions']]) sections.push(textSection(label, raw[key]))
  }
  return { ...raw, comparisonText: sections.filter(Boolean).join('\n\n') }
}
function values(category, s) {
  if (!s) return {}
  if (category === 'Spell') return {
    Level: spellLevel(s), School: schoolName(s.school), 'Casting time': s.casting_time, 'Reaction trigger': s.reaction_condition,
    Range: s.range_text || (typeof s.range === 'number' ? `${s.range} ${s.range_unit || 'feet'}` : s.range),
    Duration: s.duration, Concentration: s.concentration == null ? null : s.concentration ? 'Yes' : 'No',
    Ritual: s.ritual == null ? null : s.ritual ? 'Yes' : 'No',
    Components: s.components || [s.verbal && 'V', s.somatic && 'S', s.material && 'M'].filter(Boolean).join(', '),
    Materials: s.material_specified, 'Material cost': s.material_cost,
    'Material consumed': s.material_consumed == null ? null : s.material_consumed ? 'Yes' : 'No',
    'Saving throw': s.saving_throw_ability, 'Damage roll': s.damage_roll, 'Damage types': s.damage_types?.map(named).sort().join(', '),
    'Attack roll': s.attack_roll == null ? null : s.attack_roll ? 'Yes' : 'No',
    'Target type': s.target_type, 'Target count': s.target_count,
    'Area shape': s.shape_type, 'Area size': s.shape_size == null ? null : `${s.shape_size} ${s.shape_size_unit || 'feet'}`,
  }
  if (category === 'Creature') return {
    CR: s.challenge_rating_text ?? s.challenge_rating, Type: named(s.type), Size: named(s.size),
    HP: s.hit_points == null ? null : `${s.hit_points}${s.hit_dice ? ` (${s.hit_dice})` : ''}`,
    AC: s.armor_class, Speed: s.speed ? Object.entries(s.speed).filter(([key]) => key !== 'unit').map(([k, v]) => `${k} ${v} ${s.speed.unit || 'feet'}`).join(', ') : null,
    ...Object.fromEntries(Object.entries(s.ability_scores || {}).map(([key, value]) => [key.toUpperCase(), value])),
    'Saving throws': bonuses(s.saving_throws), 'Skill bonuses': bonuses(s.skill_bonuses),
    Immunities: s.resistances_and_immunities?.damage_immunities_display, Resistances: s.resistances_and_immunities?.damage_resistances_display,
    Vulnerabilities: s.resistances_and_immunities?.damage_vulnerabilities_display, 'Condition immunities': s.resistances_and_immunities?.condition_immunities_display,
    Languages: s.languages?.as_string || (typeof s.languages === 'string' ? s.languages : null),
    'Darkvision range': s.darkvision_range, 'Blindsight range': s.blindsight_range, 'Tremorsense range': s.tremorsense_range,
    'Truesight range': s.truesight_range, Initiative: s.initiative_bonus,
  }
  if (category === 'Race') return { Size: speciesSize(s.traits), Speed: speciesSpeed(s.traits) }
  if (category === 'MagicItem') return { Rarity: named(s.rarity), Type: named(s.category || s.type), 'Requires attunement': s.requires_attunement == null ? null : String(s.requires_attunement) }
  if (category === 'Feat') return { Prerequisite: s.prerequisite || s.prerequisites, Type: named(s.type) }
  return {}
}
export function statRows(category, a, b) {
  const first = values(category, a), second = values(category, b)
  return [...new Set([...Object.keys(first), ...Object.keys(second)])].map(label => {
    const v14 = display(first[label]), v24 = display(second[label])
    return { label, v14, v24, changed: !!(a && b) && v14 !== v24 }
  }).filter(r => r.v14 !== EMPTY || r.v24 !== EMPTY)
}
export function computeDiff(category, a, b) {
  const changes = statRows(category, a, b).filter(r => r.changed).map(r => `${r.label}: ${r.v14} → ${r.v24}`)
  if (normalizeRecord(category, a)?.comparisonText !== normalizeRecord(category, b)?.comparisonText) changes.push('Description changed; review highlights.')
  return changes.length ? changes : ['No changes detected in the compared fields.']
}
