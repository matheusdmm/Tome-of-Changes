const glossary = 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary/'
const origins = 'https://www.dndbeyond.com/sources/dnd/br-2024/character-origins'
const reviewedAt = '2026-10-16'

// Short, sourced notes about published rules. These are editorial explanations, not inferred diffs.
export const EDITION_GUIDE = [
  { title: 'Species and backgrounds', impact: 'Major', source: origins,
    summary: 'In the 2024 character origins rules, backgrounds provide ability score increases and an Origin feat. Species provide size, speed, creature type, and special traits. Species still have meaningful mechanics.' },
  { title: 'Background choices', impact: 'Major', source: origins,
    summary: 'Each background lists three ability scores: raise one by 2 and another by 1, or all three by 1. It also supplies two skill proficiencies, a tool proficiency, and equipment options. Check the specific background rather than assuming any ability combination is allowed.' },
  { title: 'Exhaustion', impact: 'Major', source: glossary,
    summary: 'In 2024, each Exhaustion level subtracts 2 from D20 Tests and 5 feet from Speed. Level 6 causes death. A Long Rest removes one level.' },
  { title: 'Concentration', impact: 'Moderate', source: glossary,
    summary: 'Damage requires a Constitution saving throw to maintain Concentration. Its DC is the greater of 10 or half the damage taken, rounded down, with a maximum DC of 30.' },
  { title: 'Unarmed Strikes', impact: 'Moderate', source: glossary,
    summary: 'An Unarmed Strike uses your body instead of a weapon. Its options include damage, grappling, and shoving. It does not gain the Light weapon property simply by being an Unarmed Strike.' },
  { title: 'Counterspell', impact: 'Major', source: 'https://www.dndbeyond.com/spells/2619072-counterspell',
    summary: 'The 2024 spell makes the target attempt a Constitution saving throw. On failure its spell has no effect and its casting action is wasted. A spell slot used for that interrupted spell is not expended. This is not an Arcana check by the Counterspell caster.' },
  { title: 'Lucky', impact: 'Moderate', source: 'https://www.dndbeyond.com/posts/1801-the-12-best-feats-for-warlocks-in-the-2024-players',
    summary: 'The 2024 Lucky feat provides Luck Points equal to Proficiency Bonus. Points can grant Advantage on your D20 Tests or impose Disadvantage on an attack roll against you. The pool is not fixed at two points for every level.' },
  { title: 'SRD coverage', impact: 'Minor', source: 'https://www.dndbeyond.com/srd', rulesVersion: 'SRD 5.1 / 5.2',
    summary: 'The SRDs contain a subset of the published books. An entry missing from a search may be outside that subset or have another name. Both SRD 5.1 and SRD 5.2 are available under CC BY 4.0.' },
].map(section => ({ ...section, reviewedAt, rulesVersion: section.rulesVersion || '2024 published rules' }))

export const RANDOM_FACTS = EDITION_GUIDE.map(section => ({
  text: section.summary, category: section.title, source: section.source,
  reviewedAt: section.reviewedAt, rulesVersion: section.rulesVersion,
}))
