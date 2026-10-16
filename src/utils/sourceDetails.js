export function sourceDetails(record) {
  if (!record) return null
  const document = record.document || {}
  const key = document.key || ''
  const version = key === 'srd-2014' ? 'SRD 5.1 · 2014 rules' : key === 'srd-2024' ? 'SRD 5.2 · 2024 rules' : key || 'Version not recorded'
  let url = null
  try {
    const candidate = new URL(document.permalink)
    if (['https:', 'http:'].includes(candidate.protocol)) url = candidate.href
  } catch { /* Older saved entries may have no source link. */ }
  if (!url && ['srd-2014', 'srd-2024'].includes(key)) url = 'https://www.dndbeyond.com/srd'
  return { name: document.name || 'Source not recorded', version, url, recordId: record.key || null }
}
