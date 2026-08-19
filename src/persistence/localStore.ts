import type { Mode, Option } from '../domain/types'

export const STORAGE_KEY = 'randomtijo.picker.v1'

export type PersistedPicker = {
  options: Option[]
  mode: Mode
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

const MODES: readonly Mode[] = ['roulette', 'slots']

function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value)
}

function parseOptions(value: unknown): Option[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 12) {
    return null
  }
  const options: Option[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') {
      return null
    }
    const record = item as Record<string, unknown>
    if (typeof record.id !== 'string' || typeof record.label !== 'string') {
      return null
    }
    options.push({ id: record.id, label: record.label })
  }
  return options
}

export function loadPicker(storage: StorageLike = localStorage): PersistedPicker | null {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    const record = parsed as Record<string, unknown>
    const options = parseOptions(record.options)
    if (!options || !isMode(record.mode)) {
      return null
    }
    return { options, mode: record.mode }
  } catch {
    return null
  }
}

export function savePicker(data: PersistedPicker, storage: StorageLike = localStorage): void {
  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        options: data.options,
        mode: data.mode,
      }),
    )
  } catch {
    // Fail open: in-memory editor remains usable.
  }
}
