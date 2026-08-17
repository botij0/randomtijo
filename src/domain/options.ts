import type { Option } from '../domain/types'

export function isValidLabel(label: string): boolean {
  return label.trim().length > 0
}

export function validOptions(options: readonly Option[]): Option[] {
  return options.filter((option) => isValidLabel(option.label))
}
