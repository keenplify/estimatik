import { TrainingResult } from '@renderer/types'
import { create } from 'zustand'

interface DataState {
  fullData: Record<string, string>[]
  unlabeledTrainingData: Record<string, string>[]
  trainingData: Record<string, string>[]
  predictionData: Record<string, string>[]
  units: Record<string, string>
  unlabeledFields: string[]
  highCorrelationFields: string[]
  setHighCorrelationFields: (fields: string[]) => void
  fields: string[]
  isSetup: boolean
  bestCandidateFields: string[]
  setBestCandidateFields: (fields: string[]) => void
  setup: (to: Record<string, string>[], fields?: string[]) => void
  result: TrainingResult | null
  setResult: (data: TrainingResult) => void
}

export const useDataStore = create<DataState>()((set) => ({
  fullData: [],
  trainingData: [],
  unlabeledTrainingData: [],
  predictionData: [],
  units: {},
  fields: [],
  unlabeledFields: [],
  isSetup: false,
  setup: (to, fields) => {
    const [_, ...unlabeledFields] = fields ?? []
    set({ fields, unlabeledFields })

    if (fields && to[0]) {
      set({ units: to[0] })
      delete to[0]
    }

    const fullData = to.filter((v) => v && Object.entries(v).length > 0)

    set({
      isSetup: true,
      fullData,
      trainingData: fields && fullData.filter((v) => v[fields[1]] != ''),
      unlabeledTrainingData:
        fields &&
        fullData
          .filter((v) => v[fields[1]] != '')
          .map((v) => {
            const opt = {}

            for (const [key, val] of Object.entries(v)) {
              if (key != fields[0]) {
                opt[key] = val
              }
            }

            return opt
          }),
      predictionData: fields && fullData.filter((v) => v[fields[1]] == '')
    })
  },
  highCorrelationFields: [],
  setHighCorrelationFields: (fields) => set({ highCorrelationFields: fields }),
  bestCandidateFields: [],
  setBestCandidateFields: (fields) => set({ bestCandidateFields: fields }),
  result: null,
  setResult: (data) => set({ result: data }),
}))
