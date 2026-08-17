import { validOptions } from '../domain/options'
import type { Mode, Option, PickerState, SpinPhase } from '../domain/types'

export const MAX_OPTIONS = 12

export type PickerAction =
  | { type: 'ADD_OPTION'; id: string }
  | { type: 'UPDATE_OPTION'; id: string; label: string }
  | { type: 'REMOVE_OPTION'; id: string }
  | { type: 'SET_MODE'; mode: Mode }
  | { type: 'START_SPIN'; winnerId: string }
  | { type: 'COMPLETE_SPIN' }
  | { type: 'HYDRATE'; options: Option[]; mode: Mode }

export function createInitialState(overrides: Partial<PickerState> = {}): PickerState {
  return {
    options: [
      { id: 'opt-1', label: 'Cafe Luna' },
      { id: 'opt-2', label: 'Pizza Palace' },
      { id: 'opt-3', label: 'Bowling Alley' },
    ],
    mode: 'roulette',
    phase: 'idle',
    winnerId: null,
    ...overrides,
  }
}

export function isSpinLocked(phase: SpinPhase): boolean {
  return phase === 'spinning'
}

export function canSpin(state: PickerState): boolean {
  return !isSpinLocked(state.phase) && validOptions(state.options).length >= 2
}

export function pickerReducer(state: PickerState, action: PickerAction): PickerState {
  switch (action.type) {
    case 'ADD_OPTION': {
      if (isSpinLocked(state.phase) || state.options.length >= MAX_OPTIONS) {
        return state
      }
      if (state.options.some((option) => option.id === action.id)) {
        return state
      }
      return {
        ...state,
        options: [...state.options, { id: action.id, label: '' }],
      }
    }
    case 'UPDATE_OPTION': {
      if (isSpinLocked(state.phase)) {
        return state
      }
      return {
        ...state,
        options: state.options.map((option) =>
          option.id === action.id ? { ...option, label: action.label } : option,
        ),
      }
    }
    case 'REMOVE_OPTION': {
      if (isSpinLocked(state.phase)) {
        return state
      }
      return {
        ...state,
        options: state.options.filter((option) => option.id !== action.id),
      }
    }
    case 'SET_MODE': {
      if (isSpinLocked(state.phase)) {
        return state
      }
      return { ...state, mode: action.mode }
    }
    case 'START_SPIN': {
      if (!canSpin(state)) {
        return state
      }
      const winner = validOptions(state.options).find((option) => option.id === action.winnerId)
      if (!winner) {
        return state
      }
      return {
        ...state,
        phase: 'spinning',
        winnerId: winner.id,
      }
    }
    case 'COMPLETE_SPIN': {
      if (state.phase !== 'spinning') {
        return state
      }
      return { ...state, phase: 'revealed' }
    }
    case 'HYDRATE': {
      return {
        options: action.options,
        mode: action.mode,
        phase: 'idle',
        winnerId: null,
      }
    }
    default: {
      return state
    }
  }
}
