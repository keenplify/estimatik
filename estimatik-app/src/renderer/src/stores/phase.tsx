import { create } from 'zustand'

interface PhaseState {
  phase: number
  setPhase: (to: number) => void
}

export const usePhaseStore = create<PhaseState>()((set) => ({
  phase: 0,
  setPhase: (to) => set({ phase: to })
}))
