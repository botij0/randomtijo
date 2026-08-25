import type { ComponentType } from 'react'
import type { Mode } from '../../domain/modes'
import type { Option, SpinPhase } from '../../domain/types'
import ClawMachine from './ClawMachine/ClawMachine'
import EliminationBoard from './Elimination/EliminationBoard'
import HorseRace from './HorseRace/HorseRace'
import Roulette from './Roulette/Roulette'
import Slots from './Slots/Slots'

type ModeViewProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
}

export const MODE_VIEWS: Record<Mode, ComponentType<ModeViewProps>> = {
  roulette: Roulette,
  slots: Slots,
  'horse-race': HorseRace,
  'claw-machine': ClawMachine,
  'elimination-board': EliminationBoard,
}
