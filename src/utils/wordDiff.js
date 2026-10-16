// Exact token LCS for bounded inputs; large replacements use a linear, lossless fallback.
export function wordDiff(textA = '', textB = '') {
  const a = (textA || '').match(/\s+|[^\s]+/g) || [], b = (textB || '').match(/\s+|[^\s]+/g) || []
  let start = 0, endA = a.length, endB = b.length
  while (start < endA && start < endB && a[start] === b[start]) start++
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB-- }
  const tokens = a.slice(0, start).map(text => ({ text, type: 'same' }))
  const m = endA - start, n = endB - start
  if (m * n > 1000000) {
    for (let i = start; i < endA; i++) tokens.push({ text: a[i], type: 'removed' })
    for (let i = start; i < endB; i++) tokens.push({ text: b[i], type: 'added' })
  } else {
    const dp = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1))
    for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) dp[i][j] = a[start + i] === b[start + j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    let i = 0, j = 0
    while (i < m || j < n) {
      if (i < m && j < n && a[start + i] === b[start + j]) { tokens.push({ text: a[start + i++], type: 'same' }); j++ }
      else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) tokens.push({ text: b[start + j++], type: 'added' })
      else tokens.push({ text: a[start + i++], type: 'removed' })
    }
  }
  for (let i = endA; i < a.length; i++) tokens.push({ text: a[i], type: 'same' })
  return tokens
}

export function groupDiffTokens(tokens) {
  const groups = []
  for (const token of tokens) {
    const previous = groups[groups.length - 1]
    if (previous?.type === token.type) previous.text += token.text
    else groups.push({ ...token })
  }
  return groups
}
