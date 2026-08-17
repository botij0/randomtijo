export type Mode = 'roulette' | 'plinko' | 'slots'

export type SpinPhase = 'idle' | 'spinning' | 'revealed'

export type Option = {
  id: string
  label: string
}

/** Returns a number in [0, 1). */
export type Rng = () => number

export type PickerState = {
  options: Option[]
  mode: Mode
  phase: SpinPhase
  winnerId: string | null
}
