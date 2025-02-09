import { Button, TextField } from '@mui/material'
import { useDataStore } from '@renderer/stores/data'
import { sendIpcMessage } from '@renderer/utils/promises'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { usePhaseStore } from '@renderer/stores/phase'

export default function DataTraining() {
  const { predictionData, trainingData, bestCandidateFields, fields, setResult } = useDataStore()
  const { phase, setPhase } = usePhaseStore()
  const [layers, setLayers] = useState<number>(5)

  const dataMapper = (d: Record<string, string>) => {
    const res: Record<string, string> = {
      [fields[0]]: d[fields[0]],
      [fields[1]]: d[fields[1]]
    }

    for (const field of bestCandidateFields) {
      res[field] = d[field]
    }

    return res
  }

  const training = trainingData.map(dataMapper)
  const prediction = predictionData.map(dataMapper)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      return await sendIpcMessage<string>('training', training, prediction, {
        layers
      })
    },
    onSuccess(data) {
      setResult(JSON.parse(data))
      setPhase(phase + 1)
    }
  })
  const isDisabled = !layers || isPending

  return (
    <div className="flex flex-col gap-4 max-w-[512px]">
      <TextField
        type="number"
        label="Layers"
        onChange={(e) => setLayers(parseInt(e.target.value))}
        value={layers}
        disabled={isPending}
      />
      <Button variant="contained" onClick={() => mutate()} disabled={isDisabled}>
        {isPending ? 'Training...' : 'Train'}
      </Button>
    </div>
  )
}
