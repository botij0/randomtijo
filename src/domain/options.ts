import type { Option } from '../domain/types'

export const MAX_OPTIONS = 12

export function isValidLabel(label: string): boolean {
  return label.trim().length > 0
}

export function validOptions(options: readonly Option[]): Option[] {
  return options.filter((option) => isValidLabel(option.label))
}

export function createOptionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
