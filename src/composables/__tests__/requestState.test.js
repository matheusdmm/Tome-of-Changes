import { describe, it, expect, vi, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { useEntrySearch } from '../useEntrySearch.js'
import { searchEntries } from '../useOpen5e.js'
vi.mock('../useOpen5e.js', () => ({ searchEntries: vi.fn(), clearApiCache: vi.fn() }))
afterEach(() => vi.clearAllMocks())
describe('latest search state', () => {
  it('ignores an old response even when the transport ignores cancellation', async () => {
    let resolveOld
    searchEntries.mockImplementationOnce(() => new Promise(resolve => resolveOld = resolve))
      .mockResolvedValueOnce({ entries: [{ name: 'Latest' }], warnings: [] })
    const scope = effectScope(), state = scope.run(() => useEntrySearch())
    const old = state.run('Spell', 'Old')
    await state.run('Spell', 'Latest')
    resolveOld({ entries: [{ name: 'Old' }], warnings: [] })
    await old
    expect(state.results.value[0].name).toBe('Latest')
    expect(state.loading.value).toBe(false)
    scope.stop()
  })
  it('clears pending results and cancels on scope disposal', async () => {
    let resolveOld
    searchEntries.mockImplementation(() => new Promise(resolve => resolveOld = resolve))
    const scope = effectScope(), state = scope.run(() => useEntrySearch())
    const pending = state.run('Spell', 'Old')
    const signal = searchEntries.mock.calls[0][2].signal
    state.clear()
    expect(signal.aborted).toBe(true)
    resolveOld({ entries: [{ name: 'Old' }], warnings: [] })
    await pending
    expect(state.results.value).toEqual([])
    scope.stop()
  })
})
