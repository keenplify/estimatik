import { Button, TextField } from '@mui/material'
import { useDataStore } from '@renderer/stores/data'
import { sendIpcMessage } from '@renderer/utils/promises'
import { useMutation } from '@tanstack/react-query'
import { SaveDialogOptions } from 'electron'
import { useState } from 'react'
import Save from '@mui/icons-material/Save'
import { usePhaseStore } from '@renderer/stores/phase'

export default function DataTraining() {
  const { predictionData, trainingData, bestCandidateFields, fields, setResult } = useDataStore()
  const { phase, setPhase } = usePhaseStore()
  const [path, setPath] = useState<string>('')
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
        path,
        layers
      })
    },
    onSuccess(data) {
      setResult(JSON.parse(data))
      setPhase(phase + 1)
    }
  })

  const selectPath = async () => {
    const path = await sendIpcMessage('save-dialog', {
      title: 'Select Model Path',
      defaultPath: 'model.keras',
      filters: [{ name: 'Keras Model', extensions: ['keras'] }]
    } as SaveDialogOptions)
    if (path?.filePath) {
      setPath(path.filePath)
    }
  }

  const isDisabled = !path || !layers || isPending

  return (
    <div className="flex flex-col gap-4 max-w-[512px]">
      <div className="flex gap-2">
        <TextField
          onChange={(e) => setPath(e.target.value)}
          value={path}
          className="grow"
          label="Model Path"
          disabled={isPending}
        />
        <Button variant="contained" onClick={selectPath} disabled={isPending}>
          <Save />
        </Button>
      </div>

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
