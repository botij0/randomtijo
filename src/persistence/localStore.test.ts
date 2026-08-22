import { loadPicker, savePicker, STORAGE_KEY } from './localStore'
import type { StorageLike } from './localStore'

function memoryStore(initial?: Record<string, string>): StorageLike {
  const data = { ...(initial ?? {}) }
  return {
    getItem(key: string) {
      return data[key] ?? null
    },
    setItem(key: string, value: string) {
      data[key] = value
    },
  }
}

const sample = {
  options: [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
    { id: 'c', label: 'C' },
  ],
  mode: 'slots' as const,
}

describe('localStore', () => {
  it('restores options A, B, C and mode slots', () => {
    const storage = memoryStore({
      [STORAGE_KEY]: JSON.stringify({
        ...sample,
        winnerId: 'b',
        phase: 'revealed',
        history: ['a', 'b'],
      }),
    })

    expect(loadPicker(storage)).toEqual(sample)
  })

  it('does not restore winner or history fields', () => {
    const storage = memoryStore()
    savePicker(
      {
        ...sample,
      },
      storage,
    )
    const raw = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as Record<string, unknown>
    expect(raw.winnerId).toBeUndefined()
    expect(raw.history).toBeUndefined()
    expect(raw.phase).toBeUndefined()
    expect(loadPicker(storage)?.mode).toBe('slots')
  })

  it('restores horse-race as a valid mode', () => {
    const storage = memoryStore({
      [STORAGE_KEY]: JSON.stringify({
        options: sample.options,
        mode: 'horse-race',
      }),
    })

    expect(loadPicker(storage)).toEqual({
      options: sample.options,
      mode: 'horse-race',
    })
  })

  it('restores claw-machine as a valid mode', () => {
    const storage = memoryStore({
      [STORAGE_KEY]: JSON.stringify({
        options: sample.options,
        mode: 'claw-machine',
      }),
    })

    expect(loadPicker(storage)).toEqual({
      options: sample.options,
      mode: 'claw-machine',
    })
  })

  it('restores elimination-board as a valid mode', () => {
    const storage = memoryStore({
      [STORAGE_KEY]: JSON.stringify({
        options: sample.options,
        mode: 'elimination-board',
      }),
    })

    expect(loadPicker(storage)).toEqual({
      options: sample.options,
      mode: 'elimination-board',
    })
  })

  it('does not restore a retired plinko mode', () => {
    const storage = memoryStore({
      [STORAGE_KEY]: JSON.stringify({
        options: sample.options,
        mode: 'plinko',
      }),
    })

    expect(loadPicker(storage)).toBeNull()
  })

  it('fails open when storage throws', () => {
    const throwing: StorageLike = {
      getItem() {
        throw new Error('quota')
      },
      setItem() {
        throw new Error('quota')
      },
    }

    expect(loadPicker(throwing)).toBeNull()
    expect(() => savePicker(sample, throwing)).not.toThrow()
  })
})
